// src/modules/events/store/useEventStore.js
/* * Event store for the events module
 * @author Mauro Sakugawa
 * @version 1.0.0
 * @license MIT
 * 
 * Created on 2024-06-01
 * */
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