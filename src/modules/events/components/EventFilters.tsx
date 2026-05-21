// src/modules/events/components/EventFilters.tsx

/**
 * Filtros dos eventos
 *
 * @author Mauro Sakugawa
 * @created 2026-05-21
 * @license MIT
 * @version 1.0.0
 */

import {
  EVENT_CATEGORIES,
  EVENT_PRIORITIES,
} from "../types/event.types";

interface Props {
  category: string;

  priority: string;

  onCategoryChange: (
    value: string
  ) => void;

  onPriorityChange: (
    value: string
  ) => void;
}

export default function EventFilters({
  category,
  priority,
  onCategoryChange,
  onPriorityChange,
}: Props) {
  return (
    <div
      className="
        flex
        flex-col
        lg:flex-row
        gap-4
      "
    >
      <select
        value={category}
        onChange={(e) =>
          onCategoryChange(e.target.value)
        }
        className="
          select
          select-bordered
          rounded-2xl
          bg-white
        "
      >
        <option value="">
          Todas categorias
        </option>

        {EVENT_CATEGORIES.map(
          (category) => (
            <option
              key={category}
              value={category}
            >
              {category}
            </option>
          )
        )}
      </select>

      <select
        value={priority}
        onChange={(e) =>
          onPriorityChange(e.target.value)
        }
        className="
          select
          select-bordered
          rounded-2xl
          bg-white
        "
      >
        <option value="">
          Todas prioridades
        </option>

        {EVENT_PRIORITIES.map(
          (priority) => (
            <option
              key={priority}
              value={priority}
            >
              {priority}
            </option>
          )
        )}
      </select>
    </div>
  );
}