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
}

export const useEventStore =
  create<EventStore>((set) => ({
    events: [],

    addEvent: (event) =>
      set((state) => ({
        events: [...state.events, event],
      })),

    removeEvent: (id) =>
      set((state) => ({
        events: state.events.filter(
          (event) => event.id !== id
        ),
      })),

    updateEvent: (updatedEvent) =>
      set((state) => ({
        events: state.events.map((event) =>
          event.id === updatedEvent.id
            ? updatedEvent
            : event
        ),
      })),
  }));