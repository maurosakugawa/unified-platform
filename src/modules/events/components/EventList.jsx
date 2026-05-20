// src/modules/events/components/EventList.jsx
/* *
 * Event list component for the events module
 * This component is responsible for rendering the list of events.
 * @author Mauro Sakugawa
 * @version 1.0.0
 * @license MIT
 *
 * Created on 2024-06-01
 */
import { useEventStore } from '../store/useEventStore'

export default function EventList() {
  const events = useEventStore((state) => state.events)
  const removeEvent = useEventStore((state) => state.removeEvent)

  return (
    <div className="space-y-4">
      {events.map((event) => (
        <div
          key={event.id}
          className="card bg-base-100 shadow-md p-4"
        >
          <div className="flex justify-between">
            <div>
              <h2 className="font-bold text-lg">
                {event.title}
              </h2>

              <p>{event.description}</p>

              <p className="text-sm opacity-70">
                {event.date} às {event.time}
              </p>
            </div>

            <button
              className="btn btn-error btn-sm"
              onClick={() => removeEvent(event.id)}
            >
              Excluir
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}