require('dotenv').config()
const express = require('express')
const Person = require('./models/person')

const app = express()

const morgan = require('morgan')
morgan.token('body', (req) => {
  return req.method === 'POST' ? JSON.stringify(req.body) : ''
})

const errorHandler = (error, request, response, next) => {
    console.error(error.message)

    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformed id' })
    } else if (error.name === 'ValidationError') {
        return response.status(400).send({ error: error.message })
    } else if (error.name === 'BadRequest') {
        return response.status(400).send({ error: error.message })
    }

    next(error)
}

app.use(express.static('dist'))
app.use(express.json())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

let persons = []

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


app.get('/api/persons/:id', (request, response, next) => {
    const id = request.params.id
    Person.findById(id).then((person) => {
        if (person) {
            response.json(person)
        } else {
            response.status(404).end()
        }
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndDelete(request.params.id)
        .then(result => {
            response.status(204).end()
        })
        .catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
    const body = request.body

    if (!body.name) {
        const error = new Error('name is missing')
        error.name = 'BadRequest'
        throw error
    }
    
    if (!body.number) {
        const error = new Error('number is missing')
        error.name = 'BadRequest'
        throw error
    }

    const person = new Person ({
        name: body.name,
        number: body.number,
    })

    person.save().then(savedPerson => {
        response.json(savedPerson)
        })
        .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
    const { name, number } = request.body
    console.log(name, number)

    Person.findById(request.params.id)
        .then(person => {
            if (!person) {
                response.status(404).end()
            }

            person.name = name
            person.number = number

            return person.save().then((updatePerson) => {
                response.json(updatePerson)
            })
        })
        .catch(error => next(error))
})

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
