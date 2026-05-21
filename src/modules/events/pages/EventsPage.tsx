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

export default function EventsPage() {
  return (
    <MainLayout
      title="Eventos"
      subtitle="Gerencie seus compromissos"
    >
      <div className="space-y-6">
        <EventForm />
      </div>
    </MainLayout>
  );
}