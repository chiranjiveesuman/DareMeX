import { View, Text, Image, Pressable, ScrollView, useColorScheme } from 'react-native';
import { Settings, Bell, CircleHelp as HelpCircle, LogOut, Award } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { globalStyles, colors, gradientColors, useThemeStyles } from '@/styles/globalStyles';
import { useEffect } from 'react';

const MENU_ITEMS = [
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

const STATS = [
  {
    label: 'Dares',
    sublabel: 'Completed',
    value: 42,
  },
  {
    label: 'Followers',
    value: '1.2K',
  },
  {
    label: 'Following',
    value: 384,
  },
];

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function ProfileScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const styles = useThemeStyles();

  useEffect(() => {
    if (!user) {
      router.replace('/(auth)/sign-in');
    }
  }, [user]);

  if (!user) return null;

  const handleMenuItemPress = (route: typeof MENU_ITEMS[number]['route']) => {
    router.push(route);
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/(auth)/sign-in');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[gradientColors.header.start, gradientColors.header.end]}
        style={styles.headerGradient}>
        <Text style={styles.headerTitle}>Profile</Text>
        <Text style={styles.headerSubtitle}>Your account and preferences</Text>
      </LinearGradient>

      <ScrollView 
        style={{ flex: 1 }} 
        contentContainerStyle={styles.content}>
        
        {/* Profile Card */}
        <Animated.View
          entering={FadeInDown.delay(100)}
          style={styles.card}>
          <View style={{ padding: 16, alignItems: 'center', gap: 12 }}>
            <Image
              source={{
                uri: user?.avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&auto=format&fit=crop',
              }}
              style={{ 
                width: 80, 
                height: 80, 
                borderRadius: 40,
                borderWidth: 3,
                borderColor: colors.primary,
              }}
            />
            <View style={{ alignItems: 'center', gap: 4 }}>
              <Text style={styles.cardTitle}>{user?.username}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Award size={16} color={colors.primary} />
                <Text style={styles.cardContent}>Level 15 • 2,500 points</Text>
              </View>
            </View>

            {/* Stats */}
            <View style={{ 
              flexDirection: 'row', 
              width: '100%', 
              justifyContent: 'space-around',
              marginTop: 8,
              paddingTop: 16,
              borderTopWidth: 1,
              borderTopColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
            }}>
              {STATS.map((stat, index) => (
                <View key={stat.label} style={{ alignItems: 'center' }}>
                  <Text style={[styles.cardTitle, { fontSize: 20, color: colors.primary }]}>
                    {stat.value}
                  </Text>
                  <Text style={[styles.cardContent, { fontSize: 14, opacity: 0.8 }]}>
                    {stat.label}
                  </Text>
                  {stat.sublabel && (
                    <Text style={[styles.cardContent, { fontSize: 12, opacity: 0.6 }]}>
                      {stat.sublabel}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          </View>
        </Animated.View>

        {/* Menu Items */}
        <View style={{ marginTop: 24, gap: 12 }}>
          <Text style={[styles.title, { marginBottom: 8 }]}>Settings</Text>
          
          <AnimatedPressable
            entering={FadeInDown.delay(200)}
            style={styles.card}
            onPress={() => router.push('/settings')}>
            <View style={{ padding: 16, flexDirection: 'row', alignItems: 'center', gap: 16 }}>
              <View style={styles.iconContainer}>
                <Settings size={20} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>Settings & Privacy</Text>
                <Text style={styles.cardContent}>Manage your account settings and privacy preferences</Text>
              </View>
            </View>
          </AnimatedPressable>
          
          {MENU_ITEMS.map((item, index) => (
            <AnimatedPressable
              key={item.title}
              entering={FadeInDown.delay(300 + index * 100)}
              style={styles.card}
              onPress={() => handleMenuItemPress(item.route)}>
              <View style={{ padding: 16, flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                <View style={styles.iconContainer}>
                  <item.icon size={20} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  <Text style={styles.cardContent}>{item.description}</Text>
                </View>
              </View>
            </AnimatedPressable>
          ))}
          
          <AnimatedPressable
            entering={FadeInDown.delay(600)}
            style={styles.card}
            onPress={handleSignOut}>
            <View style={{ padding: 16, flexDirection: 'row', alignItems: 'center', gap: 16 }}>
              <View style={styles.iconContainer}>
                <LogOut size={20} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>Sign Out</Text>
                <Text style={styles.cardContent}>Log out of your account</Text>
              </View>
            </View>
          </AnimatedPressable>
        </View>
      </ScrollView>
    </View>
  );
}