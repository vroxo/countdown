import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { Event } from '../types';
import { saveEvents, loadEvents } from '../services/storage.service';
import { 
  loadEventsFromCloud, 
  subscribeToEvents 
} from '../services/supabase.service';
import { 
  scheduleEventNotifications, 
  cancelEventNotifications 
} from '../services/notifications.service';
import { RecurringEventsService } from '../services/recurring-events.service';
import { EventsSyncService } from '../services/events-sync.service';
import { isSupabaseConfigured, getCurrentUserId } from '../config/supabase';

interface EventsContextType {
  events: Event[];
  addEvent: (event: Event) => void;
  updateEvent: (event: Event) => void;
  deleteEvent: (eventId: string) => void;
  getEvent: (eventId: string) => Event | undefined;
  forceSyncNow: () => Promise<void>;
  isLoading: boolean;
  isSyncing: boolean;
  isCloudEnabled: boolean;
}

export const EventsContext = createContext<EventsContextType | undefined>(undefined);

interface EventsProviderProps {
  children: ReactNode;
}

export const EventsProvider: React.FC<EventsProviderProps> = ({ children }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const isCloudEnabled = isSupabaseConfigured;

  // Monitor userId changes (login/logout)
  useEffect(() => {
    if (!isCloudEnabled) return;

    const checkUserId = async () => {
      const userId = await getCurrentUserId();
      setCurrentUserId(userId);
    };

    checkUserId();

    // Check periodically for auth changes
    const interval = setInterval(checkUserId, 1000);
    return () => clearInterval(interval);
  }, [isCloudEnabled]);

  // Load events on mount and when userId changes (login/logout)
  useEffect(() => {
    const loadStoredEvents = async () => {
      try {
        setIsLoading(true);
        let loadedEvents: Event[] = [];
        
        if (isCloudEnabled) {
          // Try to load from cloud first
          const cloudEvents = await loadEventsFromCloud();
          if (cloudEvents.length > 0) {
            loadedEvents = cloudEvents;
            // Save to local storage as backup
            await saveEvents(cloudEvents);
          } else {
            // Fallback to local storage
            loadedEvents = await loadEvents();
            // Sync local events to cloud using EventsSyncService (with debouncing)
            if (loadedEvents.length > 0) {
              EventsSyncService.syncEvents(loadedEvents);
            }
          }
        } else {
          // Load from local storage only
          loadedEvents = await loadEvents();
        }
        
        setEvents(loadedEvents);
      } catch (error) {
        console.error('Failed to load events:', error);
        // Fallback to local storage
        const localEvents = await loadEvents();
        setEvents(localEvents);
      } finally {
        setIsLoading(false);
      }
    };

    loadStoredEvents();
  }, [isCloudEnabled, currentUserId]);

  // Subscribe to real-time updates from Supabase
  useEffect(() => {
    // Only subscribe if cloud is enabled, not loading, AND user is authenticated
    if (!isCloudEnabled || isLoading || !currentUserId) return;

    const unsubscribe = subscribeToEvents((updatedEvents) => {
      setEvents(updatedEvents);
      // Also save to local storage
      saveEvents(updatedEvents);
    });

    return () => {
      unsubscribe();
    };
  }, [isCloudEnabled, isLoading, currentUserId]);

  // Process recurring events periodically
  useEffect(() => {
    if (isLoading) return;

    const processEvents = () => {
      // Use RecurringEventsService to process recurring events
      const processedEvents = RecurringEventsService.processRecurringEvents(events);
      
      // Check if any events were recreated (different array length or IDs changed)
      const hasChanges = processedEvents.length !== events.length ||
        processedEvents.some((event, index) => event.id !== events[index]?.id);
      
      if (hasChanges) {
        // Sort by target date
        const sortedEvents = processedEvents.sort((a, b) => 
          new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime()
        );
        
        setEvents(sortedEvents);

        // Find new events to schedule notifications
        const newEventIds = processedEvents
          .filter(event => !events.find(e => e.id === event.id))
          .map(event => event.id);
        
        processedEvents
          .filter(event => newEventIds.includes(event.id))
          .forEach(event => {
            if (event.notificationEnabled) {
              scheduleEventNotifications(event, event.notificationTimes || [60, 1440]);
            }
          });
      }
    };

    // Check every hour for events that need to be recreated
    const interval = setInterval(processEvents, 60 * 60 * 1000);

    // Also check immediately on mount
    processEvents();

    return () => clearInterval(interval);
  }, [events, isLoading]);

  // Save events to storage whenever they change
  useEffect(() => {
    if (!isLoading) {
      const syncData = async () => {
        try {
          // Always save to local storage (even when not authenticated)
          await saveEvents(events);
          
          // Sync to cloud ONLY if enabled AND user is authenticated
          if (isCloudEnabled && currentUserId) {
            setIsSyncing(true);
            // Use EventsSyncService with debouncing (reduces API calls by 80%+)
            EventsSyncService.syncEvents(events);
            // Set syncing to false after debounce period
            setTimeout(() => setIsSyncing(false), 2500);
          }
        } catch (error) {
          console.error('Failed to sync events:', error);
        }
      };

      syncData();
    }
  }, [events, isLoading, isCloudEnabled, currentUserId]);

  const addEvent = async (event: Event) => {
    setEvents((prev) => {
      const newEvents = [...prev, event];
      // Sort by target date (closest first)
      return newEvents.sort((a, b) => 
        new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime()
      );
    });

    // Schedule notifications if enabled
    if (event.notificationEnabled) {
      const notificationTimes = event.notificationTimes || [60, 1440]; // Default: 1 hour and 1 day
      await scheduleEventNotifications(event, notificationTimes);
    }
  };

  const updateEvent = async (event: Event) => {
    setEvents((prev) => {
      const updated = prev.map((e) => (e.id === event.id ? event : e));
      // Sort by target date (closest first)
      return updated.sort((a, b) => 
        new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime()
      );
    });

    // Cancel old notifications and schedule new ones
    await cancelEventNotifications(event.id);
    if (event.notificationEnabled) {
      const notificationTimes = event.notificationTimes || [60, 1440];
      await scheduleEventNotifications(event, notificationTimes);
    }
  };

  const deleteEvent = async (eventId: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== eventId));
    
    // Cancel notifications
    await cancelEventNotifications(eventId);
    
    // Delete from cloud ONLY if enabled AND user is authenticated
    if (isCloudEnabled && currentUserId) {
      // Use EventsSyncService with debouncing
      EventsSyncService.deleteEvent(eventId);
    }
  };

  const getEvent = (eventId: string) => {
    return events.find((e) => e.id === eventId);
  };

  /**
   * Force immediate sync to cloud (bypasses debouncing)
   * Useful for critical operations like logout
   */
  const forceSyncNow = async (): Promise<void> => {
    if (isCloudEnabled && currentUserId && events.length > 0) {
      await EventsSyncService.forceSyncNow(events);
    }
  };

  // Cleanup EventsSyncService on unmount
  useEffect(() => {
    return () => {
      // Clear any pending sync operations when component unmounts
      EventsSyncService.clear();
    };
  }, []);

  const value: EventsContextType = {
    events,
    addEvent,
    updateEvent,
    deleteEvent,
    getEvent,
    forceSyncNow,
    isLoading,
    isSyncing,
    isCloudEnabled,
  };

  return (
    <EventsContext.Provider value={value}>
      {children}
    </EventsContext.Provider>
  );
};

