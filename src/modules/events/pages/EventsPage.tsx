// src/modules/events/pages/EventsPage.tsx

/**
 * Página de gerenciamento de eventos
 *
 * Responsável por:
 * - exibir formulário
 * - futuramente listar eventos
 * - CRUD de eventos
 *
 * @author Mauro Sakugawa
 * @created 2026-05-21
 * @version 1.0.0
 * @license MIT
 */

import MainLayout from "../../../layouts/MainLayout";

import EventForm from "../components/EventForm";
import EventList from "../components/EventList";

export default function EventsPage() {
  return (
    <MainLayout
      title="Eventos"
      subtitle="Gerencie seus compromissos"
    >
      <div
        className="
          grid
          grid-cols-1
          2xl:grid-cols-3
          gap-8
        "
      >
        <div className="2xl:col-span-1">
          <EventForm />
        </div>

        <div className="2xl:col-span-2">
          <EventList />
        </div>
      </div>
    </MainLayout>
  );
}