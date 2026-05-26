// src/App.tsx
/**
 * Main application routes
 *
 * @author Mauro Sakugawa
 * @created 2026-05-21
 * @license MIT License
 * @version 1.0.0
 */
import AppRoutes from "./routes/AppRoutes";

import NotificationContainer from "./modules/notifications/components/NotificationContainer";
import { useReminderWatcher,} from "./modules/events/hooks/useReminderWatcher";

export default function App() {

  /**
   * Inicializa watcher global
   */
  useReminderWatcher();

  return (
    <>
      <AppRoutes />

      <NotificationContainer />
    </>
  );
}