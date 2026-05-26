// src/modules/notifications/services/reminder_service.ts
/**
 * Serviço de reminders automáticos
 *
 * @author Mauro Sakugawa
 * @created 2026-05-25
 * @license MIT
 * @version 1.0.0
 */

import type { Event } from
  "../../events/types/event.types";

interface ReminderCache {
  [eventId: string]: boolean;
}

const triggeredReminders:
  ReminderCache = {};

export function shouldTriggerReminder(
  event: Event
) {
  const now = new Date();

  const eventDate = new Date(
    `${event.date}T${event.time}`
  );

  const diffMs =
    eventDate.getTime() -
    now.getTime();

  const diffMinutes =
    Math.floor(diffMs / 60000);

  /**
   * Dispara apenas uma vez
   */
  if (
    triggeredReminders[event.id]
  ) {
    return false;
  }

  /**
   * Dentro da janela
   */
  if (
    diffMinutes <= event.reminder &&
    diffMinutes >= 0
  ) {
    triggeredReminders[
      event.id
    ] = true;

    return true;
  }

  return false;
}