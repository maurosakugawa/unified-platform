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
import Button from "../../../components/ui/Button";
import EventList from "../components/EventList";
import EventSearch from "../components/EventSearch";
import EventFilters from "../components/EventFilters";
import EventModal from "../components/EventModal";
import EventSort from "../components/EventSort";
import { useFilteredEvents } from "../hooks/useFilteredEvents";
import { useEventModal } from "../store/useEventModal";

export default function EventsPage() {
  const [search, setSearch] =
    useState("");

  const [category, setCategory] =
    useState("");

  const [priority, setPriority] =
    useState("");
    
  const [sortBy, setSortBy] =
    useState("created"); 
    
  const filteredEvents =
    useFilteredEvents({
      search,
      category,
      priority,
      sortBy,
    });

  const openCreate = useEventModal(
    (state) => state.openCreate
  );

  return (
    <MainLayout
      title="Eventos"
      subtitle="Gerencie seus compromissos"
    >
      <div className="space-y-8">
        {/* HEADER */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-base-content">
              Seus eventos
            </h1>
            <p className="text-base-content/60 mt-1">
              Organize sua rotina inteligente
            </p>
          </div>
          <Button onClick={openCreate}>
            Novo evento
          </Button>
        </div>

        {/* BUSCA */}
        <EventSearch
          value={search}
          onChange={setSearch}
        />

        {/* FILTROS */}
        <EventFilters
          category={category}
          setCategory={setCategory}
          priority={priority}
          setPriority={setPriority}
        />

        {/* LISTA */}
        <EventList events={filteredEvents} />

        {/* MODAL */}
        <EventModal />

        <EventSort
          value={sortBy}
          onChange={setSortBy}
        />        
      </div>
    </MainLayout>
  );
}