import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Event } from '../types';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Request notification permissions
 */
export const requestNotificationPermissions = async (): Promise<boolean> => {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      return false;
    }

    // Configure channel for Android
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#6366f1',
      });
    }

    return true;
  } catch (error) {
    console.error('Error requesting notification permissions:', error);
    return false;
  }
};

/**
 * Schedule notification for an event
 */
export const scheduleEventNotification = async (
  event: Event,
  minutesBefore: number = 60
): Promise<string | null> => {
  try {
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      return null;
    }

    const eventDate = new Date(event.targetDate);
    const notificationDate = new Date(eventDate.getTime() - minutesBefore * 60 * 1000);

    // Don't schedule if notification time is in the past
    if (notificationDate <= new Date()) {
      return null;
    }

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: `⏰ ${event.name}`,
        body: getNotificationBody(minutesBefore, event.name),
        data: { eventId: event.id },
        sound: true,
      },
      trigger: {
        date: notificationDate,
      },
    });

    return notificationId;
  } catch (error) {
    console.error('Error scheduling notification:', error);
    return null;
  }
};

/**
 * Schedule multiple notifications for an event
 */
export const scheduleEventNotifications = async (
  event: Event,
  minutesBeforeArray: number[] = [60, 1440] // 1 hour and 1 day before
): Promise<string[]> => {
  if (!event.notificationEnabled) {
    return [];
  }

  const notificationIds: string[] = [];

  for (const minutesBefore of minutesBeforeArray) {
    const id = await scheduleEventNotification(event, minutesBefore);
    if (id) {
      notificationIds.push(id);
    }
  }

  return notificationIds;
};

/**
 * Cancel notification by ID
 */
export const cancelNotification = async (notificationId: string): Promise<void> => {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch (error) {
    console.error('Error cancelling notification:', error);
  }
};

/**
 * Cancel all notifications for an event
 */
export const cancelEventNotifications = async (eventId: string): Promise<void> => {
  try {
    const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
    
    const eventNotifications = scheduledNotifications.filter(
      (notification) => notification.content.data?.eventId === eventId
    );

    for (const notification of eventNotifications) {
      await Notifications.cancelScheduledNotificationAsync(notification.identifier);
    }
  } catch (error) {
    console.error('Error cancelling event notifications:', error);
  }
};

/**
 * Get notification body text based on time before event
 */
const getNotificationBody = (minutesBefore: number, eventName: string): string => {
  if (minutesBefore < 60) {
    return `${eventName} começa em ${minutesBefore} minutos!`;
  } else if (minutesBefore < 1440) {
    const hours = Math.floor(minutesBefore / 60);
    return `${eventName} começa em ${hours} ${hours === 1 ? 'hora' : 'horas'}!`;
  } else {
    const days = Math.floor(minutesBefore / 1440);
    return `${eventName} começa em ${days} ${days === 1 ? 'dia' : 'dias'}!`;
  }
};

/**
 * Get all scheduled notifications (for debugging)
 */
export const getAllScheduledNotifications = async () => {
  try {
    const notifications = await Notifications.getAllScheduledNotificationsAsync();
    return notifications;
  } catch (error) {
    console.error('Error getting scheduled notifications:', error);
    return [];
  }
};

