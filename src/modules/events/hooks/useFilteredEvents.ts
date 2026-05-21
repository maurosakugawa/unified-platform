// src/modules/events/hooks/useFilteredEvents.ts

/**
 * Hook responsável por:
 * - busca textual
 * - filtros
 * - ordenação
 *
 * @author Mauro Sakugawa
 * @created 2026-05-21
 * @license MIT
 * @version 1.0.0
 */

import { useMemo } from "react";

import { useEventStore } from "../store/useEventStore";

interface Params {
  search: string;

  category: string;

  priority: string;

  sortBy: string;
}

export function useFilteredEvents({
  search,
  category,
  priority,
  sortBy,
}: Params) {
  const events = useEventStore(
    (state) => state.events
  );

  return useMemo(() => {
    let filtered = [...events];

    /**
     * Busca textual
     */
    if (search) {
      filtered = filtered.filter((event) =>
        [
          event.title,
          event.description,
          event.location,
          event.contact,
        ]
          .join(" ")
          .toLowerCase()
          .includes(search.toLowerCase())
      );
    }

    /**
     * Categoria
     */
    if (category) {
      filtered = filtered.filter(
        (event) =>
          event.category === category
      );
    }

    /**
     * Prioridade
     */
    if (priority) {
      filtered = filtered.filter(
        (event) =>
          event.priority === priority
      );
    }

    /**
     * Ordenação
     */
    switch (sortBy) {
      case "date":
        filtered.sort((a, b) =>
          `${a.date} ${a.time}` >
          `${b.date} ${b.time}`
            ? 1
            : -1
        );
        break;

      case "priority":
        {
          const priorityOrder = {
            Alta: 0,
            Média: 1,
            Baixa: 2,
          };

          filtered.sort(
            (a, b) =>
              priorityOrder[a.priority] -
              priorityOrder[b.priority]
          );
        }
        break;

      case "title":
        filtered.sort((a, b) =>
          a.title.localeCompare(b.title)
        );
        break;

      case "created":
      default:
        filtered.sort((a, b) =>
          b.createdAt.localeCompare(
            a.createdAt
          )
        );
        break;
    }

    return filtered;
  }, [
    events,
    search,
    category,
    priority,
    sortBy,
  ]);
}