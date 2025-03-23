import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Theme = 'light' | 'dark' | 'system';

interface Colors {
  primary: string;
  background: {
    dark: string;
    light: string;
    card: {
      dark: string;
      light: string;
    };
  };
  text: {
    primary: {
      dark: string;
      light: string;
    };
    secondary: {
      dark: string;
      light: string;
    };
  };
}

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isDark: boolean;
  colors: Colors;
}

const defaultColors: Colors = {
  primary: '#2563EB',
  background: {
    dark: '#111827',
    light: '#FFFFFF',
    card: {
      dark: '#1F2937',
      light: '#F3F4F6'
    }
  },
  text: {
    primary: {
      dark: '#F9FAFB',
      light: '#111827'
    },
    secondary: {
      dark: '#9CA3AF',
      light: '#6B7280'
    }
  }
};

const ThemeContext = createContext<ThemeContextType>({
  theme: 'system',
  setTheme: () => {},
  isDark: false,
  colors: defaultColors
});

export const useTheme = () => useContext(ThemeContext);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [theme, setThemeState] = useState<Theme>('system');

  useEffect(() => {
    loadTheme();
  }, []);

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
    <ThemeContext.Provider value={{ theme, setTheme, isDark, colors: defaultColors }}>
      {children}
    </ThemeContext.Provider>
  );
}