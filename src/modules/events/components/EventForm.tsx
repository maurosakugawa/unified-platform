// src/modules/events/components/EventForm.tsx

/**
 * Formulário responsável pela criação
 * e edição de eventos.
 *
 * @author Mauro Sakugawa
 * @created 2026-05-21
 * @license MIT License
 * @version 1.0.0
 */

import { useState } from "react";

import Button from "../../../components/ui/Button";
import { useNotifications } from "../../../modules/notifications/hooks/useNotifications";
import { useEventStore } from "../store/useEventStore";
import { useEventModal } from "../store/useEventModal";

import {
  EVENT_CATEGORIES,
  EVENT_PRIORITIES,
  type Event,
  type EventCategory,
  type EventPriority,
} from "../types/event.types";

const emptyForm: Event = {
  id: "",
  title: "",
  description: "",
  date: "",
  time: "",
  category: "Pessoal",
  priority: "Média",
  contact: "",
  location: "",
  reminder: 30,
  createdAt: "",
};

export default function EventForm() {
  const addEvent = useEventStore(
    (state) => state.addEvent
  );

  const updateEvent = useEventStore(
    (state) => state.updateEvent
  );

  const close = useEventModal(
    (state) => state.close
  );

  const editingEvent = useEventModal(
    (state) => state.editingEvent
  );

  const notifications = useNotifications();

  const [formData, setFormData] =
    useState<Event>(() =>
      editingEvent
        ? editingEvent
        : emptyForm
    );

  /**
   * Atualiza os campos do formulário
   */
  const handleChange = (
    e: React.ChangeEvent<
      | HTMLInputElement
      | HTMLTextAreaElement
      | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "reminder"
          ? Number(value)
          : value,
    }));
  };

  /**
 * Salva ou atualiza um evento
 */
const handleSubmit = (
  e: React.FormEvent
) => {
  e.preventDefault();

  if (editingEvent) {
    updateEvent(formData);

    notifications.info(
      "Evento atualizado",
      "As alterações foram salvas."
    );
  } else {
    addEvent({
      ...formData,
      id: crypto.randomUUID(),
      createdAt:
        new Date().toISOString(),
    });

    notifications.success(
      "Evento criado",
      "Seu evento foi salvo com sucesso."
    );
  }

  setFormData(emptyForm);

  close();
};

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5"
    >
      <div className="grid gap-5">
        <input
          type="text"
          name="title"
          placeholder="Título"
          value={formData.title}
          onChange={handleChange}
          className="
            input
            input-bordered
            w-full
          "
          required
        />

        <textarea
          name="description"
          placeholder="Descrição"
          value={formData.description}
          onChange={handleChange}
          className="
            textarea
            textarea-bordered
            h-32
          "
        />

        <div className="grid md:grid-cols-2 gap-5">
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="
              input
              input-bordered
            "
            required
          />

          <input
            type="time"
            name="time"
            value={formData.time}
            onChange={handleChange}
            className="
              input
              input-bordered
            "
            required
          />
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="
              select
              select-bordered
            "
          >
            {EVENT_CATEGORIES.map(
              (
                category: EventCategory
              ) => (
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
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            className="
              select
              select-bordered
            "
          >
            {EVENT_PRIORITIES.map(
              (
                priority: EventPriority
              ) => (
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

        <input
          type="text"
          name="contact"
          placeholder="Contato relacionado"
          value={formData.contact}
          onChange={handleChange}
          className="
            input
            input-bordered
          "
        />

        <input
          type="text"
          name="location"
          placeholder="Local"
          value={formData.location}
          onChange={handleChange}
          className="
            input
            input-bordered
          "
        />

        <input
          type="number"
          name="reminder"
          placeholder="Lembrete em minutos"
          value={formData.reminder}
          onChange={handleChange}
          className="
            input
            input-bordered
          "
        />
      </div>

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={close}
          className="btn btn-ghost"
        >
          Cancelar
        </button>

        <Button type="submit">
          {editingEvent
            ? "Salvar alterações"
            : "Criar evento"}
        </Button>
      </div>
    </form>
  );
}