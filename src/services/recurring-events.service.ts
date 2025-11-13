import { Event } from '../types';
import { getNextRecurringDate, generateId } from '../utils/dateUtils';

/**
 * Recurring Event Configuration
 */
interface RecurringConfig {
  type: 'yearly' | 'monthly' | 'weekly';
  lastOccurrence: string; // ISO date string
}

/**
 * RecurringEventsService
 * 
 * Handles all logic related to recurring events:
 * - Creating next occurrences
 * - Checking if recreation is needed
 * - Processing batches of recurring events
 * - Managing recurring event lifecycle
 * 
 * Benefits:
 * - Centralized recurring logic
 * - Easy to test and maintain
 * - Reusable across the app
 * - Clear separation of concerns
 */
export class RecurringEventsService {
  /**
   * Check if a recurring event should be recreated
   * An event should be recreated if:
   * - It's a recurring event
   * - Its target date has passed
   */
  static shouldRecreateEvent(event: Event): boolean {
    if (!event.isRecurring || !event.recurringType) {
      return false;
    }

    const now = new Date();
    const targetDate = new Date(event.targetDate);
    
    return targetDate < now;
  }

  /**
   * Create the next occurrence of a recurring event
   * Returns a new event with updated date and new ID
   */
  static createNextOccurrence(event: Event): Event | null {
    if (!event.isRecurring || !event.recurringType) {
      return null;
    }

    const nextDate = getNextRecurringDate(event.targetDate, event.recurringType);
    
    return {
      ...event,
      id: generateId(),
      targetDate: nextDate,
      createdAt: new Date().toISOString(),
    };
  }

  /**
   * Process all recurring events in a list
   * Returns updated list with new occurrences created for past events
   */
  static processRecurringEvents(events: Event[]): Event[] {
    const processedEvents: Event[] = [];
    
    for (const event of events) {
      if (this.shouldRecreateEvent(event)) {
        // Create next occurrence
        const nextEvent = this.createNextOccurrence(event);
        if (nextEvent) {
          processedEvents.push(nextEvent);
        }
      } else {
        // Keep original event
        processedEvents.push(event);
      }
    }
    
    return processedEvents;
  }

  /**
   * Get all upcoming occurrences of a recurring event
   * Useful for previewing future dates
   */
  static getUpcomingOccurrences(
    event: Event,
    count: number = 5
  ): string[] {
    if (!event.isRecurring || !event.recurringType) {
      return [];
    }

    const occurrences: string[] = [];
    let currentDate = event.targetDate;

    for (let i = 0; i < count; i++) {
      currentDate = getNextRecurringDate(currentDate, event.recurringType);
      occurrences.push(currentDate);
    }

    return occurrences;
  }

  /**
   * Calculate how many times an event has occurred
   * Based on creation date and current date
   */
  static calculateOccurrenceCount(event: Event): number {
    if (!event.isRecurring || !event.recurringType) {
      return 1; // Non-recurring events occur once
    }

    const createdDate = new Date(event.createdAt);
    const now = new Date();
    const millisecondsPerDay = 24 * 60 * 60 * 1000;
    const daysDiff = Math.floor((now.getTime() - createdDate.getTime()) / millisecondsPerDay);

    switch (event.recurringType) {
      case 'weekly':
        return Math.floor(daysDiff / 7) + 1;
      case 'monthly':
        return Math.floor(daysDiff / 30) + 1; // Approximate
      case 'yearly':
        return Math.floor(daysDiff / 365) + 1; // Approximate
      default:
        return 1;
    }
  }

  /**
   * Check if an event will recur within a specific timeframe
   * Useful for notifications and planning
   */
  static willRecurWithinDays(event: Event, days: number): boolean {
    if (!event.isRecurring || !event.recurringType) {
      return false;
    }

    const nextOccurrence = getNextRecurringDate(event.targetDate, event.recurringType);
    const nextDate = new Date(nextOccurrence);
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + days);

    return nextDate <= targetDate;
  }

  /**
   * Get recurring event description for display
   * Returns human-readable string like "Yearly on December 25"
   */
  static getRecurringDescription(event: Event, locale: string = 'pt-BR'): string {
    if (!event.isRecurring || !event.recurringType) {
      return 'Não recorrente';
    }

    const targetDate = new Date(event.targetDate);
    
    switch (event.recurringType) {
      case 'weekly': {
        const dayName = targetDate.toLocaleDateString(locale, { weekday: 'long' });
        return `Toda semana (${dayName})`;
      }
      case 'monthly': {
        const day = targetDate.getDate();
        return `Todo mês (dia ${day})`;
      }
      case 'yearly': {
        const monthDay = targetDate.toLocaleDateString(locale, { 
          month: 'long', 
          day: 'numeric' 
        });
        return `Todo ano (${monthDay})`;
      }
      default:
        return 'Recorrente';
    }
  }

  /**
   * Validate recurring event configuration
   * Returns error message if invalid, null if valid
   */
  static validateRecurringConfig(event: Partial<Event>): string | null {
    if (!event.isRecurring) {
      return null; // Not recurring, no validation needed
    }

    if (!event.recurringType) {
      return 'Tipo de recorrência obrigatório para eventos recorrentes';
    }

    if (!['yearly', 'monthly', 'weekly'].includes(event.recurringType)) {
      return 'Tipo de recorrência inválido';
    }

    if (!event.targetDate) {
      return 'Data obrigatória para eventos recorrentes';
    }

    return null; // Valid
  }

  /**
   * Check if two recurring events are essentially the same
   * Useful for deduplication
   */
  static areSameRecurringPattern(event1: Event, event2: Event): boolean {
    if (!event1.isRecurring || !event2.isRecurring) {
      return false;
    }

    if (event1.recurringType !== event2.recurringType) {
      return false;
    }

    if (event1.name !== event2.name) {
      return false;
    }

    // Check if dates represent the same occurrence
    const date1 = new Date(event1.targetDate);
    const date2 = new Date(event2.targetDate);

    switch (event1.recurringType) {
      case 'weekly':
        return date1.getDay() === date2.getDay();
      case 'monthly':
        return date1.getDate() === date2.getDate();
      case 'yearly':
        return (
          date1.getMonth() === date2.getMonth() &&
          date1.getDate() === date2.getDate()
        );
      default:
        return false;
    }
  }
}

