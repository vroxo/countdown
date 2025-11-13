import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { Theme, ThemeMode } from '../types';
import { lightTheme, darkTheme } from '../theme/colors';
import { saveTheme, loadTheme } from '../services/storage.service';

interface ThemeContextType {
  theme: Theme;
  themeMode: ThemeMode;
  toggleTheme: () => void;
  setThemeMode: (mode: ThemeMode) => void;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [themeMode, setThemeMode] = useState<ThemeMode>('light');
  const [isLoaded, setIsLoaded] = useState(false);

  // Load theme from storage on mount
  useEffect(() => {
    const loadStoredTheme = async () => {
      try {
        const storedTheme = await loadTheme();
        if (storedTheme) {
          setThemeMode(storedTheme);
        }
      } catch (error) {
        console.error('Failed to load theme:', error);
      } finally {
        setIsLoaded(true);
      }
    };

    loadStoredTheme();
  }, []);

  // Save theme whenever it changes
  useEffect(() => {
    if (isLoaded) {
      saveTheme(themeMode).catch((error) => {
        console.error('Failed to save theme:', error);
      });
    }
  }, [themeMode, isLoaded]);

  const theme = themeMode === 'light' ? lightTheme : darkTheme;

  const toggleTheme = () => {
    setThemeMode(prev => prev === 'light' ? 'dark' : 'light');
  };

  const value: ThemeContextType = {
    theme,
    themeMode,
    toggleTheme,
    setThemeMode,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

