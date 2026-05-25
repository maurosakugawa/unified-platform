// src/modules/calendar/types/calendar.types.ts

export interface CalendarEvent {
  title: string;
  start: Date;
  end: Date;
  resource?: unknown;
}