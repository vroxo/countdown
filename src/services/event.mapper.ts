import { Event } from '../types';

/**
 * Supabase Event Type
 * Represents the structure of events in Supabase database
 */
export interface SupabaseEvent {
  id: string;
  name: string;
  target_date: string;
  created_at: string;
  category_id: string | null;
  is_recurring: boolean;
  recurring_type: 'yearly' | 'monthly' | 'weekly' | null;
  notification_enabled: boolean;
  notification_times: number[] | null;
  user_id: string;
}

/**
 * EventMapper Service
 * Handles conversion between Event (app format) and SupabaseEvent (database format)
 */
export class EventMapper {
  /**
   * Convert Event to Supabase format for insert/update
   */
  static toSupabase(event: Event, userId: string): SupabaseEvent {
    return {
      id: event.id,
      name: event.name,
      target_date: event.targetDate,
      created_at: event.createdAt,
      category_id: event.categoryId || null,
      is_recurring: event.isRecurring,
      recurring_type: event.recurringType || null,
      notification_enabled: event.notificationEnabled,
      notification_times: event.notificationTimes || null,
      user_id: userId,
    };
  }

  /**
   * Convert Supabase row to Event format
   */
  static fromSupabase(row: SupabaseEvent): Event {
    return {
      id: row.id,
      name: row.name,
      targetDate: row.target_date,
      createdAt: row.created_at,
      categoryId: row.category_id || undefined,
      isRecurring: row.is_recurring,
      recurringType: row.recurring_type || undefined,
      notificationEnabled: row.notification_enabled,
      notificationTimes: row.notification_times || undefined,
      userId: row.user_id,
    };
  }

  /**
   * Convert array of Events to Supabase format
   */
  static toSupabaseBatch(events: Event[], userId: string): SupabaseEvent[] {
    return events.map(event => this.toSupabase(event, userId));
  }

  /**
   * Convert array of Supabase rows to Events
   */
  static fromSupabaseBatch(rows: SupabaseEvent[]): Event[] {
    return rows.map(row => this.fromSupabase(row));
  }

  /**
   * Validate that an event can be converted to Supabase format
   */
  static canConvertToSupabase(event: Event): boolean {
    return !!(
      event.id &&
      event.name &&
      event.targetDate &&
      event.createdAt &&
      typeof event.isRecurring === 'boolean' &&
      typeof event.notificationEnabled === 'boolean'
    );
  }

  /**
   * Validate that a Supabase row can be converted to Event format
   */
  static canConvertFromSupabase(row: any): row is SupabaseEvent {
    return !!(
      row &&
      typeof row === 'object' &&
      row.id &&
      row.name &&
      row.target_date &&
      row.created_at &&
      typeof row.is_recurring === 'boolean' &&
      typeof row.notification_enabled === 'boolean' &&
      row.user_id
    );
  }
}

