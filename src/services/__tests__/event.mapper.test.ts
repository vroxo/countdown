import { EventMapper, SupabaseEvent } from '../event.mapper';
import { Event } from '../../types';

describe('EventMapper', () => {
  const mockUserId = 'user-123';

  const mockEvent: Event = {
    id: 'event-1',
    name: 'Test Event',
    targetDate: '2024-12-25T10:00:00Z',
    createdAt: '2024-01-01T00:00:00Z',
    categoryId: 'cat-1',
    isRecurring: false,
    notificationEnabled: true,
    notificationTimes: [60, 1440],
    userId: mockUserId,
  };

  const mockSupabaseEvent: SupabaseEvent = {
    id: 'event-1',
    name: 'Test Event',
    target_date: '2024-12-25T10:00:00Z',
    created_at: '2024-01-01T00:00:00Z',
    category_id: 'cat-1',
    is_recurring: false,
    recurring_type: null,
    notification_enabled: true,
    notification_times: [60, 1440],
    user_id: mockUserId,
  };

  describe('toSupabase', () => {
    it('should convert Event to Supabase format', () => {
      const result = EventMapper.toSupabase(mockEvent, mockUserId);

      expect(result).toEqual(mockSupabaseEvent);
    });

    it('should handle optional fields correctly', () => {
      const minimalEvent: Event = {
        id: 'event-2',
        name: 'Minimal Event',
        targetDate: '2024-12-25T10:00:00Z',
        createdAt: '2024-01-01T00:00:00Z',
        isRecurring: false,
        notificationEnabled: false,
      };

      const result = EventMapper.toSupabase(minimalEvent, mockUserId);

      expect(result.category_id).toBeNull();
      expect(result.recurring_type).toBeNull();
      expect(result.notification_times).toBeNull();
      expect(result.user_id).toBe(mockUserId);
    });

    it('should convert recurring event with yearly type', () => {
      const recurringEvent: Event = {
        ...mockEvent,
        isRecurring: true,
        recurringType: 'yearly',
      };

      const result = EventMapper.toSupabase(recurringEvent, mockUserId);

      expect(result.is_recurring).toBe(true);
      expect(result.recurring_type).toBe('yearly');
    });

    it('should convert recurring event with monthly type', () => {
      const recurringEvent: Event = {
        ...mockEvent,
        isRecurring: true,
        recurringType: 'monthly',
      };

      const result = EventMapper.toSupabase(recurringEvent, mockUserId);

      expect(result.is_recurring).toBe(true);
      expect(result.recurring_type).toBe('monthly');
    });

    it('should convert recurring event with weekly type', () => {
      const recurringEvent: Event = {
        ...mockEvent,
        isRecurring: true,
        recurringType: 'weekly',
      };

      const result = EventMapper.toSupabase(recurringEvent, mockUserId);

      expect(result.is_recurring).toBe(true);
      expect(result.recurring_type).toBe('weekly');
    });

    it('should use provided userId parameter', () => {
      const differentUserId = 'user-456';
      const result = EventMapper.toSupabase(mockEvent, differentUserId);

      expect(result.user_id).toBe(differentUserId);
    });

    it('should preserve all event properties', () => {
      const complexEvent: Event = {
        id: 'complex-1',
        name: 'Complex Event',
        targetDate: '2025-06-15T14:30:00Z',
        createdAt: '2024-01-15T10:00:00Z',
        categoryId: 'cat-5',
        isRecurring: true,
        recurringType: 'yearly',
        notificationEnabled: true,
        notificationTimes: [5, 15, 30, 60, 120, 1440],
        userId: 'user-789',
      };

      const result = EventMapper.toSupabase(complexEvent, 'user-new');

      expect(result.id).toBe(complexEvent.id);
      expect(result.name).toBe(complexEvent.name);
      expect(result.target_date).toBe(complexEvent.targetDate);
      expect(result.created_at).toBe(complexEvent.createdAt);
      expect(result.category_id).toBe(complexEvent.categoryId);
      expect(result.is_recurring).toBe(complexEvent.isRecurring);
      expect(result.recurring_type).toBe(complexEvent.recurringType);
      expect(result.notification_enabled).toBe(complexEvent.notificationEnabled);
      expect(result.notification_times).toEqual(complexEvent.notificationTimes);
      expect(result.user_id).toBe('user-new');
    });
  });

  describe('fromSupabase', () => {
    it('should convert Supabase format to Event', () => {
      const result = EventMapper.fromSupabase(mockSupabaseEvent);

      expect(result).toEqual(mockEvent);
    });

    it('should handle null optional fields', () => {
      const minimalSupabaseEvent: SupabaseEvent = {
        id: 'event-2',
        name: 'Minimal Event',
        target_date: '2024-12-25T10:00:00Z',
        created_at: '2024-01-01T00:00:00Z',
        category_id: null,
        is_recurring: false,
        recurring_type: null,
        notification_enabled: false,
        notification_times: null,
        user_id: mockUserId,
      };

      const result = EventMapper.fromSupabase(minimalSupabaseEvent);

      expect(result.categoryId).toBeUndefined();
      expect(result.recurringType).toBeUndefined();
      expect(result.notificationTimes).toBeUndefined();
      expect(result.userId).toBe(mockUserId);
    });

    it('should convert yearly recurring event', () => {
      const recurringSupabaseEvent: SupabaseEvent = {
        ...mockSupabaseEvent,
        is_recurring: true,
        recurring_type: 'yearly',
      };

      const result = EventMapper.fromSupabase(recurringSupabaseEvent);

      expect(result.isRecurring).toBe(true);
      expect(result.recurringType).toBe('yearly');
    });

    it('should convert monthly recurring event', () => {
      const recurringSupabaseEvent: SupabaseEvent = {
        ...mockSupabaseEvent,
        is_recurring: true,
        recurring_type: 'monthly',
      };

      const result = EventMapper.fromSupabase(recurringSupabaseEvent);

      expect(result.isRecurring).toBe(true);
      expect(result.recurringType).toBe('monthly');
    });

    it('should convert weekly recurring event', () => {
      const recurringSupabaseEvent: SupabaseEvent = {
        ...mockSupabaseEvent,
        is_recurring: true,
        recurring_type: 'weekly',
      };

      const result = EventMapper.fromSupabase(recurringSupabaseEvent);

      expect(result.isRecurring).toBe(true);
      expect(result.recurringType).toBe('weekly');
    });

    it('should preserve all Supabase event properties', () => {
      const complexSupabaseEvent: SupabaseEvent = {
        id: 'complex-1',
        name: 'Complex Event',
        target_date: '2025-06-15T14:30:00Z',
        created_at: '2024-01-15T10:00:00Z',
        category_id: 'cat-5',
        is_recurring: true,
        recurring_type: 'yearly',
        notification_enabled: true,
        notification_times: [5, 15, 30, 60, 120, 1440],
        user_id: 'user-789',
      };

      const result = EventMapper.fromSupabase(complexSupabaseEvent);

      expect(result.id).toBe(complexSupabaseEvent.id);
      expect(result.name).toBe(complexSupabaseEvent.name);
      expect(result.targetDate).toBe(complexSupabaseEvent.target_date);
      expect(result.createdAt).toBe(complexSupabaseEvent.created_at);
      expect(result.categoryId).toBe(complexSupabaseEvent.category_id);
      expect(result.isRecurring).toBe(complexSupabaseEvent.is_recurring);
      expect(result.recurringType).toBe(complexSupabaseEvent.recurring_type);
      expect(result.notificationEnabled).toBe(complexSupabaseEvent.notification_enabled);
      expect(result.notificationTimes).toEqual(complexSupabaseEvent.notification_times);
      expect(result.userId).toBe(complexSupabaseEvent.user_id);
    });
  });

  describe('toSupabaseBatch', () => {
    it('should convert array of Events to Supabase format', () => {
      const events: Event[] = [
        mockEvent,
        { ...mockEvent, id: 'event-2', name: 'Event 2' },
        { ...mockEvent, id: 'event-3', name: 'Event 3' },
      ];

      const result = EventMapper.toSupabaseBatch(events, mockUserId);

      expect(result).toHaveLength(3);
      expect(result[0].user_id).toBe(mockUserId);
      expect(result[1].user_id).toBe(mockUserId);
      expect(result[2].user_id).toBe(mockUserId);
      expect(result[0].name).toBe('Test Event');
      expect(result[1].name).toBe('Event 2');
      expect(result[2].name).toBe('Event 3');
    });

    it('should handle empty array', () => {
      const result = EventMapper.toSupabaseBatch([], mockUserId);

      expect(result).toEqual([]);
    });

    it('should apply userId to all events', () => {
      const events: Event[] = [
        { ...mockEvent, userId: 'old-user-1' },
        { ...mockEvent, id: 'event-2', userId: 'old-user-2' },
      ];

      const result = EventMapper.toSupabaseBatch(events, 'new-user');

      expect(result[0].user_id).toBe('new-user');
      expect(result[1].user_id).toBe('new-user');
    });
  });

  describe('fromSupabaseBatch', () => {
    it('should convert array of Supabase events to Events', () => {
      const supabaseEvents: SupabaseEvent[] = [
        mockSupabaseEvent,
        { ...mockSupabaseEvent, id: 'event-2', name: 'Event 2' },
        { ...mockSupabaseEvent, id: 'event-3', name: 'Event 3' },
      ];

      const result = EventMapper.fromSupabaseBatch(supabaseEvents);

      expect(result).toHaveLength(3);
      expect(result[0].id).toBe('event-1');
      expect(result[1].id).toBe('event-2');
      expect(result[2].id).toBe('event-3');
      expect(result[0].name).toBe('Test Event');
      expect(result[1].name).toBe('Event 2');
      expect(result[2].name).toBe('Event 3');
    });

    it('should handle empty array', () => {
      const result = EventMapper.fromSupabaseBatch([]);

      expect(result).toEqual([]);
    });

    it('should preserve user_id for all events', () => {
      const supabaseEvents: SupabaseEvent[] = [
        { ...mockSupabaseEvent, user_id: 'user-1' },
        { ...mockSupabaseEvent, id: 'event-2', user_id: 'user-2' },
      ];

      const result = EventMapper.fromSupabaseBatch(supabaseEvents);

      expect(result[0].userId).toBe('user-1');
      expect(result[1].userId).toBe('user-2');
    });
  });

  describe('canConvertToSupabase', () => {
    it('should return true for valid event', () => {
      const result = EventMapper.canConvertToSupabase(mockEvent);

      expect(result).toBe(true);
    });

    it('should return false if id is missing', () => {
      const invalidEvent = { ...mockEvent, id: '' };

      const result = EventMapper.canConvertToSupabase(invalidEvent);

      expect(result).toBe(false);
    });

    it('should return false if name is missing', () => {
      const invalidEvent = { ...mockEvent, name: '' };

      const result = EventMapper.canConvertToSupabase(invalidEvent);

      expect(result).toBe(false);
    });

    it('should return false if targetDate is missing', () => {
      const invalidEvent = { ...mockEvent, targetDate: '' };

      const result = EventMapper.canConvertToSupabase(invalidEvent);

      expect(result).toBe(false);
    });

    it('should return false if createdAt is missing', () => {
      const invalidEvent = { ...mockEvent, createdAt: '' };

      const result = EventMapper.canConvertToSupabase(invalidEvent);

      expect(result).toBe(false);
    });

    it('should return true even if optional fields are missing', () => {
      const minimalEvent: Event = {
        id: 'event-1',
        name: 'Test',
        targetDate: '2024-12-25T10:00:00Z',
        createdAt: '2024-01-01T00:00:00Z',
        isRecurring: false,
        notificationEnabled: false,
      };

      const result = EventMapper.canConvertToSupabase(minimalEvent);

      expect(result).toBe(true);
    });
  });

  describe('canConvertFromSupabase', () => {
    it('should return true for valid Supabase event', () => {
      const result = EventMapper.canConvertFromSupabase(mockSupabaseEvent);

      expect(result).toBe(true);
    });

    it('should return false for null or undefined', () => {
      expect(EventMapper.canConvertFromSupabase(null)).toBe(false);
      expect(EventMapper.canConvertFromSupabase(undefined)).toBe(false);
    });

    it('should return false for non-object', () => {
      expect(EventMapper.canConvertFromSupabase('string')).toBe(false);
      expect(EventMapper.canConvertFromSupabase(123)).toBe(false);
      expect(EventMapper.canConvertFromSupabase(true)).toBe(false);
    });

    it('should return false if id is missing', () => {
      const invalid = { ...mockSupabaseEvent, id: '' };

      const result = EventMapper.canConvertFromSupabase(invalid);

      expect(result).toBe(false);
    });

    it('should return false if name is missing', () => {
      const invalid = { ...mockSupabaseEvent, name: '' };

      const result = EventMapper.canConvertFromSupabase(invalid);

      expect(result).toBe(false);
    });

    it('should return false if target_date is missing', () => {
      const invalid = { ...mockSupabaseEvent, target_date: '' };

      const result = EventMapper.canConvertFromSupabase(invalid);

      expect(result).toBe(false);
    });

    it('should return false if created_at is missing', () => {
      const invalid = { ...mockSupabaseEvent, created_at: '' };

      const result = EventMapper.canConvertFromSupabase(invalid);

      expect(result).toBe(false);
    });

    it('should return false if user_id is missing', () => {
      const invalid = { ...mockSupabaseEvent, user_id: '' };

      const result = EventMapper.canConvertFromSupabase(invalid);

      expect(result).toBe(false);
    });

    it('should return true even if optional fields are null', () => {
      const minimalSupabaseEvent: SupabaseEvent = {
        id: 'event-1',
        name: 'Test',
        target_date: '2024-12-25T10:00:00Z',
        created_at: '2024-01-01T00:00:00Z',
        category_id: null,
        is_recurring: false,
        recurring_type: null,
        notification_enabled: false,
        notification_times: null,
        user_id: 'user-123',
      };

      const result = EventMapper.canConvertFromSupabase(minimalSupabaseEvent);

      expect(result).toBe(true);
    });
  });

  describe('round-trip conversion', () => {
    it('should maintain data integrity through toSupabase and fromSupabase', () => {
      const original = mockEvent;
      const supabase = EventMapper.toSupabase(original, mockUserId);
      const converted = EventMapper.fromSupabase(supabase);

      expect(converted).toEqual(original);
    });

    it('should handle minimal event in round-trip', () => {
      const minimalEvent: Event = {
        id: 'test',
        name: 'Test',
        targetDate: '2024-12-25T10:00:00Z',
        createdAt: '2024-01-01T00:00:00Z',
        isRecurring: false,
        notificationEnabled: false,
      };

      const supabase = EventMapper.toSupabase(minimalEvent, mockUserId);
      const converted = EventMapper.fromSupabase(supabase);

      expect(converted.id).toBe(minimalEvent.id);
      expect(converted.name).toBe(minimalEvent.name);
      expect(converted.targetDate).toBe(minimalEvent.targetDate);
      expect(converted.createdAt).toBe(minimalEvent.createdAt);
      expect(converted.isRecurring).toBe(minimalEvent.isRecurring);
      expect(converted.notificationEnabled).toBe(minimalEvent.notificationEnabled);
    });
  });
});

