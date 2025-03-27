import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Theme = 'light' | 'dark' | 'system';

interface Colors {
  primary: string;
  secondary: string;
  background: string;
  card: string;
  border: string;
  text: string;
  textSecondary: string;
  success: string;
  error: string;
  warning: string;
  info: string;
}

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isDark: boolean;
  colors: Colors;
}

const lightColors: Colors = {
  primary: '#FF4D6A',
  secondary: '#6B7280',
  background: '#FFFFFF',
  card: '#F3F4F6',
  border: '#E5E7EB',
  text: '#111827',
  textSecondary: '#6B7280',
  success: '#34C759',
  error: '#FF3B30',
  warning: '#FF9500',
  info: '#007AFF'
};

const darkColors: Colors = {
  primary: '#FF4D6A',
  secondary: '#888888',
  background: '#000000',
  card: '#0A0A0A',
  border: '#374151',
  text: '#FFFFFF',
  textSecondary: '#888888',
  success: '#32D74B',
  error: '#FF453A',
  warning: '#FFD60A',
  info: '#0A84FF'
};

const ThemeContext = createContext<ThemeContextType>({
  theme: 'system',
  setTheme: () => {},
  isDark: false,
  colors: lightColors
});

export const useTheme = () => useContext(ThemeContext);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [theme, setThemeState] = useState<Theme>('system');
  const [colors, setColors] = useState<Colors>(lightColors);

  useEffect(() => {
    loadTheme();
  }, []);

  useEffect(() => {
    const isDark = theme === 'system' ? systemColorScheme === 'dark' : theme === 'dark';
    setColors(isDark ? darkColors : lightColors);
  }, [theme, systemColorScheme]);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('@theme') as Theme;
      if (savedTheme) {
        setThemeState(savedTheme);
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    }
  };

  const setTheme = async (newTheme: Theme) => {
    setThemeState(newTheme);
    try {
      await AsyncStorage.setItem('@theme', newTheme);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  const isDark = theme === 'system' ? systemColorScheme === 'dark' : theme === 'dark';

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isDark, colors }}>
      {children}
    </ThemeContext.Provider>
  );
}