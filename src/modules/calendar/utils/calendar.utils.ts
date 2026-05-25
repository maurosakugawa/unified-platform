// src/modules/calendar/utils/calendar.utils.ts
/**
 * 
 * @author Mauro Sakugawa
 * @created 2026-05-25
 * @license MIT
 * @version 1.0.0
 */
import type { Event } from "../../events/types/event.types";

import type { CalendarEvent } from "../types/calendar.types";

export function mapEventsToCalendar(
  events: Event[]
): CalendarEvent[] {
  return events.map((event) => {
    const start = new Date(
      `${event.date}T${event.time}`
    );

    const end = new Date(
      start.getTime() + 60 * 60 * 1000
    );

    return {
      title: event.title,
      start,
      end,
      resource: event,
    };
  });
}