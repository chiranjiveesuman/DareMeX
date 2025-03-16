import { View, Text, Image, Pressable, ScrollView } from 'react-native';
import { Settings, Lock, Bell, CircleHelp as HelpCircle, LogOut } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { globalStyles, colors, gradientColors } from '@/styles/globalStyles';

const MENU_ITEMS = [
  {
    icon: Settings,
    title: 'Settings',
    description: 'App preferences and account settings',
    route: '/settings' as const,
  },
  {
    icon: Lock,
    title: 'Privacy',
    description: 'Manage your privacy and security',
    route: '/privacy' as const,
  },
  {
    icon: Bell,
    title: 'Notifications',
    description: 'Control notification preferences',
    route: '/notifications' as const,
  },
  {
    icon: HelpCircle,
    title: 'Help & Support',
    description: 'Get help and contact support',
    route: '/help' as const,
  },
];

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function ProfileScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();

  const handleMenuItemPress = (route: typeof MENU_ITEMS[number]['route']) => {
    router.push(route);
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/(auth)/sign-in');
  };

  // If no user is logged in, redirect to sign-in
  if (!user) {
    router.replace('/(auth)/sign-in');
    return null;
  }

  return (
    <View style={globalStyles.container}>
      <LinearGradient
        colors={[gradientColors.primary.start, gradientColors.primary.end]}
        style={globalStyles.header}>
        <Image
          source={{
            uri: user?.avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&auto=format&fit=crop',
          }}
          style={globalStyles.avatar}
        />
        <Text style={globalStyles.title}>{user?.username || 'Sarah Johnson'}</Text>
        <Text style={globalStyles.subtitle}>Level 15 • 2,500 points</Text>
      </LinearGradient>

      <ScrollView 
        style={{ flex: 1 }} 
        contentContainerStyle={globalStyles.content}>
        <View style={{ gap: 16 }}>
          {MENU_ITEMS.map((item, index) => (
            <AnimatedPressable
              key={item.title}
              entering={FadeInDown.delay(200 + index * 100)}
              style={globalStyles.menuItem}
              onPress={() => handleMenuItemPress(item.route)}>
              <View style={globalStyles.iconContainer}>
                <item.icon size={20} color={colors.primary} />
              </View>
              <View style={globalStyles.menuItemContent}>
                <Text style={globalStyles.menuItemTitle}>{item.title}</Text>
                <Text style={globalStyles.menuItemDescription}>{item.description}</Text>
              </View>
            </AnimatedPressable>
          ))}
          
          <AnimatedPressable
            entering={FadeInDown.delay(600)}
            style={globalStyles.menuItem}
            onPress={handleSignOut}>
            <View style={globalStyles.iconContainer}>
              <LogOut size={20} color={colors.primary} />
            </View>
            <View style={globalStyles.menuItemContent}>
              <Text style={globalStyles.menuItemTitle}>Sign Out</Text>
              <Text style={globalStyles.menuItemDescription}>Log out of your account</Text>
            </View>
          </AnimatedPressable>
        </View>
      </ScrollView>
    </View>
  );
}