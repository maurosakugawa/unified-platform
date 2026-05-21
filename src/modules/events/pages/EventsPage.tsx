// src/modules/events/pages/EventsPage.tsx

/**
 * Página principal dos eventos
 *
 * @author Mauro Sakugawa
 * @created 2026-05-21
 * @license MIT
 * @version 1.0.0
 */

import { useState } from "react";

import MainLayout from "../../../layouts/MainLayout";

import EventForm from "../components/EventForm";
import EventList from "../components/EventList";
import EventSearch from "../components/EventSearch";
import EventFilters from "../components/EventFilters";

import { useFilteredEvents } from "../hooks/useFilteredEvents";

export default function EventsPage() {
  const [search, setSearch] =
    useState("");

  const [category, setCategory] =
    useState("");

  const [priority, setPriority] =
    useState("");

  const filteredEvents =
    useFilteredEvents({
      search,
      category,
      priority,
    });

  return (
    <MainLayout
      title="Eventos"
      subtitle="Gerencie seus compromissos"
    >
      <div className="space-y-8">
        <EventForm />

        <div className="space-y-4">
          <EventSearch
            value={search}
            onChange={setSearch}
          />

          <EventFilters
            category={category}
            priority={priority}
            onCategoryChange={
              setCategory
            }
            onPriorityChange={
              setPriority
            }
          />
        </div>

        <EventList
          events={filteredEvents}
        />
      </div>
    </MainLayout>
  );
}