import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { Home, Lock, Award, User } from 'lucide-react-native';
import { BlurView } from 'expo-blur';

const TAB_ICON_SIZE = 24;
const TAB_ICON_COLOR = '#71717A';
const TAB_ICON_COLOR_ACTIVE = '#FF4D6A';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Platform.select({
            ios: 'transparent',
            default: '#18181B',
          }),
          borderTopWidth: 0,
          elevation: 0,
          height: 60,
        },
        tabBarBackground: Platform.select({
          ios: () => (
            <BlurView
              tint="dark"
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
        tabBarActiveTintColor: TAB_ICON_COLOR_ACTIVE,
        tabBarInactiveTintColor: TAB_ICON_COLOR,
        tabBarLabelStyle: {
          fontFamily: 'SpaceGrotesk-Regular',
          fontSize: 12,
          marginBottom: 8,
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
          title: 'Dares',
          tabBarIcon: ({ color }) => (
            <Lock size={TAB_ICON_SIZE} color={color} />
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