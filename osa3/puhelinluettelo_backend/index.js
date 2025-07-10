const express = require('express')
const morgan = require('morgan')
const app = express()

app.use(express.json())

morgan.token('body', (req) => {
  return req.method === 'POST' ? JSON.stringify(req.body) : ''
})

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

const getRandomId = (max) => {
    return Math.floor(Math.random()* max)
}

let persons = [
    {
        "name": "Arto Hellas",
        "number": "040-123456",
        "id": "1"
    },
    {
        "name": "Ada Lovelace",
        "number": "39-44-5323523",
        "id": "2"
    },
    {
        "name": "Dan Abramov",
        "number": "12-43-234345",
        "id": "3"
    },
    {
        "name": "Mary Poppendieck",
        "number": "39-23-6423122",
        "id": "4"
    }
]

app.get('/', (request, response) => {
    response.send('<h1>Puhelinluettelo</h1>')
})

app.get('/info', (request, response) => {
    const date = new Date().toString()

    const content = 
            `<div>
                <p>Phonebook has info for ${persons.length} people</p>
                <p>${date}</p>
            </div>`

    response.send(content)
})

app.get('/api/persons', (request, response) => {
    response.json(persons)
})

app.get('/api/persons/:id', (request, response) => {
    const id = request.params.id
    const person = persons.find(person => person.id === id)

    if (person) {
        response.json(person)
    } else {
        response.status(404).end()
    }
})

app.delete('/api/persons/:id', (request, response) => {
    const id = request.params.id
    console.log(id)
    persons = persons.filter(person => person.id !== id)

    response.status(204).end()
})

app.post('/api/persons', (request, response) => {
    const body = request.body
    const unique = persons.find(person => person.name === body.name)

    if (!body.name) {
        return response.status(400).json({
            error: 'name is missing'
        })
    } 
    
    if (!body.number) {
        return response.status(400).json({
            error: 'number is missing'
        })
    }

    if (unique) {
        return response.status(400).json({
            error: 'name must be unique'
        })
    } 

    const person = {
        name: body.name,
        number: body.number,
        id: getRandomId(10000)
    }

    persons = persons.concat(person)

    response.json(person)
})

const PORT = 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
