// src/App.tsx
/**
 * Main application routes
 *
 * @author Mauro Sakugawa
 * @created 2026-05-21
 * @license MIT License
 * @version 1.0.0
 */
import { useEffect } from "react";

import AppRoutes from "./routes/AppRoutes";

import NotificationContainer from "./modules/notifications/components/NotificationContainer";
import { useReminderWatcher,} from "./modules/events/hooks/useReminderWatcher";
import { useEventStore } from "./modules/events/store/useEventStore";

export default function App() {

  /**
   * Inicializa watcher global
   */
  useReminderWatcher();

  const hydrateEvents =
  useEventStore(
    (state) =>
      state.hydrateEvents
  );

  useEffect(() => {
    hydrateEvents();
  }, [hydrateEvents]);

  return (
    <>
      <AppRoutes />

      <NotificationContainer />
    </>
  );
}