// src/modules/events/components/EventCard.tsx

/**
 * Card de evento
 *
 * @author Mauro Sakugawa
 * @created 2026-05-21
 * @license MIT
 * @version 1.0.0
 */

import { useState } from "react";

import {
  Calendar,
  Clock,
  MapPin,
  Trash2,
  Pencil,
} from "lucide-react";

import { motion } from "framer-motion";

import type {
  Event,
  EventPriority,
} from "../types/event.types";

import { useEventModal }
  from "../store/useEventModal";

import { useNotifications }
  from "../../notifications/hooks/useNotifications";

import Badge
  from "../../../components/ui/Badge";

import Card
  from "../../../components/ui/Card";

import ConfirmDialog
  from "../../../components/ui/ConfirmDialog";

import { slideUp }
  from "../../../animations/slide";

interface EventCardProps {
  event: Event;

  onDelete: (
    id: string
  ) => void;
}

export default function EventCard({
  event,
  onDelete,
}: EventCardProps) {

  const openEdit = useEventModal(
    (state) => state.openEdit
  );

  const notifications =
    useNotifications();

  const [confirmOpen, setConfirmOpen] =
    useState(false);

  const priorityVariant: Record<
    EventPriority,
    "low" | "medium" | "high"
  > = {
    Baixa: "low",
    Média: "medium",
    Alta: "high",
  };

  /**
   * Confirma exclusão
   */
  function confirmDelete() {
    onDelete(event.id);

    notifications.warning(
      "Evento removido",
      "O evento foi excluído."
    );

    setConfirmOpen(false);
  }

  return (
    <>
      <motion.div
        variants={slideUp}
        whileHover={{
          y: -4,
          scale: 1.01,
        }}
        transition={{
          duration: 0.2,
        }}
      >
        <Card
          className="
            transition-all
            duration-300
            hover:-translate-y-1
            hover:shadow-2xl
            hover:shadow-primary/10
          "
        >
          <div className="flex items-start justify-between">
            <div>
              <h3
                className="
                  text-lg
                  font-bold
                  text-base-content
                "
              >
                {event.title}
              </h3>

              <p
                className="
                  text-base-content/60
                  mt-1
                "
              >
                {event.description}
              </p>
            </div>

            <Badge
              variant={
                priorityVariant[
                  event.priority
                ]
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
              text-base-content/70
            "
          >
            <div
              className="
                flex
                items-center
                gap-2
              "
            >
              <Calendar size={16} />

              {event.date}
            </div>

            <div
              className="
                flex
                items-center
                gap-2
              "
            >
              <Clock size={16} />

              {event.time}
            </div>

            <div
              className="
                flex
                items-center
                gap-2
              "
            >
              <MapPin size={16} />

              {event.location}
            </div>
          </div>

          <div
            className="
              mt-6
              flex
              justify-end
              gap-2
            "
          >
            <button
              onClick={() =>
                openEdit(event)
              }
              className="
                btn
                btn-sm
                btn-outline
              "
            >
              <Pencil size={16} />
            </button>

            <button
              onClick={() =>
                setConfirmOpen(true)
              }
              className="
                btn
                btn-sm
                btn-error
                text-base-content
              "
            >
              <Trash2 size={16} />
            </button>
          </div>
        </Card>
      </motion.div>

      <ConfirmDialog
        isOpen={confirmOpen}
        title="Excluir evento"
        message="
          Tem certeza que deseja
          excluir este evento?
        "
        onConfirm={confirmDelete}
        onCancel={() =>
          setConfirmOpen(false)
        }
      />
    </>
  );
}