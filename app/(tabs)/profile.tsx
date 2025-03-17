import { View, Text, Pressable, ScrollView, useColorScheme, Image } from 'react-native';
import { Settings, Bell, CircleHelp as HelpCircle, LogOut, Award, Mail, User } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { globalStyles, colors, gradientColors, useThemeStyles } from '@/styles/globalStyles';
import { useEffect } from 'react';

const MENU_ITEMS = [
  {
    icon: Settings,
    title: 'Settings & Privacy',
    description: 'Account settings, privacy and security',
    route: '/settings' as const,
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

const STATS = [
  {
    label: 'Dares Completed',
    value: 42,
  },
  {
    label: 'Followers',
    value: 1.2,
    suffix: 'K',
  },
  {
    label: 'Following',
    value: 384,
  },
];

// Function to get a random anime avatar
const getAnimeAvatar = (userId: string) => {
  // Using a seed based on user ID to maintain consistency
  const seed = userId ? parseInt(userId.substring(0, 8), 16) % 100 : Math.floor(Math.random() * 100);
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9`;
};

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
                uri: getAnimeAvatar(user.id),
              }}
              style={{ 
                width: 80, 
                height: 80, 
                borderRadius: 40,
                borderWidth: 3,
                borderColor: colors.primary,
              }}
            />
            <View style={{ alignItems: 'center' }}>
              <Text style={styles.cardTitle}>{user.username}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Award size={16} color={colors.primary} />
                <Text style={styles.cardContent}>Level 15 • 2,500 points</Text>
              </View>
            </View>

            {/* User details */}
            <View style={{
              width: '100%',
              marginTop: 8,
              paddingTop: 16,
              gap: 8,
              borderTopWidth: 1,
              borderTopColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Mail size={16} color={isDark ? colors.text.secondary.dark : colors.text.secondary.light} />
                <Text style={styles.cardContent}>{user.email}</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <User size={16} color={isDark ? colors.text.secondary.dark : colors.text.secondary.light} />
                <Text style={styles.cardContent}>25, Male</Text>
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
                  <Text style={[styles.cardTitle, { fontSize: 18 }]}>
                    {stat.value}{stat.suffix || ''}
                  </Text>
                  <Text style={styles.cardContent}>{stat.label}</Text>
                </View>
              ))}
            </View>
          </View>
        </Animated.View>

        {/* Menu Items */}
        <View style={{ marginTop: 24, gap: 12 }}>
          <Text style={[styles.title, { marginBottom: 8 }]}>Settings</Text>
          
          {MENU_ITEMS.map((item, index) => (
            <AnimatedPressable
              key={item.title}
              entering={FadeInDown.delay(200 + index * 100)}
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