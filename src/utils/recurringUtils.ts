import { Event } from '../types';
import { getNextRecurringDate } from './dateUtils';
import { generateId } from './dateUtils';

/**
 * Check if a recurring event has finished and needs to be recreated
 */
export const shouldRecreateEvent = (event: Event): boolean => {
  if (!event.isRecurring || !event.recurringType) {
    return false;
  }

  const now = new Date();
  const eventDate = new Date(event.targetDate);

  // Event has passed
  return eventDate < now;
};

/**
 * Create next occurrence of a recurring event
 */
export const createNextOccurrence = (event: Event): Event => {
  if (!event.recurringType) {
    return event;
  }

  const nextDate = getNextRecurringDate(event.targetDate, event.recurringType);

  return {
    ...event,
    id: generateId(), // New ID for the new occurrence
    targetDate: nextDate,
    createdAt: new Date().toISOString(),
  };
};

/**
 * Process all recurring events and create new occurrences if needed
 */
export const processRecurringEvents = (events: Event[]): { 
  eventsToKeep: Event[], 
  newEvents: Event[] 
} => {
  const eventsToKeep: Event[] = [];
  const newEvents: Event[] = [];

  events.forEach(event => {
    if (shouldRecreateEvent(event)) {
      // Keep the old event for history (optional)
      // eventsToKeep.push({ ...event, isRecurring: false });
      
      // Create new occurrence
      const nextEvent = createNextOccurrence(event);
      newEvents.push(nextEvent);
    } else {
      eventsToKeep.push(event);
    }
  });

  return { eventsToKeep, newEvents };
};

