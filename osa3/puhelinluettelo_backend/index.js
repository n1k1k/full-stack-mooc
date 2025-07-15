require('dotenv').config()
const express = require('express')
const Person = require('./models/person')

const app = express()

const morgan = require('morgan')
morgan.token('body', (req) => {
  return req.method === 'POST' ? JSON.stringify(req.body) : ''
})

app.use(express.json())
app.use(express.static('dist'))
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

const getRandomId = (max) => {
    return String(Math.floor(Math.random()* max))
}

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
    Person.find({}).then((people) => {
        response.json(people)
    })
})


app.get('/api/persons/:id', (request, response) => {
    const id = request.params.id
    Person.findById(id).then((person) => {
        response.json(person)
    })
})

app.delete('/api/persons/:id', (request, response) => {
    const id = request.params.id
    persons = persons.filter(person => person.id !== id)

    response.status(204).end()
})

app.post('/api/persons', (request, response) => {
    const body = request.body

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
    
    
    /*const unique = persons.find(person => person.name === body.name)
    if (unique) {
        return response.status(400).json({
            error: 'name must be unique'
        })
    }*/

    const person = new Person ({
        name: body.name,
        number: body.number,
    })

    person.save().then(savedPerson => {
        response.json(savedPerson)
    })
})

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
