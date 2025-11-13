import {
  shouldRecreateEvent,
  createNextOccurrence,
  processRecurringEvents,
} from '../recurringUtils';
import { Event } from '../../types';

describe('recurringUtils', () => {
  // Helper function to create test events
  const createTestEvent = (overrides: Partial<Event> = {}): Event => ({
    id: 'test-event-1',
    name: 'Test Event',
    targetDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
    createdAt: new Date().toISOString(),
    isRecurring: false,
    notificationEnabled: false,
    ...overrides,
  });

  describe('shouldRecreateEvent', () => {
    it('should return false for non-recurring events', () => {
      const event = createTestEvent({
        isRecurring: false,
        targetDate: new Date(Date.now() - 1000).toISOString(), // Past date
      });

      expect(shouldRecreateEvent(event)).toBe(false);
    });

    it('should return false for recurring events without recurringType', () => {
      const event = createTestEvent({
        isRecurring: true,
        recurringType: undefined,
        targetDate: new Date(Date.now() - 1000).toISOString(),
      });

      expect(shouldRecreateEvent(event)).toBe(false);
    });

    it('should return true for recurring events that have passed', () => {
      const event = createTestEvent({
        isRecurring: true,
        recurringType: 'yearly',
        targetDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Yesterday
      });

      expect(shouldRecreateEvent(event)).toBe(true);
    });

    it('should return false for recurring events in the future', () => {
      const event = createTestEvent({
        isRecurring: true,
        recurringType: 'yearly',
        targetDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
      });

      expect(shouldRecreateEvent(event)).toBe(false);
    });

    it('should return true for yearly recurring events that passed months ago', () => {
      const pastDate = new Date();
      pastDate.setMonth(pastDate.getMonth() - 3); // 3 months ago
      
      const event = createTestEvent({
        isRecurring: true,
        recurringType: 'yearly',
        targetDate: pastDate.toISOString(),
      });

      expect(shouldRecreateEvent(event)).toBe(true);
    });

    it('should return true for monthly recurring events that passed', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 31); // 31 days ago
      
      const event = createTestEvent({
        isRecurring: true,
        recurringType: 'monthly',
        targetDate: pastDate.toISOString(),
      });

      expect(shouldRecreateEvent(event)).toBe(true);
    });

    it('should return true for weekly recurring events that passed', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 8); // 8 days ago
      
      const event = createTestEvent({
        isRecurring: true,
        recurringType: 'weekly',
        targetDate: pastDate.toISOString(),
      });

      expect(shouldRecreateEvent(event)).toBe(true);
    });
  });

  describe('createNextOccurrence', () => {
    it('should return the same event if no recurringType', () => {
      const event = createTestEvent({
        isRecurring: true,
        recurringType: undefined,
      });

      const result = createNextOccurrence(event);

      expect(result).toEqual(event);
    });

    it('should create a new yearly occurrence with new ID', () => {
      const originalDate = new Date('2024-01-15T10:00:00Z');
      const event = createTestEvent({
        id: 'original-id',
        isRecurring: true,
        recurringType: 'yearly',
        targetDate: originalDate.toISOString(),
      });

      const result = createNextOccurrence(event);

      expect(result.id).not.toBe(event.id);
      expect(result.id.length).toBeGreaterThan(10);
      expect(result.name).toBe(event.name);
      expect(result.isRecurring).toBe(true);
      expect(result.recurringType).toBe('yearly');
    });

    it('should create next occurrence with updated targetDate for yearly events', () => {
      const originalDate = new Date('2023-12-25T10:00:00Z');
      const event = createTestEvent({
        isRecurring: true,
        recurringType: 'yearly',
        targetDate: originalDate.toISOString(),
      });

      const result = createNextOccurrence(event);
      const newDate = new Date(result.targetDate);
      
      // New date should be approximately 1 year later
      expect(newDate.getTime()).toBeGreaterThan(originalDate.getTime());
      
      // Should maintain same month and day
      const originalDateObj = new Date(event.targetDate);
      expect(newDate.getMonth()).toBe(originalDateObj.getMonth());
      expect(newDate.getDate()).toBe(originalDateObj.getDate());
    });

    it('should create next occurrence for monthly events', () => {
      const originalDate = new Date('2024-01-15T10:00:00Z');
      const event = createTestEvent({
        isRecurring: true,
        recurringType: 'monthly',
        targetDate: originalDate.toISOString(),
      });

      const result = createNextOccurrence(event);
      const newDate = new Date(result.targetDate);
      
      expect(newDate.getTime()).toBeGreaterThan(originalDate.getTime());
    });

    it('should create next occurrence for weekly events', () => {
      const originalDate = new Date('2024-01-15T10:00:00Z');
      const event = createTestEvent({
        isRecurring: true,
        recurringType: 'weekly',
        targetDate: originalDate.toISOString(),
      });

      const result = createNextOccurrence(event);
      const newDate = new Date(result.targetDate);
      
      expect(newDate.getTime()).toBeGreaterThan(originalDate.getTime());
    });

    it('should preserve all other event properties', () => {
      const event = createTestEvent({
        name: 'Birthday Party',
        isRecurring: true,
        recurringType: 'yearly',
        notificationEnabled: true,
        notificationTimes: [60, 1440],
        categoryId: 'category-1',
      });

      const result = createNextOccurrence(event);

      expect(result.name).toBe(event.name);
      expect(result.notificationEnabled).toBe(event.notificationEnabled);
      expect(result.notificationTimes).toEqual(event.notificationTimes);
      expect(result.categoryId).toBe(event.categoryId);
      expect(result.isRecurring).toBe(event.isRecurring);
      expect(result.recurringType).toBe(event.recurringType);
    });

    it('should update createdAt to current time', () => {
      const event = createTestEvent({
        createdAt: '2023-01-01T00:00:00Z',
        isRecurring: true,
        recurringType: 'yearly',
      });

      const beforeCreate = Date.now();
      const result = createNextOccurrence(event);
      const afterCreate = Date.now();

      const resultCreatedAt = new Date(result.createdAt).getTime();
      
      expect(resultCreatedAt).toBeGreaterThanOrEqual(beforeCreate);
      expect(resultCreatedAt).toBeLessThanOrEqual(afterCreate);
    });
  });

  describe('processRecurringEvents', () => {
    it('should return empty arrays for empty input', () => {
      const result = processRecurringEvents([]);

      expect(result.eventsToKeep).toEqual([]);
      expect(result.newEvents).toEqual([]);
    });

    it('should keep non-recurring events unchanged', () => {
      const events = [
        createTestEvent({ id: '1', name: 'Event 1' }),
        createTestEvent({ id: '2', name: 'Event 2' }),
      ];

      const result = processRecurringEvents(events);

      expect(result.eventsToKeep).toHaveLength(2);
      expect(result.newEvents).toHaveLength(0);
      expect(result.eventsToKeep).toEqual(events);
    });

    it('should keep future recurring events', () => {
      const futureDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days ahead
      const events = [
        createTestEvent({
          id: '1',
          isRecurring: true,
          recurringType: 'yearly',
          targetDate: futureDate.toISOString(),
        }),
      ];

      const result = processRecurringEvents(events);

      expect(result.eventsToKeep).toHaveLength(1);
      expect(result.newEvents).toHaveLength(0);
      expect(result.eventsToKeep[0].id).toBe('1');
    });

    it('should create new occurrence for past recurring events', () => {
      const pastDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 days ago
      const events = [
        createTestEvent({
          id: 'past-event',
          name: 'Past Birthday',
          isRecurring: true,
          recurringType: 'yearly',
          targetDate: pastDate.toISOString(),
        }),
      ];

      const result = processRecurringEvents(events);

      expect(result.eventsToKeep).toHaveLength(0);
      expect(result.newEvents).toHaveLength(1);
      expect(result.newEvents[0].name).toBe('Past Birthday');
      expect(result.newEvents[0].id).not.toBe('past-event');
      expect(new Date(result.newEvents[0].targetDate).getTime()).toBeGreaterThan(pastDate.getTime());
    });

    it('should handle mixed list of events', () => {
      const pastDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const futureDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      
      const events = [
        // Regular future event
        createTestEvent({
          id: '1',
          name: 'Future Event',
          isRecurring: false,
          targetDate: futureDate.toISOString(),
        }),
        // Past recurring event (should be recreated)
        createTestEvent({
          id: '2',
          name: 'Past Recurring',
          isRecurring: true,
          recurringType: 'yearly',
          targetDate: pastDate.toISOString(),
        }),
        // Future recurring event
        createTestEvent({
          id: '3',
          name: 'Future Recurring',
          isRecurring: true,
          recurringType: 'monthly',
          targetDate: futureDate.toISOString(),
        }),
        // Regular past event (non-recurring, should be kept)
        createTestEvent({
          id: '4',
          name: 'Past Non-Recurring',
          isRecurring: false,
          targetDate: pastDate.toISOString(),
        }),
      ];

      const result = processRecurringEvents(events);

      expect(result.eventsToKeep).toHaveLength(3);
      expect(result.newEvents).toHaveLength(1);
      
      // Check that the right events are kept
      const keptIds = result.eventsToKeep.map(e => e.id);
      expect(keptIds).toContain('1');
      expect(keptIds).toContain('3');
      expect(keptIds).toContain('4');
      
      // Check that the past recurring event was recreated
      expect(result.newEvents[0].name).toBe('Past Recurring');
      expect(result.newEvents[0].id).not.toBe('2');
    });

    it('should handle multiple past recurring events', () => {
      const pastDate1 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
      const pastDate2 = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000); // 60 days ago
      
      const events = [
        createTestEvent({
          id: '1',
          name: 'Birthday 1',
          isRecurring: true,
          recurringType: 'yearly',
          targetDate: pastDate1.toISOString(),
        }),
        createTestEvent({
          id: '2',
          name: 'Birthday 2',
          isRecurring: true,
          recurringType: 'yearly',
          targetDate: pastDate2.toISOString(),
        }),
      ];

      const result = processRecurringEvents(events);

      expect(result.eventsToKeep).toHaveLength(0);
      expect(result.newEvents).toHaveLength(2);
      expect(result.newEvents[0].name).toBe('Birthday 1');
      expect(result.newEvents[1].name).toBe('Birthday 2');
      expect(result.newEvents[0].id).not.toBe('1');
      expect(result.newEvents[1].id).not.toBe('2');
    });

    it('should preserve all properties when creating new events', () => {
      const pastDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const events = [
        createTestEvent({
          id: 'test-id',
          name: 'Test Event',
          isRecurring: true,
          recurringType: 'monthly',
          targetDate: pastDate.toISOString(),
          notificationEnabled: true,
          notificationTimes: [60, 120],
          categoryId: 'cat-1',
        }),
      ];

      const result = processRecurringEvents(events);

      expect(result.newEvents).toHaveLength(1);
      const newEvent = result.newEvents[0];
      
      expect(newEvent.name).toBe('Test Event');
      expect(newEvent.notificationEnabled).toBe(true);
      expect(newEvent.notificationTimes).toEqual([60, 120]);
      expect(newEvent.categoryId).toBe('cat-1');
      expect(newEvent.isRecurring).toBe(true);
      expect(newEvent.recurringType).toBe('monthly');
    });
  });
});

