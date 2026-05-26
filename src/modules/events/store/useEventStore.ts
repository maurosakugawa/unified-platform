// src/modules/events/store/useEventStore.ts

/**
 * Zustand store responsável pelo gerenciamento
 * dos eventos da aplicação.
 *
 * @author Mauro Sakugawa
 * @created 2026-05-21
 * @license MIT
 * @version 1.0.0
 */

import { create } from "zustand";

import type {
  Event,
} from "../types/event.types";

interface EventStore {
  events: Event[];

  addEvent: (event: Event) => void;

  removeEvent: (id: string) => void;

  updateEvent: (event: Event) => void;

  markAsReminded: (id: string) => void;
}

const LOCAL_STORAGE_KEY = "smart-planner-events";

const loadEvents = (): Event[] => {
  const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
}

export const useEventStore = create<EventStore>((set) => ({
  events: loadEvents(),

  addEvent: (event) =>
    set((state) => {
      const updateEvents = [...state.events, event];

      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updateEvents));

      return { events: updateEvents };
    }),

  removeEvent: (id) =>
    set((state) => {
      const updateEvents = state.events.filter((event) => event.id !== id);

      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updateEvents));

      return { events: updateEvents };
    }),

  updateEvent: (updatedEvent) =>
    set((state) => {
      const updatedEvents = state.events.map((event) =>
        event.id === updatedEvent.id ? updatedEvent : event
      );

      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedEvents));

      return { events: updatedEvents };
    }),

  markAsReminded: (id) =>
    set((state) => {
      const updatedEvents = state.events.map((event) =>
        event.id === id
          ? {
              ...event,
              reminded: true,
            }
          : event
      );

      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedEvents));

      return { events: updatedEvents };
    }),
}));
