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

  addEvent: (
    event: Event
  ) => void;

  updateEvent: (
    event: Event
  ) => void;

  deleteEvent: (
    id: string
  ) => void;

  markReminderAsSent: (
    id: string
  ) => void;
}

const LOCAL_STORAGE_KEY =
  "smart-planner-events";

/**
 * Carrega eventos do localStorage
 */
const loadEvents = (): Event[] => {
  const stored =
    localStorage.getItem(
      LOCAL_STORAGE_KEY
    );

  return stored
    ? JSON.parse(stored).map(
        (event: Event) => ({
          reminderSent: false,
          ...event,
        })
      )
    : [];
};

export const useEventStore =
  create<EventStore>((set) => ({
    events: loadEvents(),

    /**
     * Adiciona evento
     */
    addEvent: (event) =>
      set((state) => {
        const updatedEvents = [
          ...state.events,
          {
            ...event,
            reminderSent: false,
          },
        ];

        localStorage.setItem(
          LOCAL_STORAGE_KEY,
          JSON.stringify(updatedEvents)
        );

        return {
          events: updatedEvents,
        };
      }),

    /**
     * Atualiza evento
     */
    updateEvent: (
      updatedEvent
    ) =>
      set((state) => {
        const updatedEvents =
          state.events.map(
            (event) =>
              event.id ===
              updatedEvent.id
                ? updatedEvent
                : event
          );

        localStorage.setItem(
          LOCAL_STORAGE_KEY,
          JSON.stringify(updatedEvents)
        );

        return {
          events: updatedEvents,
        };
      }),

    /**
     * Remove evento
     */
    deleteEvent: (id) =>
      set((state) => {
        const updatedEvents =
          state.events.filter(
            (event) =>
              event.id !== id
          );

        localStorage.setItem(
          LOCAL_STORAGE_KEY,
          JSON.stringify(updatedEvents)
        );

        return {
          events: updatedEvents,
        };
      }),

    /**
     * Marca reminder como enviado
     */
    markReminderAsSent: (
      id
    ) =>
      set((state) => {
        const updatedEvents =
          state.events.map(
            (event) =>
              event.id === id
                ? {
                    ...event,
                    reminderSent: true,
                  }
                : event
          );

        localStorage.setItem(
          LOCAL_STORAGE_KEY,
          JSON.stringify(updatedEvents)
        );

        return {
          events: updatedEvents,
        };
      }),
  }));