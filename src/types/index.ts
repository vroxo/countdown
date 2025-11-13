// Event Types

export interface Event {
  id: string;
  name: string;
  targetDate: string; // ISO 8601 format
  createdAt: string;
  categoryId?: string;
  isRecurring: boolean;
  recurringType?: 'yearly' | 'monthly' | 'weekly';
  notificationEnabled: boolean;
  notificationTimes?: number[]; // Minutes before event (e.g., [60, 1440] for 1 hour and 1 day)
  userId?: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon?: string;
}

// Countdown Time Remaining
export interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
  isFinished: boolean;
}

// Theme Types
export type ThemeMode = 'light' | 'dark';

export interface Theme {
  mode: ThemeMode;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    card: string;
    text: string;
    textSecondary: string;
    border: string;
    error: string;
    success: string;
    warning: string;
    gradient: string[];
  };
}

// App State
export interface AppState {
  events: Event[];
  categories: Category[];
  theme: ThemeMode;
  isLoading: boolean;
}

// Form Types
export interface EventFormData {
  name: string;
  targetDate: Date;
  categoryId?: string;
  isRecurring: boolean;
  recurringType?: 'yearly' | 'monthly' | 'weekly';
  notificationEnabled: boolean;
  notificationTimes?: number[];
}

// Navigation Types (para uso futuro)
export type RootStackParamList = {
  Home: undefined;
  Settings: undefined;
  EventDetail: { eventId: string };
};

// Notification Types
export interface NotificationConfig {
  eventId: string;
  eventName: string;
  triggerDate: string;
  minutesBefore: number;
}

// Share Types
export interface ShareEventData {
  name: string;
  date: string;
  message: string;
}

