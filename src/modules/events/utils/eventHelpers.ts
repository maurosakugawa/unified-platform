// src/modules/events/utils/eventHelpers.ts
/**
 * 
 * @author Mauro Sakugawa
 * Date: 2026-05-21
 * License: MIT License
 * @version 1.0.0
 */
import { Event } from '../types'
export function getEventDuration(event: Event): number {
  const start = new Date(event.startTime).getTime()
  const end = new Date(event.endTime).getTime()
  return (end - start) / (1000 * 60) // duration in minutes
}