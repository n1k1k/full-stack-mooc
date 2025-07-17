const mongoose = require('mongoose')

if (process.argv.length !== 3 && process.argv.length !==5 ) {
  console.log('All numbers: node mongo.js <password>')
  console.log('Add number: node mongo.js <password> <name> <number>')
  process.exit(1)
}

const password = process.argv[2]

const url = `mongodb+srv://nannailona:${password}@puhelinluettelo.muthoxa.mongodb.net/personApp?retryWrites=true&w=majority&appName=puhelinluettelo`

mongoose.set('strictQuery', false)
mongoose.connect(url)

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
})

const Person = mongoose.model('Person', personSchema)

if (process.argv.length === 3) {
  console.log('phonebook:')
  Person
    .find({})
    .then(result => {
      result.forEach(person => {
        console.log(`${person.name} ${person.number}`)
      })
      mongoose.connection.close()
    })
} else if (process.argv.length === 5) {
  const newName = process.argv[3]
  const newNumber = process.argv[4]

  const person = new Person({
    name: newName,
    number: newNumber
  })

  person.save().then(() => {
    console.log(`added ${person.name} number ${person.number} to phonebook`)
    mongoose.connection.close()
  })
}
