import { useState, useEffect } from 'react'
import './index.css'
import Notification from './components/Notification'
import Person from './components/Person'
import PersonForm from './components/PersonFrom'
import personService from './services/persons'

const Filter = ({ filter, handleFilterChange }) => <div>filter shown with: <input value={filter} onChange={handleFilterChange} /></div>

const App = () => {
  const [persons, setPersons] = useState([])
  const [newName, setNewName] = useState('')
  const [newNumber, setNewNumber] = useState('')
  const [filter, setFilter ] = useState('')
  const [message, setMessage] = useState({content: null, type:null})
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
      if (confirm(`${newName} is already added to phonebook, replace the old number with a new one`)) {
        const person = persons.find(p => p.name === newName)
        const changedPerson = { ...person, number: newNumber}

        personService
          .update(person.id, changedPerson)
          .then(returnedPerson => {
            setPersons(persons.map(p => p.id !== person.id ? p : returnedPerson))
            setNewName('')
            setNewNumber('')
            setMessage({content:`Updated number for ${newName}`, type:'info'})
            setTimeout(() => {
              setMessage({content: null, type:null})
            }, 5000)
          })
          .catch(error => {
            setMessage({content: `Information of ${person.name} has already been removed from server`, type:'error'})
            setTimeout(() => {
                  setMessage({content: null, type:null})
                }, 5000)
            setPersons(persons.filter(p => p.id !== person.id))
            })
          

      }
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
          setMessage({content:`Added ${newName}`, type:"info"})
          setTimeout(() => {
            setMessage({content: null, type:null})
          }, 5000)
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
        setPersons(persons.filter(p => p.id !== person.id))
        setMessage({content:`Deleted ${person.name}`, type:'info' })
        setTimeout(() => {
          setMessage({content: null, type:null})
        }, 5000)
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
      <Notification message={message} />
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