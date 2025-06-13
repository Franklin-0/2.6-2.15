import { useState, useEffect } from 'react'
import personService from './services/personService'
import PersonForm from './components/PersonForm'
import Persons from './components/Persons'
import Filter from './components/Filter'

const App = () => {
  const [persons, setPersons] = useState([])
  const [newName, setNewName] = useState('')
  const [newNumber, setNewNumber] = useState('')
  const [filter, setFilter] = useState('')

  // Fetch data from backend on mount
  useEffect(() => {
    personService
      .getAll()
      .then(initialPersons => {
        setPersons(initialPersons)
      })
  }, [])

  // Handle form submission: add or update
  const addPerson = (event) => {
    event.preventDefault()

    const existing = persons.find(p => p.name.toLowerCase() === newName.toLowerCase())
    const newPerson = { name: newName, number: newNumber }

    if (existing) {
      const confirmUpdate = window.confirm(
        `${existing.name} is already in the phonebook. Replace the old number with the new one?`
      )

      if (confirmUpdate) {
        personService
          .update(existing.id, { ...existing, number: newNumber })
          .then(updatedPerson => {
            setPersons(persons.map(p => p.id !== existing.id ? p : updatedPerson))
            setNewName('')
            setNewNumber('')
          })
      }

    } else {
      personService
        .create(newPerson)
        .then(addedPerson => {
          setPersons(persons.concat(addedPerson))
          setNewName('')
          setNewNumber('')
        })
    }
  }

  // Delete a person by ID
  const deletePerson = (id) => {
    const person = persons.find(p => p.id === id)

    if (window.confirm(`Delete ${person.name}?`)) {
      personService
        .remove(id)
        .then(() => {
          setPersons(persons.filter(p => p.id !== id))
        })
    }
  }

  // Filter persons by search input
  const personsToShow = filter
    ? persons.filter(p => p.name.toLowerCase().includes(filter.toLowerCase()))
    : persons

  return (
    <div>
      <h2>Phonebook</h2>

      <Filter value={filter} onChange={e => setFilter(e.target.value)} />

      <h3>Add a new</h3>
      <PersonForm
        onSubmit={addPerson}
        name={newName}
        number={newNumber}
        handleNameChange={e => setNewName(e.target.value)}
        handleNumberChange={e => setNewNumber(e.target.value)}
      />

      <h3>Numbers</h3>
      <Persons persons={personsToShow} onDelete={deletePerson} />
    </div>
  )
}

export default App
