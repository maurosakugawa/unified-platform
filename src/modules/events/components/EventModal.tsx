// src/modules/events/components/EventModal.tsx
/**
 * 
 * @author Mauro Sakugawa
 * @created 2026-05-21
 * @license MIT License
 * @version 1.0.0
 */
import Modal from "../../../components/ui/Modal";

import EventForm from "./EventForm";

import { useEventModal } from "../store/useEventModal";

export default function EventModal() {
  const isOpen = useEventModal(
    (state) => state.isOpen
  );

  const close = useEventModal(
    (state) => state.close
  );

  const editingEvent = useEventModal(
    (state) => state.editingEvent
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={close}
      title={
        editingEvent
          ? "Editar evento"
          : "Novo evento"
      }
    >

        <EventForm
            key={editingEvent?.id ?? "new"}
        />
    </Modal>
  );
}