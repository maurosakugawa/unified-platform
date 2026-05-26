// src/modules/events/types/event.types.ts
/**
 * Tipagens do módulo de eventos
 * 
 * @author Mauro Sakugawa
 * @created 2026-05-21
 * @license MIT License
 * @version 1.0.0
 */

export const EVENT_PRIORITIES = [
  'Baixa',
  'Média',
  'Alta',
] as const;

export const EVENT_CATEGORIES = [
  'Reunião',
  'Pessoal',
  'Trabalho',
  'Estudo',
  'Saúde',
  'Financeiro',
] as const;

export type EventPriority =
  (typeof EVENT_PRIORITIES)[number];

export type EventCategory =
  (typeof EVENT_CATEGORIES)[number];

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;

  category: EventCategory;
  priority: EventPriority;

  contact: string;
  location: string;

  reminder: number;
  createdAt: string;

  reminded?: boolean;
}