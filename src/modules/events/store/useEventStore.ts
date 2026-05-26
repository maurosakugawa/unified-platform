/**
 * Zustand store responsável pelo gerenciamento
 * dos eventos da aplicação.
 *
 * @author Mauro Sakugawa
 * @created 2026-05-21
 * @license MIT
 * @version 2.0.0
 */
import { create } from "zustand";

import type { Event, } from "../types/event.types";
import { getAllEvents, saveEvent, updateEvent as updateEventDB, deleteEvent as deleteEventDB, } from "../services/eventDb.service";
import { addToQueue, } from "../../../services/storage/queue.service";

interface EventStore {
  events: Event[];

  hydrateEvents: () => Promise<void>;

  setEvents: ( events: Event[] ) => void;

  addEvent: ( event: Event ) => Promise<void>;

  updateEvent: ( event: Event ) => Promise<void>;

  removeEvent: ( id: string ) => Promise<void>;

  markReminderAsSent: ( id: string ) => Promise<void>;

}

export const useEventStore =
  create<EventStore>((set, get) => ({
    events: [],

    /**
     * Carrega eventos do IndexedDB
     */
    hydrateEvents: async () => {
      const events = await getAllEvents();

      set({ events, });
    },

    /**
     * Define a lista de eventos (substitui todo o estado)
     */
    setEvents: (events) => {
      set({ events });
    },

    /**
     * Adiciona evento
     */
    addEvent: async (event) => {
      await saveEvent(event);

      await addToQueue({
        id: crypto.randomUUID(),
        action: "create",
        payload: event,
        createdAt:
          new Date().toISOString(),
      });

      set((state) => ({
        events: [
          ...state.events,
          event,
        ],
      }));
    },

    /**
     * Atualiza evento
     */
    updateEvent: async (
      updatedEvent
    ) => {
      await updateEventDB(
        updatedEvent
      );

      await addToQueue({
        id: crypto.randomUUID(),
        action: "update",
        payload: updatedEvent,
        createdAt:
          new Date().toISOString(),
      });

      set((state) => ({
        events:
          state.events.map((event) =>
            event.id === updatedEvent.id
              ? updatedEvent
              : event
          ),
      }));
    },

    /**
     * Remove evento
     */
    removeEvent: async (id) => {
      await deleteEventDB(id);

      await addToQueue({
        id: crypto.randomUUID(),
        action: "delete",
        payload: { id },
        createdAt:
          new Date().toISOString(),
      });

      set((state) => ({
        events:
          state.events.filter(
            (event) =>
              event.id !== id
          ),
      }));
    },
    /**
     * Marca reminder como enviado
     */
    markReminderAsSent:
      async (id) => {
        const event =
          get().events.find(
            (event) =>
              event.id === id
          );

        if (!event) {
          return;
        }

        const updatedEvent = {
          ...event,
          reminderSent: true,
        };

        await updateEventDB(
          updatedEvent
        );

        set((state) => ({
          events:
            state.events.map((event) =>
              event.id === id
                ? updatedEvent
                : event
            ),
        }));
      },
  }));