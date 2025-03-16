import React from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Sun, Moon, Globe, Menu } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { BlurView } from 'expo-blur';

export default function Header() {
  const router = useRouter();
  const { theme, setTheme, isDark } = useTheme();
  const { t, locale, setLocale } = useLanguage();
  const { user } = useAuth();

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  const toggleLanguage = () => {
    setLocale(locale === 'en' ? 'es' : 'en');
  };

  return (
    <View style={styles.container}>
      {Platform.OS === 'ios' ? (
        <BlurView intensity={100} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
      ) : (
        <View style={[
          StyleSheet.absoluteFill,
          { backgroundColor: isDark ? '#18181B' : '#FFFFFF' }
        ]} />
      )}
      
      <View style={styles.content}>
        <Text style={[styles.logo, { color: isDark ? '#FFFFFF' : '#000000' }]}>
          DareMeX
        </Text>

        <View style={styles.actions}>
          <Pressable
            onPress={toggleLanguage}
            style={styles.iconButton}
            accessibilityLabel="Toggle language"
            accessibilityRole="button">
            <Globe size={24} color={isDark ? '#FFFFFF' : '#000000'} />
          </Pressable>

          <Pressable
            onPress={toggleTheme}
            style={styles.iconButton}
            accessibilityLabel="Toggle theme"
            accessibilityRole="button">
            {isDark ? (
              <Sun size={24} color="#FFFFFF" />
            ) : (
              <Moon size={24} color="#000000" />
            )}
          </Pressable>

          {!user ? (
            <Pressable
              onPress={() => router.push('/(auth)/sign-in')}
              style={styles.authButton}>
              <Text style={styles.authButtonText}>Sign In</Text>
            </Pressable>
          ) : (
            <Pressable
              onPress={() => router.push('/profile')}
              style={styles.iconButton}>
              <Menu size={24} color={isDark ? '#FFFFFF' : '#000000'} />
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: Platform.OS === 'web' ? 64 : 84,
    zIndex: 1000,
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'web' ? 0 : 20,
  },
  logo: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 24,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  authButton: {
    backgroundColor: '#FF4D6A',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  authButtonText: {
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
  },
});