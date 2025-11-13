import { TimeRemaining } from '../types';

/**
 * Calculates the time remaining until a target date
 */
export const calculateTimeRemaining = (targetDate: string): TimeRemaining => {
  const now = new Date().getTime();
  const target = new Date(targetDate).getTime();
  const difference = target - now;

  if (difference <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      totalSeconds: 0,
      isFinished: true,
    };
  }

  const seconds = Math.floor(difference / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  return {
    days,
    hours: hours % 24,
    minutes: minutes % 60,
    seconds: seconds % 60,
    totalSeconds: seconds,
    isFinished: false,
  };
};

/**
 * Formats a date string to a readable format
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  return date.toLocaleDateString('pt-BR', options);
};

/**
 * Formats a date with time
 */
export const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  };
  return date.toLocaleDateString('pt-BR', options);
};

/**
 * Formats time remaining as a human-readable string
 */
export const formatTimeRemaining = (time: TimeRemaining): string => {
  if (time.isFinished) {
    return 'Finalizado';
  }

  const parts: string[] = [];
  
  if (time.days > 0) {
    parts.push(`${time.days}d`);
  }
  if (time.hours > 0) {
    parts.push(`${time.hours}h`);
  }
  if (time.minutes > 0) {
    parts.push(`${time.minutes}m`);
  }
  if (time.seconds > 0 && time.days === 0) {
    parts.push(`${time.seconds}s`);
  }

  return parts.join(' ') || '0s';
};

/**
 * Checks if an event is happening soon (within 24 hours)
 */
export const isEventSoon = (targetDate: string): boolean => {
  const time = calculateTimeRemaining(targetDate);
  return !time.isFinished && time.totalSeconds <= 86400; // 24 hours in seconds
};

/**
 * Generates a unique ID
 */
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Validates if a date is in the future
 */
export const isFutureDate = (date: Date): boolean => {
  return date.getTime() > new Date().getTime();
};

/**
 * Calculates the next occurrence for recurring events
 */
export const getNextRecurringDate = (
  lastDate: string,
  type: 'yearly' | 'monthly' | 'weekly'
): string => {
  const date = new Date(lastDate);
  const now = new Date();

  switch (type) {
    case 'yearly':
      // Next year on the same date
      const nextYear = new Date(date);
      nextYear.setFullYear(now.getFullYear() + 1);
      return nextYear.toISOString();
    
    case 'monthly':
      // Next month on the same day
      const nextMonth = new Date(date);
      nextMonth.setMonth(now.getMonth() + 1);
      return nextMonth.toISOString();
    
    case 'weekly':
      // Next week on the same day
      const nextWeek = new Date(date);
      nextWeek.setDate(now.getDate() + 7);
      return nextWeek.toISOString();
    
    default:
      return date.toISOString();
  }
};

