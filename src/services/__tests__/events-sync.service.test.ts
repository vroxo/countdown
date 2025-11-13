import { EventsSyncService } from '../events-sync.service';
import * as supabaseService from '../supabase.service';
import { Event } from '../../types';

// Mock supabase service
jest.mock('../supabase.service');

const mockSyncEventsToCloud = supabaseService.syncEventsToCloud as jest.MockedFunction<
  typeof supabaseService.syncEventsToCloud
>;
const mockDeleteEventFromCloud = supabaseService.deleteEventFromCloud as jest.MockedFunction<
  typeof supabaseService.deleteEventFromCloud
>;

describe('EventsSyncService', () => {
  // Mock events
  const mockEvent1: Event = {
    id: '1',
    name: 'Test Event 1',
    targetDate: '2025-12-25T00:00:00Z',
    createdAt: '2024-01-01T00:00:00Z',
    categoryId: 'cat1',
    isRecurring: false,
    notificationEnabled: false,
  };

  const mockEvent2: Event = {
    id: '2',
    name: 'Test Event 2',
    targetDate: '2025-06-15T00:00:00Z',
    createdAt: '2024-01-02T00:00:00Z',
    categoryId: 'cat2',
    isRecurring: false,
    notificationEnabled: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    EventsSyncService.clear();
    
    // Reset configuration to defaults
    EventsSyncService.configure({
      debounceMs: 2000,
      maxRetries: 3,
      retryDelayMs: 1000,
      retryBackoffMultiplier: 2,
    });
    
    // Default mock implementations
    mockSyncEventsToCloud.mockResolvedValue();
    mockDeleteEventFromCloud.mockResolvedValue();
  });

  afterEach(() => {
    EventsSyncService.clear();
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  describe('Debouncing', () => {
    it('should debounce multiple sync calls into one', () => {
      // Call sync 3 times rapidly
      EventsSyncService.syncEvents([mockEvent1]);
      EventsSyncService.syncEvents([mockEvent1, mockEvent2]);
      EventsSyncService.syncEvents([mockEvent1]);

      // Should not sync yet
      expect(mockSyncEventsToCloud).not.toHaveBeenCalled();

      // Fast-forward time past debounce period
      jest.runAllTimers();

      // Should sync only once with the latest state
      expect(mockSyncEventsToCloud).toHaveBeenCalledTimes(1);
      expect(mockSyncEventsToCloud).toHaveBeenCalledWith([mockEvent1]);
    });

    it('should wait for debounce period before syncing', () => {
      EventsSyncService.syncEvents([mockEvent1]);

      // Advance 1 second (less than debounce)
      jest.advanceTimersByTime(1000);
      expect(mockSyncEventsToCloud).not.toHaveBeenCalled();

      // Advance another 1 second (total 2s = debounce period)
      jest.advanceTimersByTime(1000);
      expect(mockSyncEventsToCloud).toHaveBeenCalledTimes(1);
    });

    it('should reset debounce timer on new sync call', () => {
      EventsSyncService.syncEvents([mockEvent1]);

      // Wait 1.5s
      jest.advanceTimersByTime(1500);
      
      // Call sync again (should reset timer)
      EventsSyncService.syncEvents([mockEvent2]);

      // Wait another 1s (total 2.5s from first call, but only 1s from second)
      jest.advanceTimersByTime(1000);

      // Should not have synced yet (need 2s from second call)
      expect(mockSyncEventsToCloud).not.toHaveBeenCalled();

      // Wait final 1s
      jest.advanceTimersByTime(1000);

      // Now should have synced
      expect(mockSyncEventsToCloud).toHaveBeenCalledTimes(1);
    });
  });

  describe('Queue Management', () => {
    it('should add items to queue', () => {
      EventsSyncService.syncEvents([mockEvent1]);
      expect(EventsSyncService.getQueueSize()).toBe(1);

      EventsSyncService.deleteEvent('event-1');
      expect(EventsSyncService.getQueueSize()).toBe(2);
    });

    it('should replace previous sync operations with latest', () => {
      EventsSyncService.syncEvents([mockEvent1]);
      EventsSyncService.syncEvents([mockEvent2]);
      EventsSyncService.syncEvents([mockEvent1, mockEvent2]);

      // Should only have 1 sync operation (latest)
      expect(EventsSyncService.getQueueSize()).toBe(1);
    });

    it('should keep all delete operations', () => {
      EventsSyncService.deleteEvent('1');
      EventsSyncService.deleteEvent('2');
      EventsSyncService.deleteEvent('3');

      // Should have all 3 delete operations
      expect(EventsSyncService.getQueueSize()).toBe(3);
    });
  });

  describe('Force Sync', () => {
    it('should sync immediately bypassing debounce', async () => {
      await EventsSyncService.forceSyncNow([mockEvent1]);

      // Should sync immediately without advancing timers
      expect(mockSyncEventsToCloud).toHaveBeenCalledTimes(1);
      expect(mockSyncEventsToCloud).toHaveBeenCalledWith([mockEvent1]);
    });

    it('should clear pending debounce timer', async () => {
      EventsSyncService.syncEvents([mockEvent1]);
      expect(EventsSyncService.getQueueSize()).toBe(1);

      await EventsSyncService.forceSyncNow([mockEvent2]);

      // Queue should be cleared
      expect(EventsSyncService.getQueueSize()).toBe(0);

      // Advance debounce time (should not trigger another sync)
      jest.runAllTimers();

      // Should only have the force sync
      expect(mockSyncEventsToCloud).toHaveBeenCalledTimes(1);
      expect(mockSyncEventsToCloud).toHaveBeenCalledWith([mockEvent2]);
    });
  });

  describe('Configuration', () => {
    it('should allow customizing debounce time', () => {
      EventsSyncService.configure({ debounceMs: 500 });

      EventsSyncService.syncEvents([mockEvent1]);

      // Should not sync yet
      expect(mockSyncEventsToCloud).not.toHaveBeenCalled();

      // Advance 500ms
      jest.advanceTimersByTime(500);

      // Should have synced
      expect(mockSyncEventsToCloud).toHaveBeenCalledTimes(1);
    });
  });

  describe('Delete Operations', () => {
    it('should debounce delete operations', () => {
      EventsSyncService.deleteEvent('1');

      expect(mockDeleteEventFromCloud).not.toHaveBeenCalled();

      jest.runAllTimers();

      expect(mockDeleteEventFromCloud).toHaveBeenCalledTimes(1);
      expect(mockDeleteEventFromCloud).toHaveBeenCalledWith('1');
    });
  });

  describe('Utility Methods', () => {
    it('should return queue size correctly', () => {
      expect(EventsSyncService.getQueueSize()).toBe(0);

      EventsSyncService.syncEvents([mockEvent1]);
      expect(EventsSyncService.getQueueSize()).toBe(1);

      EventsSyncService.deleteEvent('1');
      expect(EventsSyncService.getQueueSize()).toBe(2);
    });

    it('should clear queue and timers', () => {
      EventsSyncService.syncEvents([mockEvent1]);
      EventsSyncService.deleteEvent('1');

      expect(EventsSyncService.getQueueSize()).toBe(2);

      EventsSyncService.clear();

      expect(EventsSyncService.getQueueSize()).toBe(0);

      // Advance time - should not trigger sync
      jest.runAllTimers();
      expect(mockSyncEventsToCloud).not.toHaveBeenCalled();
    });
  });
});
