import { useState, useEffect } from 'react'
import Person from './components/Person'
import PersonForm from './components/PersonFrom'
import personService from './services/persons'

const Filter = ({ filter, handleFilterChange }) => <div>filter shown with: <input value={filter} onChange={handleFilterChange} /></div>

const App = () => {
  const [persons, setPersons] = useState([])
  const [newName, setNewName] = useState('')
  const [newNumber, setNewNumber] = useState('')
  const [filter, setFilter ] = useState('')
  const personsToShow = persons.filter(person => person.name.toLowerCase().includes(filter.toLowerCase()))

  useEffect(() => {
    personService
      .getAll()
      .then(initialPersons => {
        setPersons(initialPersons)
      })
  }, [])

  const addName = (event) => {
    event.preventDefault()

    if (persons.some((person) => person.name === newName)) {
      alert(`${newName} is already added to phonebook`)
    } else {
      const personObject = {
        name: newName,
        number: newNumber
      }

      personService
        .create(personObject)
        .then(returnedPerson => {
          setPersons(persons.concat(returnedPerson))
          setNewName('')
          setNewNumber('')
        })
    }
  }

  const deleteNameOf = (id) => {
    const person = persons.find(p => p.id === id)
    const conf = confirm(`Delete ${person.name}?`)
    
    if (conf){
    personService
      .deletePerson(id)
      .then(returnedPerson => {
        setPersons(persons.filter(p => p.id !== returnedPerson.id))
      })
    }
  }

  const handleNameChange = (event) => {
    setNewName(event.target.value)
  }

  const handleNumberChange = (event) => {
    setNewNumber(event.target.value)
  }

  const handleFilterChange = (event) => {
    setFilter(event.target.value)
}

  return (
    <div>
      <h2>Phonebook</h2>
      <Filter filter={filter} handleFilterChange={handleFilterChange} />
      <h3>Add new</h3>
      <PersonForm addName={addName} newName={newName} newNumber={newNumber} handleNameChange={handleNameChange} handleNumberChange={handleNumberChange}/>
      <h3>Numbers</h3>
      <ul>
        {personsToShow.map(person => 
          <Person
            key={person.name}
            name={person.name}
            number={person.number}
            deletePerson={() => deleteNameOf(person.id)}
          />
          )}
      </ul>
    </div>
  )
}

export default App