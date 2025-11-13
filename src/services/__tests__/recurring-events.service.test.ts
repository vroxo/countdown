import { RecurringEventsService } from '../recurring-events.service';
import { Event } from '../../types';
import * as dateUtils from '../../utils/dateUtils';

// Mock dateUtils
jest.mock('../../utils/dateUtils', () => ({
  ...jest.requireActual('../../utils/dateUtils'),
  generateId: jest.fn(() => 'mock-id-' + Math.random().toString(36).substr(2, 5)),
}));

describe('RecurringEventsService', () => {
  const baseEvent: Event = {
    id: '1',
    name: 'Birthday',
    targetDate: '2024-12-25T00:00:00Z',
    createdAt: '2024-01-01T00:00:00Z',
    isRecurring: true,
    recurringType: 'yearly',
    notificationEnabled: false,
  };

  describe('shouldRecreateEvent', () => {
    it('should return true for past recurring event', () => {
      const pastEvent: Event = {
        ...baseEvent,
        targetDate: '2020-12-25T00:00:00Z', // Past date
      };

      expect(RecurringEventsService.shouldRecreateEvent(pastEvent)).toBe(true);
    });

    it('should return false for future recurring event', () => {
      const futureEvent: Event = {
        ...baseEvent,
        targetDate: '2030-12-25T00:00:00Z', // Future date
      };

      expect(RecurringEventsService.shouldRecreateEvent(futureEvent)).toBe(false);
    });

    it('should return false for non-recurring event', () => {
      const nonRecurringEvent: Event = {
        ...baseEvent,
        isRecurring: false,
        recurringType: undefined,
        targetDate: '2020-12-25T00:00:00Z',
      };

      expect(RecurringEventsService.shouldRecreateEvent(nonRecurringEvent)).toBe(false);
    });

    it('should return false if recurringType is missing', () => {
      const eventWithoutType: Event = {
        ...baseEvent,
        recurringType: undefined,
        targetDate: '2020-12-25T00:00:00Z',
      };

      expect(RecurringEventsService.shouldRecreateEvent(eventWithoutType)).toBe(false);
    });
  });

  describe('createNextOccurrence', () => {
    it('should create next occurrence with new ID and date', () => {
      const nextEvent = RecurringEventsService.createNextOccurrence(baseEvent);

      expect(nextEvent).not.toBeNull();
      expect(nextEvent!.id).not.toBe(baseEvent.id);
      expect(nextEvent!.name).toBe(baseEvent.name);
      expect(nextEvent!.isRecurring).toBe(true);
      expect(nextEvent!.recurringType).toBe('yearly');
    });

    it('should return null for non-recurring event', () => {
      const nonRecurringEvent: Event = {
        ...baseEvent,
        isRecurring: false,
        recurringType: undefined,
      };

      expect(RecurringEventsService.createNextOccurrence(nonRecurringEvent)).toBeNull();
    });

    it('should return null if recurringType is missing', () => {
      const eventWithoutType: Event = {
        ...baseEvent,
        recurringType: undefined,
      };

      expect(RecurringEventsService.createNextOccurrence(eventWithoutType)).toBeNull();
    });

    it('should preserve all event properties except id and dates', () => {
      const eventWithProps: Event = {
        ...baseEvent,
        categoryId: 'cat1',
        notificationEnabled: true,
        notificationTimes: [60, 1440],
      };

      const nextEvent = RecurringEventsService.createNextOccurrence(eventWithProps);

      expect(nextEvent!.categoryId).toBe('cat1');
      expect(nextEvent!.notificationEnabled).toBe(true);
      expect(nextEvent!.notificationTimes).toEqual([60, 1440]);
    });
  });

  describe('processRecurringEvents', () => {
    it('should recreate past recurring events', () => {
      const events: Event[] = [
        {
          ...baseEvent,
          id: '1',
          targetDate: '2020-12-25T00:00:00Z', // Past
        },
        {
          ...baseEvent,
          id: '2',
          targetDate: '2030-12-25T00:00:00Z', // Future
        },
      ];

      const processed = RecurringEventsService.processRecurringEvents(events);

      expect(processed).toHaveLength(2);
      expect(processed[0].id).not.toBe('1'); // New ID for recreated event
      expect(processed[1].id).toBe('2'); // Original event kept
    });

    it('should keep non-recurring events unchanged', () => {
      const events: Event[] = [
        {
          ...baseEvent,
          id: '1',
          isRecurring: false,
          recurringType: undefined,
          targetDate: '2020-12-25T00:00:00Z',
        },
      ];

      const processed = RecurringEventsService.processRecurringEvents(events);

      expect(processed).toHaveLength(1);
      expect(processed[0].id).toBe('1');
    });

    it('should handle empty array', () => {
      const processed = RecurringEventsService.processRecurringEvents([]);
      expect(processed).toEqual([]);
    });

    it('should handle mix of recurring and non-recurring events', () => {
      const events: Event[] = [
        {
          ...baseEvent,
          id: '1',
          isRecurring: true,
          targetDate: '2020-12-25T00:00:00Z', // Past recurring
        },
        {
          ...baseEvent,
          id: '2',
          isRecurring: false,
          recurringType: undefined,
          targetDate: '2020-12-25T00:00:00Z', // Past non-recurring
        },
      ];

      const processed = RecurringEventsService.processRecurringEvents(events);

      expect(processed).toHaveLength(2);
      expect(processed[0].id).not.toBe('1'); // Recreated
      expect(processed[1].id).toBe('2'); // Kept unchanged
    });
  });

  describe('getUpcomingOccurrences', () => {
    it('should return specified number of future occurrences', () => {
      const occurrences = RecurringEventsService.getUpcomingOccurrences(baseEvent, 3);

      expect(occurrences).toHaveLength(3);
      expect(occurrences[0]).toBeTruthy();
      expect(occurrences[1]).toBeTruthy();
      expect(occurrences[2]).toBeTruthy();
    });

    it('should return empty array for non-recurring event', () => {
      const nonRecurringEvent: Event = {
        ...baseEvent,
        isRecurring: false,
        recurringType: undefined,
      };

      const occurrences = RecurringEventsService.getUpcomingOccurrences(nonRecurringEvent);
      expect(occurrences).toEqual([]);
    });

    it('should default to 5 occurrences if count not specified', () => {
      const occurrences = RecurringEventsService.getUpcomingOccurrences(baseEvent);
      expect(occurrences).toHaveLength(5);
    });
  });

  describe('calculateOccurrenceCount', () => {
    it('should return 1 for non-recurring event', () => {
      const nonRecurringEvent: Event = {
        ...baseEvent,
        isRecurring: false,
        recurringType: undefined,
      };

      expect(RecurringEventsService.calculateOccurrenceCount(nonRecurringEvent)).toBe(1);
    });

    it('should calculate weekly occurrences correctly', () => {
      const weeklyEvent: Event = {
        ...baseEvent,
        recurringType: 'weekly',
        createdAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(), // 21 days ago
      };

      const count = RecurringEventsService.calculateOccurrenceCount(weeklyEvent);
      expect(count).toBeGreaterThanOrEqual(3); // At least 3 weeks
    });

    it('should calculate monthly occurrences approximately', () => {
      const monthlyEvent: Event = {
        ...baseEvent,
        recurringType: 'monthly',
        createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days ago
      };

      const count = RecurringEventsService.calculateOccurrenceCount(monthlyEvent);
      expect(count).toBeGreaterThanOrEqual(3); // At least 3 months
    });

    it('should calculate yearly occurrences approximately', () => {
      const yearlyEvent: Event = {
        ...baseEvent,
        recurringType: 'yearly',
        createdAt: new Date(Date.now() - 400 * 24 * 60 * 60 * 1000).toISOString(), // ~400 days ago
      };

      const count = RecurringEventsService.calculateOccurrenceCount(yearlyEvent);
      expect(count).toBeGreaterThanOrEqual(1);
    });
  });

  describe('getRecurringDescription', () => {
    it('should return description for weekly event', () => {
      const weeklyEvent: Event = {
        ...baseEvent,
        recurringType: 'weekly',
        targetDate: '2024-01-15T00:00:00Z', // Monday
      };

      const description = RecurringEventsService.getRecurringDescription(weeklyEvent);
      expect(description).toContain('semana');
    });

    it('should return description for monthly event', () => {
      const monthlyEvent: Event = {
        ...baseEvent,
        recurringType: 'monthly',
        targetDate: '2024-01-15T12:00:00Z', // Use noon to avoid timezone issues
      };

      const description = RecurringEventsService.getRecurringDescription(monthlyEvent);
      expect(description).toContain('mês');
      expect(description).toMatch(/dia \d+/); // Match "dia" followed by any number
    });

    it('should return description for yearly event', () => {
      const yearlyEvent: Event = {
        ...baseEvent,
        recurringType: 'yearly',
        targetDate: '2024-12-25T00:00:00Z',
      };

      const description = RecurringEventsService.getRecurringDescription(yearlyEvent);
      expect(description).toContain('ano');
    });

    it('should return "Não recorrente" for non-recurring event', () => {
      const nonRecurringEvent: Event = {
        ...baseEvent,
        isRecurring: false,
        recurringType: undefined,
      };

      const description = RecurringEventsService.getRecurringDescription(nonRecurringEvent);
      expect(description).toBe('Não recorrente');
    });
  });

  describe('validateRecurringConfig', () => {
    it('should return null for valid recurring event', () => {
      const error = RecurringEventsService.validateRecurringConfig(baseEvent);
      expect(error).toBeNull();
    });

    it('should return null for non-recurring event', () => {
      const nonRecurring = {
        isRecurring: false,
        targetDate: '2024-12-25T00:00:00Z',
      };

      const error = RecurringEventsService.validateRecurringConfig(nonRecurring);
      expect(error).toBeNull();
    });

    it('should return error if recurringType is missing', () => {
      const invalidEvent = {
        isRecurring: true,
        targetDate: '2024-12-25T00:00:00Z',
      };

      const error = RecurringEventsService.validateRecurringConfig(invalidEvent);
      expect(error).toContain('Tipo de recorrência obrigatório');
    });

    it('should return error for invalid recurringType', () => {
      const invalidEvent = {
        isRecurring: true,
        recurringType: 'invalid' as any,
        targetDate: '2024-12-25T00:00:00Z',
      };

      const error = RecurringEventsService.validateRecurringConfig(invalidEvent);
      expect(error).toContain('inválido');
    });

    it('should return error if targetDate is missing', () => {
      const invalidEvent = {
        isRecurring: true,
        recurringType: 'yearly' as const,
      };

      const error = RecurringEventsService.validateRecurringConfig(invalidEvent);
      expect(error).toContain('Data obrigatória');
    });
  });

  describe('areSameRecurringPattern', () => {
    it('should return true for same weekly pattern', () => {
      const event1: Event = {
        ...baseEvent,
        recurringType: 'weekly',
        targetDate: '2024-01-15T00:00:00Z', // Monday
      };

      const event2: Event = {
        ...baseEvent,
        id: '2',
        recurringType: 'weekly',
        targetDate: '2024-01-22T00:00:00Z', // Also Monday
      };

      expect(RecurringEventsService.areSameRecurringPattern(event1, event2)).toBe(true);
    });

    it('should return true for same monthly pattern', () => {
      const event1: Event = {
        ...baseEvent,
        recurringType: 'monthly',
        targetDate: '2024-01-15T00:00:00Z', // 15th
      };

      const event2: Event = {
        ...baseEvent,
        id: '2',
        recurringType: 'monthly',
        targetDate: '2024-02-15T00:00:00Z', // Also 15th
      };

      expect(RecurringEventsService.areSameRecurringPattern(event1, event2)).toBe(true);
    });

    it('should return true for same yearly pattern', () => {
      const event1: Event = {
        ...baseEvent,
        recurringType: 'yearly',
        targetDate: '2024-12-25T00:00:00Z', // Dec 25
      };

      const event2: Event = {
        ...baseEvent,
        id: '2',
        recurringType: 'yearly',
        targetDate: '2025-12-25T00:00:00Z', // Also Dec 25
      };

      expect(RecurringEventsService.areSameRecurringPattern(event1, event2)).toBe(true);
    });

    it('should return false for different names', () => {
      const event1: Event = {
        ...baseEvent,
        name: 'Event A',
      };

      const event2: Event = {
        ...baseEvent,
        id: '2',
        name: 'Event B',
      };

      expect(RecurringEventsService.areSameRecurringPattern(event1, event2)).toBe(false);
    });

    it('should return false for different recurring types', () => {
      const event1: Event = {
        ...baseEvent,
        recurringType: 'weekly',
      };

      const event2: Event = {
        ...baseEvent,
        id: '2',
        recurringType: 'monthly',
      };

      expect(RecurringEventsService.areSameRecurringPattern(event1, event2)).toBe(false);
    });

    it('should return false if one event is non-recurring', () => {
      const event1: Event = {
        ...baseEvent,
      };

      const event2: Event = {
        ...baseEvent,
        id: '2',
        isRecurring: false,
        recurringType: undefined,
      };

      expect(RecurringEventsService.areSameRecurringPattern(event1, event2)).toBe(false);
    });
  });
});

