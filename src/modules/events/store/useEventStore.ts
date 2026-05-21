// src/modules/events/store/useEventStore.ts
/**
 * 
 * @author Mauro Sakugawa
 * Date: 2026-05-21
 * License: MIT License
 * @version 1.0.0
 */
import { create } from 'zustand'

export const useEventStore = create((set) => ({
  events: [],

  addEvent: (event) =>
    set((state) => ({
      events: [...state.events, event],
    })),

  removeEvent: (id) =>
    set((state) => ({
      events: state.events.filter((event) => event.id !== id),
    })),

  updateEvent: (updatedEvent) =>
    set((state) => ({
      events: state.events.map((event) =>
        event.id === updatedEvent.id ? updatedEvent : event
      ),
    })),
}))