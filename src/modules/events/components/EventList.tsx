// src/modules/events/components/EventList.tsx
/**
 * 
 * @author Mauro Sakugawa
 * @created 2026-05-21
 * @license MIT License
 * @version 1.0.0
 */
import { useEventStore } from "../store/useEventStore";

import EventCard from "./EventCard";

import EmptyState from "../../../components/ui/EmptyState";

export default function EventList() {
  const events = useEventStore(
    (state) => state.events
  );

  const removeEvent = useEventStore(
    (state) => state.removeEvent
  );

  if (!events.length) {
    return <EmptyState />;
  }

  return (
    <div
      className="
        grid
        grid-cols-1
        xl:grid-cols-2
        gap-6
      "
    >
      {events.map((event) => (
        <EventCard
          key={event.id}
          event={event}
          onDelete={removeEvent}
        />
      ))}
    </div>
  );
}