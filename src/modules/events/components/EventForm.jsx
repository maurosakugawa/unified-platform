// src/modules/events/components/EventForm.jsx
/* * 
 * Event form component for the events module
 * This component is responsible for rendering the form to create and edit events.
 * @author Mauro Sakugawa
 * @version 1.0.0   
 * @license MIT
 * 
 * Created on 2024-06-01
 */
import { useState } from 'react'
import { useEventStore } from '../store/useEventStore'
import { EVENT_CATEGORIES, EVENT_PRIORITIES, } from '../types/event.types'

export default function EventForm() {
  const addEvent = useEventStore((state) => state.addEvent)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    category: '',
    priority: '',
    contact: '',
    location: '',
    reminder: 30,
  })

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    addEvent({
      id: crypto.randomUUID(),
      ...formData,
      createdAt: new Date().toISOString(),
    })

    setFormData({
      title: '',
      description: '',
      date: '',
      time: '',
      category: '',
      priority: '',
      contact: '',
      location: '',
      reminder: 30,
    })
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="card bg-base-100 shadow-xl p-6 space-y-4"
    >
      <input
        type="text"
        name="title"
        placeholder="Título"
        className="input input-bordered w-full"
        value={formData.title}
        onChange={handleChange}
      />

      <textarea
        name="description"
        placeholder="Descrição"
        className="textarea textarea-bordered w-full"
        value={formData.description}
        onChange={handleChange}
      />

      <div className="grid grid-cols-2 gap-4">
        <input
          type="date"
          name="date"
          className="input input-bordered"
          value={formData.date}
          onChange={handleChange}
        />

        <input
          type="time"
          name="time"
          className="input input-bordered"
          value={formData.time}
          onChange={handleChange}
        />
      </div>

      <select
        name="category"
        className="select select-bordered w-full"
        value={formData.category}
        onChange={handleChange}
      >
        <option value="">Categoria</option>

        {EVENT_CATEGORIES.map((category) => (
          <option key={category}>
            {category}
          </option>
        ))}
      </select>

      <select
        name="priority"
        className="select select-bordered w-full"
        value={formData.priority}
        onChange={handleChange}
      >
        <option value="">Prioridade</option>

        {EVENT_PRIORITIES.map((priority) => (
          <option key={priority}>
            {priority}
          </option>
        ))}
      </select>

      <input
        type="text"
        name="contact"
        placeholder="Contato relacionado"
        className="input input-bordered w-full"
        value={formData.contact}
        onChange={handleChange}
      />

      <input
        type="text"
        name="location"
        placeholder="Local"
        className="input input-bordered w-full"
        value={formData.location}
        onChange={handleChange}
      />

      <input
        type="number"
        name="reminder"
        placeholder="Lembrete em minutos"
        className="input input-bordered w-full"
        value={formData.reminder}
        onChange={handleChange}
      />

      <button className="btn btn-primary">
        Salvar Evento
      </button>
    </form>
  )
}