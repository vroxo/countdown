import { supabase, isSupabaseConfigured, getCurrentUserId } from '../config/supabase';
import { Event } from '../types';
import { EventMapper } from './event.mapper';

/**
 * Supabase Service - Handles cloud sync operations
 * Falls back to local storage if Supabase is not configured
 */

// Sync events to Supabase
export const syncEventsToCloud = async (events: Event[]): Promise<void> => {
  if (!supabase || !isSupabaseConfigured) {
    return;
  }

  try {
    const userId = await getCurrentUserId();
    
    // Don't sync if user is not authenticated
    if (!userId) {
      return;
    }

    // Convert Event to Supabase format using EventMapper
    const supabaseEvents = EventMapper.toSupabaseBatch(events, userId);

    // Upsert events (insert or update)
    const { error } = await supabase
      .from('events')
      .upsert(supabaseEvents as any, { onConflict: 'id' });

    if (error) {
      console.error('Error syncing events to cloud:', error);
      throw error;
    }
  } catch (error) {
    console.error('Failed to sync events:', error);
    // Don't throw - allow app to continue with local storage
  }
};

// Load events from Supabase
export const loadEventsFromCloud = async (): Promise<Event[]> => {
  if (!supabase || !isSupabaseConfigured) {
    return [];
  }

  try {
    const userId = await getCurrentUserId();
    
    // Don't load from cloud if user is not authenticated
    if (!userId) {
      return [];
    }

    let query = supabase
      .from('events')
      .select('*');

    // Load only the authenticated user's events
    query = query.eq('user_id', userId);

    const { data, error } = await query.order('target_date', { ascending: true });

    if (error) {
      console.error('Error loading events from cloud:', error);
      return [];
    }

    // Convert Supabase format to Event using EventMapper
    const events = EventMapper.fromSupabaseBatch(data || []);

    return events;
  } catch (error) {
    console.error('Failed to load events from cloud:', error);
    return [];
  }
};

// Delete event from Supabase
export const deleteEventFromCloud = async (eventId: string): Promise<void> => {
  if (!supabase || !isSupabaseConfigured) {
    return;
  }

  try {
    const userId = await getCurrentUserId();
    
    // Don't delete from cloud if user is not authenticated
    if (!userId) {
      return;
    }

    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', eventId);

    if (error) {
      console.error('Error deleting event from cloud:', error);
      throw error;
    }
  } catch (error) {
    console.error('Failed to delete event from cloud:', error);
    // Don't throw - allow app to continue
  }
};

// Setup real-time subscription for events
export const subscribeToEvents = (
  callback: (events: Event[]) => void
): (() => void) => {
  if (!supabase || !isSupabaseConfigured) {
    return () => {}; // Return no-op cleanup function
  }

  const channel = supabase
    .channel('events-changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'events' },
      async () => {
        // Reload events when any change occurs
        const events = await loadEventsFromCloud();
        callback(events);
      }
    )
    .subscribe();

  // Return cleanup function
  return () => {
    if (supabase) {
      supabase.removeChannel(channel);
    }
  };
};

