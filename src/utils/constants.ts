// Storage Keys
export const STORAGE_KEYS = {
  EVENTS: '@countdown_events',
  CATEGORIES: '@countdown_categories',
  THEME: '@countdown_theme',
  USER_ID: '@countdown_user_id',
} as const;

// Default Categories
export const DEFAULT_CATEGORIES = [
  { id: '1', name: 'Pessoal', color: '#ef4444', icon: '👤' },
  { id: '2', name: 'Trabalho', color: '#3b82f6', icon: '💼' },
  { id: '3', name: 'Aniversários', color: '#ec4899', icon: '🎂' },
  { id: '4', name: 'Viagens', color: '#22c55e', icon: '✈️' },
  { id: '5', name: 'Eventos', color: '#f59e0b', icon: '🎉' },
] as const;

// Notification Times (in minutes before event)
export const NOTIFICATION_PRESETS = [
  { label: '5 minutos antes', value: 5 },
  { label: '15 minutos antes', value: 15 },
  { label: '30 minutos antes', value: 30 },
  { label: '1 hora antes', value: 60 },
  { label: '2 horas antes', value: 120 },
  { label: '1 dia antes', value: 1440 },
  { label: '1 semana antes', value: 10080 },
] as const;

// App Config
export const APP_CONFIG = {
  name: 'Countdown App',
  version: '1.0.0',
  refreshInterval: 1000, // Update countdown every 1 second
} as const;

