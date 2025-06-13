const Persons = ({ persons, onDelete }) => (
  <div>
    {persons.map(p => (
      <p key={p.id}>
        {p.name} {p.number} <button onClick={() => onDelete(p.id)}>delete</button>
      </p>
    ))}
  </div>
)

export default Persons
