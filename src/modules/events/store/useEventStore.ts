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

import {
  saveToStorage,
  loadFromStorage,
} from "../../../services/storage/localStorage.service";

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

const STORAGE_KEY =
  "smart-planner-events";

/**
 * Carrega eventos do localStorage

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
}; */


export const useEventStore =
  create<EventStore>((set) => ({
    events: loadFromStorage<Event[]>(
      STORAGE_KEY,
      []
    ),

    addEvent: (event) =>
      set((state) => {
        const updated = [
          ...state.events,
          event,
        ];

        saveToStorage(
          STORAGE_KEY,
          updated
        );

        return {
          events: updated,
        };
      }),

    updateEvent: (
      updatedEvent
    ) =>
      set((state) => {
        const updated =
          state.events.map((event) =>
            event.id === updatedEvent.id
              ? updatedEvent
              : event
          );

        saveToStorage(
          STORAGE_KEY,
          updated
        );

        return {
          events: updated,
        };
      }),

    deleteEvent: (id) =>
      set((state) => {
        const updated =
          state.events.filter(
            (event) =>
              event.id !== id
          );

        saveToStorage(
          STORAGE_KEY,
          updated
        );

        return {
          events: updated,
        };
      }),

    markReminderAsSent: (
      id
    ) =>
      set((state) => {
        const updated =
          state.events.map((event) =>
            event.id === id
              ? {
                  ...event,
                  reminderSent: true,
                }
              : event
          );

        saveToStorage(
          STORAGE_KEY,
          updated
        );

        return {
          events: updated,
        };
      }),
  }));