// src/modules/events/components/EventCard.tsx

/**
 * Card de evento
 *
 * @author Mauro Sakugawa
 * @created 2026-05-21
 * @license MIT
 * @version 1.0.0
 */

import {
  Calendar,
  Clock,
  MapPin,
  Trash2,
  Pencil,
} from "lucide-react";

import type {
  Event,
  EventPriority,
} from "../types/event.types";
import { useEventModal } from "../store/useEventModal";
import Badge from "../../../components/ui/Badge";
import Card from "../../../components/ui/Card";

interface EventCardProps {
  event: Event;

  onDelete: (id: string) => void;
}

export default function EventCard({
  event,
  onDelete,
}: EventCardProps) {
  const priorityVariant: Record<
    EventPriority,
    "low" | "medium" | "high"
  > = {
    Baixa: "low",
    Média: "medium",
    Alta: "high",
  };

  const openEdit = useEventModal(
    (state) => state.openEdit
  );

  return (
    <Card>
      <div className="flex items-start justify-between">
        <div>
          <h3
            className="
              text-lg
              font-bold
              text-slate-800
            "
          >
            {event.title}
          </h3>

          <p className="text-slate-500 mt-1">
            {event.description}
          </p>
        </div>

        <Badge
          variant={
            priorityVariant[event.priority]
          }
        >
          {event.priority}
        </Badge>
      </div>

      <div
        className="
          mt-6
          space-y-3
          text-sm
          text-slate-600
        "
      >
        <div className="flex items-center gap-2">
          <Calendar size={16} />
          {event.date}
        </div>

        <div className="flex items-center gap-2">
          <Clock size={16} />
          {event.time}
        </div>

        <div className="flex items-center gap-2">
          <MapPin size={16} />
          {event.location}
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-2">
        <button
          onClick={() => openEdit(event)}
          className="
            btn
            btn-sm
            btn-outline
          "
        >
          <Pencil size={16} />
        </button>

        <button
          onClick={() => onDelete(event.id)}
          className="
            btn
            btn-sm
            btn-error
            text-white
          "
        >
          <Trash2 size={16} />
        </button>
      </div>
    </Card>
  );
}