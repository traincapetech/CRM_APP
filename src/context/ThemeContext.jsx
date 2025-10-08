import React, { createContext, useState, useContext, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load theme preference from storage
  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme');
      if (savedTheme) {
        setIsDarkMode(savedTheme === 'dark');
      } else {
        // Use system preference if no saved theme
        setIsDarkMode(systemColorScheme === 'dark');
      }
    } catch (error) {
      console.error('Error loading theme preference:', error);
      setIsDarkMode(systemColorScheme === 'dark');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTheme = async () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    try {
      await AsyncStorage.setItem('theme', newMode ? 'dark' : 'light');
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
    return newMode;
  };

  const setTheme = async (mode) => {
    const isDark = mode === 'dark';
    setIsDarkMode(isDark);
    try {
      await AsyncStorage.setItem('theme', mode);
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  // Custom theme based on Material Design 3
  const lightTheme = {
    ...MD3LightTheme,
    colors: {
      ...MD3LightTheme.colors,
      primary: '#2196F3',
      primaryContainer: '#E3F2FD',
      secondary: '#4CAF50',
      secondaryContainer: '#E8F5E9',
      background: '#F5F5F5',
      surface: '#FFFFFF',
      surfaceVariant: '#F5F5F5',
      error: '#F44336',
      errorContainer: '#FFEBEE',
      onPrimary: '#FFFFFF',
      onSecondary: '#FFFFFF',
      onBackground: '#000000',
      onSurface: '#000000',
      outline: '#E0E0E0',
      text: '#000000',
      textSecondary: '#666666',
    },
  };

  const darkTheme = {
    ...MD3DarkTheme,
    colors: {
      ...MD3DarkTheme.colors,
      primary: '#64B5F6',
      primaryContainer: '#1565C0',
      secondary: '#81C784',
      secondaryContainer: '#2E7D32',
      background: '#121212',
      surface: '#1E1E1E',
      surfaceVariant: '#2C2C2C',
      error: '#EF5350',
      errorContainer: '#B71C1C',
      onPrimary: '#000000',
      onSecondary: '#000000',
      onBackground: '#FFFFFF',
      onSurface: '#FFFFFF',
      outline: '#424242',
      text: '#FFFFFF',
      textSecondary: '#AAAAAA',
    },
  };

  const theme = isDarkMode ? darkTheme : lightTheme;

  const value = {
    isDarkMode,
    theme,
    toggleTheme,
    setTheme,
    isLoading,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

