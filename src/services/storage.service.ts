import AsyncStorage from '@react-native-async-storage/async-storage';
import { Event, ThemeMode } from '../types';
import { STORAGE_KEYS } from '../utils/constants';

/**
 * Storage Service - Handles all AsyncStorage operations
 */

// Events Storage
export const saveEvents = async (events: Event[]): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(events);
    await AsyncStorage.setItem(STORAGE_KEYS.EVENTS, jsonValue);
  } catch (error) {
    console.error('Error saving events:', error);
    throw error;
  }
};

export const loadEvents = async (): Promise<Event[]> => {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.EVENTS);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (error) {
    console.error('Error loading events:', error);
    return [];
  }
};

// Theme Storage
export const saveTheme = async (theme: ThemeMode): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.THEME, theme);
  } catch (error) {
    console.error('Error saving theme:', error);
    throw error;
  }
};

export const loadTheme = async (): Promise<ThemeMode | null> => {
  try {
    const theme = await AsyncStorage.getItem(STORAGE_KEYS.THEME);
    return theme as ThemeMode | null;
  } catch (error) {
    console.error('Error loading theme:', error);
    return null;
  }
};

// Clear all data (useful for debugging or reset)
export const clearAllData = async (): Promise<void> => {
  try {
    await AsyncStorage.clear();
  } catch (error) {
    console.error('Error clearing data:', error);
    throw error;
  }
};

