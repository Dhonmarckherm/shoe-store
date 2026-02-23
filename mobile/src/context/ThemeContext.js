import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const storedTheme = await AsyncStorage.getItem('theme');
      if (storedTheme) {
        setTheme(storedTheme);
      } else {
        setTheme(systemColorScheme || 'light');
      }
    } catch (error) {
      console.error('Load theme error:', error);
    }
  };

  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    try {
      await AsyncStorage.setItem('theme', newTheme);
    } catch (error) {
      console.error('Save theme error:', error);
    }
  };

  const colors = {
    light: {
      background: '#f8fafc',
      surface: '#ffffff',
      primary: '#2563eb',
      text: '#0f172a',
      textSecondary: '#64748b',
      border: '#e2e8f0',
      error: '#ef4444',
      success: '#22c55e',
    },
    dark: {
      background: '#0f172a',
      surface: '#1e293b',
      primary: '#3b82f6',
      text: '#f8fafc',
      textSecondary: '#94a3b8',
      border: '#334155',
      error: '#f87171',
      success: '#4ade80',
    },
  };

  const value = {
    theme,
    isDark: theme === 'dark',
    colors: colors[theme],
    toggleTheme,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};
