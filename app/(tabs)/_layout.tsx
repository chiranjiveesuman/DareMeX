import { Tabs } from 'expo-router';
import { Platform, useColorScheme } from 'react-native';
import { Home, Award, Plus, Compass, User } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import { colors, useThemeStyles } from '@/styles/globalStyles';

const TAB_ICON_SIZE = 24;

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const styles = useThemeStyles();
  
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          ...styles.tabBar,
          backgroundColor: Platform.select({
            ios: 'transparent',
            default: isDark ? colors.background.card.dark : colors.background.card.light,
          }),
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
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: isDark ? colors.text.secondary.dark : colors.text.secondary.light,
        tabBarLabelStyle: styles.tabBarLabel,
      }}>
      <Tabs.Screen
        name="create"
        options={{
          title: 'Create',
          tabBarIcon: ({ color }) => (
            <Plus size={TAB_ICON_SIZE} color={color} />
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