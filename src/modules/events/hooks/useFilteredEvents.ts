// src/modules/events/hooks/useFilteredEvents.ts

/**
 * Hook responsável por filtrar eventos
 *
 * @author Mauro Sakugawa
 * @created 2026-05-21
 * @license MIT
 * @version 1.0.0
 */

import { useMemo } from "react";

import { useEventStore } from "../store/useEventStore";

interface Filters {
  search: string;

  category: string;

  priority: string;
}

export function useFilteredEvents({
  search,
  category,
  priority,
}: Filters) {
  const events = useEventStore(
    (state) => state.events
  );

  return useMemo(() => {
    return events.filter((event) => {
      const matchesSearch =
        event.title
          .toLowerCase()
          .includes(
            search.toLowerCase()
          ) ||
        event.description
          .toLowerCase()
          .includes(
            search.toLowerCase()
          );

      const matchesCategory =
        !category ||
        event.category === category;

      const matchesPriority =
        !priority ||
        event.priority === priority;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesPriority
      );
    });
  }, [
    events,
    search,
    category,
    priority,
  ]);
}