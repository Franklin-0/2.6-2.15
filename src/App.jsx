import { useState, useEffect } from 'react'
import personService from './services/personService'
import PersonForm from './components/PersonForm'
import Persons from './components/Persons'
import Filter from './components/Filter'
import Notification from './components/Notification'

const App = () => {
  const [persons, setPersons] = useState([])
  const [newName, setNewName] = useState('')
  const [newNumber, setNewNumber] = useState('')
  const [filter, setFilter] = useState('')
  const [notification, setNotification] = useState({ message: null, type: null })

  useEffect(() => {
    personService
      .getAll()
      .then(initialPersons => setPersons(initialPersons))
      .catch(error => {
        showNotification('Failed to load contacts', 'error')
      })
  }, [])

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type })
    setTimeout(() => setNotification({ message: null, type: null }), 5000)
  }

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
            showNotification(`Updated ${updatedPerson.name}`)
          })
          .catch(error => {
            showNotification(`Information of ${existing.name} has already been removed from server`, 'error')
            setPersons(persons.filter(p => p.id !== existing.id))
          })
      }

    } else {
      personService
        .create(newPerson)
        .then(addedPerson => {
          setPersons(persons.concat(addedPerson))
          setNewName('')
          setNewNumber('')
          showNotification(`Added ${addedPerson.name}`)
        })
        .catch(error => {
          showNotification('Failed to add person', 'error')
        })
    }
  }

  const deletePerson = (id) => {
    const person = persons.find(p => p.id === id)
    if (!person) return

    if (window.confirm(`Delete ${person.name}?`)) {
      personService
        .remove(id)
        .then(() => {
          setPersons(persons.filter(p => p.id !== id))
          showNotification(`Deleted ${person.name}`)
        })
        .catch(error => {
          showNotification(`Failed to delete ${person.name}. They may have already been removed.`, 'error')
          setPersons(persons.filter(p => p.id !== id))
        })
    }
  }

  const personsToShow = filter
    ? persons.filter(p => p.name.toLowerCase().includes(filter.toLowerCase()))
    : persons

  return (
    <div>
      <h2>Phonebook</h2>

      <Notification message={notification.message} type={notification.type} />

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
