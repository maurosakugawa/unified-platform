// src/modules/events/pages/EventsPage.jsx
/* *
 * Events page for the events module
 * This page is responsible for rendering the events module.
 * @author Mauro Sakugawa
 * @version 1.0.0
 * @license MIT
 * Created on 2024-06-01
 */
import EventForm from '../components/EventForm'
import EventList from '../components/EventList'

export default function EventsPage() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">
        Eventos
      </h1>

      <EventForm />

      <EventList />
    </div>
  )
}