import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { Home, Award, Plus, Compass, User } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from '@/context/ThemeContext';
import { useMemo } from 'react';

const TAB_ICON_SIZE = 24;

// Fallback colors that match the existing theme
const defaultColors = {
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

export default function TabLayout() {
  const { colors, isDark } = useTheme();
  
  // Ensure we have valid colors even if theme isn't loaded
  const backgroundColor = isDark ? '#1F2937' : '#FFFFFF';
  const borderColor = isDark ? '#374151' : '#E5E7EB';
  const activeColor = colors?.primary ?? '#2563EB';
  const inactiveColor = isDark ? '#9CA3AF' : '#6B7280';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          elevation: 0,
          height: 60,
          backgroundColor: Platform.select({
            ios: 'transparent',
            default: backgroundColor,
          }),
          borderTopWidth: 1,
          borderTopColor: borderColor,
        },
        tabBarBackground: Platform.select({
          ios: () => (
            <BlurView
              tint={isDark ? "dark" : "light"}
              intensity={100}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
              }}
            />
          ),
          default: undefined,
        }),
        tabBarActiveTintColor: activeColor,
        tabBarInactiveTintColor: inactiveColor,
        tabBarLabelStyle: {
          fontFamily: 'Inter-Medium',
          fontSize: 12,
          marginBottom: 4,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <Home size={TAB_ICON_SIZE} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="discover"
        options={{
          title: 'Discover',
          tabBarIcon: ({ color }) => (
            <Compass size={TAB_ICON_SIZE} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="leaderboard"
        options={{
          title: 'Top',
          tabBarIcon: ({ color }) => (
            <Award size={TAB_ICON_SIZE} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="create/index"
        options={{
          title: 'Create',
          tabBarIcon: ({ color }) => (
            <Plus size={TAB_ICON_SIZE} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => (
            <User size={TAB_ICON_SIZE} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}