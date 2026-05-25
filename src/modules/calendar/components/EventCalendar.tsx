// src/modules/calendar/components/EventCalendar.tsx

/**
 * Calendário visual dos eventos
 *
 * @author Mauro Sakugawa
 * @created 2026-05-25
 * @license MIT
 * @version 1.0.0
 */

import { useState } from "react";

import {
  Calendar,
  dateFnsLocalizer,
  type View,
} from "react-big-calendar";

import {
  format,
  parse,
  startOfWeek,
  getDay,
} from "date-fns";

import { ptBR } from "date-fns/locale";

import "react-big-calendar/lib/css/react-big-calendar.css";

import { useEventStore }
  from "../../events/store/useEventStore";

import { mapEventsToCalendar }
  from "../utils/calendar.utils";

const locales = {
  "pt-BR": ptBR,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

export default function EventCalendar() {
  const events = useEventStore(
    (state) => state.events
  );

  const calendarEvents =
    mapEventsToCalendar(events);

  /**
   * View controlada
   */
  const [view, setView] =
    useState<View>("month");

  /**
   * Data controlada
   */
  const [date, setDate] =
    useState(new Date());

  return (
    <div
      className="
        bg-base-100
        rounded-3xl
        p-6
        shadow-lg
        border
        border-base-300
      "
    >
      <Calendar
        localizer={localizer}
        events={calendarEvents}
        startAccessor="start"
        endAccessor="end"
        culture="pt-BR"

        /**
         * Controle da visualização
         */
        view={view}
        onView={(newView) =>
          setView(newView)
        }

        /**
         * DATE
         */
        date={date}
        onNavigate={(newDate) =>
          setDate(newDate)
        }

        /**
         * Views habilitadas
         */
        views={{
          month: true,
          week: true,
          day: true,
          agenda: true,
        }}

        defaultView="month"

        /**
         * Extras UX
         */
        selectable
        popup

        style={{ height: 700 }}

        messages={{
          today: "Hoje",
          next: "Próximo",
          previous: "Anterior",
          month: "Mês",
          week: "Semana",
          day: "Dia",
          agenda: "Agenda",
        }}
      />
    </div>
  );
}