import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Users, Lock, Sparkles, Bell } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { UserSearch } from '@/components/UserSearch';
import SafeAreaWrapper from '@/components/SafeAreaWrapper';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface DareCategory {
  id: string;
  title: string;
  description: string;
  icon: any;
}

const CATEGORIES: DareCategory[] = [
  {
    id: 'public',
    title: 'Public Dares',
    description: 'Join community challenges and show your daring side',
    icon: Users,
  },
  {
    id: 'private',
    title: 'Private Dares',
    description: 'Create exclusive challenges for your friends',
    icon: Lock,
  },
  {
    id: 'ai',
    title: 'AI Dares',
    description: 'Get personalized dare suggestions powered by AI',
    icon: Sparkles,
  },
];

interface RecentDare {
  id: string;
  title: string;
  creator: string;
  participants: number;
}

const RECENT_DARES: RecentDare[] = [
  {
    id: '1',
    title: 'Ice Bucket Challenge',
    creator: 'CosmicWolf365',
    participants: 128,
  },
  {
    id: '2',
    title: 'Lip Sync Battle',
    creator: 'MysticDragon789',
    participants: 64,
  },
  {
    id: '3',
    title: 'Blindfolded Makeup',
    creator: 'NobleEagle123',
    participants: 96,
  },
];

export default function HomeScreen() {
  const { colors, isDark } = useTheme();
  const router = useRouter();

  const handleNotificationPress = () => {
    router.push('../../notifications');
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors?.background?.[isDark ? 'dark' : 'light'] ?? (isDark ? '#111827' : '#FFFFFF'),
    },
    header: {
      padding: 16,
      backgroundColor: colors?.background?.card?.[isDark ? 'dark' : 'light'] ?? (isDark ? '#1F2937' : '#F3F4F6'),
      borderBottomWidth: 1,
      borderBottomColor: isDark ? '#374151' : '#E5E7EB',
    },
    headerTitle: {
      fontFamily: 'SpaceGrotesk-Bold',
      fontSize: 32,
      color: colors?.text?.primary?.[isDark ? 'dark' : 'light'] ?? (isDark ? '#F9FAFB' : '#111827'),
      marginBottom: 4,
    },
    headerSubtitle: {
      fontFamily: 'Inter-Regular',
      fontSize: 16,
      color: colors?.text?.secondary?.[isDark ? 'dark' : 'light'] ?? (isDark ? '#9CA3AF' : '#6B7280'),
    },
    notificationButton: {
      position: 'absolute',
      top: 16,
      right: 16,
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: colors?.background?.card?.[isDark ? 'dark' : 'light'] ?? (isDark ? '#1F2937' : '#F3F4F6'),
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: isDark ? '#374151' : '#E5E7EB',
      zIndex: 1,
    },
    content: {
      padding: 16,
      paddingBottom: 32,
    },
    sectionTitle: {
      fontFamily: 'SpaceGrotesk-Bold',
      fontSize: 20,
      color: colors?.text?.primary?.[isDark ? 'dark' : 'light'] ?? (isDark ? '#F9FAFB' : '#111827'),
      marginBottom: 16,
    },
    categoryCard: {
      backgroundColor: colors?.background?.card?.[isDark ? 'dark' : 'light'] ?? (isDark ? '#1F2937' : '#F3F4F6'),
      borderRadius: 12,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: isDark ? '#374151' : '#E5E7EB',
    },
    categoryContent: {
      padding: 16,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
    },
    iconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors?.primary?.[isDark ? 'dark' : 'light'] + '20',
      justifyContent: 'center',
      alignItems: 'center',
    },
    categoryInfo: {
      flex: 1,
    },
    categoryTitle: {
      fontFamily: 'SpaceGrotesk-Bold',
      fontSize: 16,
      color: colors?.text?.primary?.[isDark ? 'dark' : 'light'] ?? (isDark ? '#F9FAFB' : '#111827'),
      marginBottom: 4,
    },
    categoryDescription: {
      fontFamily: 'Inter-Regular',
      fontSize: 14,
      color: colors?.text?.secondary?.[isDark ? 'dark' : 'light'] ?? (isDark ? '#9CA3AF' : '#6B7280'),
    },
    dareCard: {
      backgroundColor: colors?.background?.card?.[isDark ? 'dark' : 'light'] ?? (isDark ? '#1F2937' : '#F3F4F6'),
      borderRadius: 12,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: isDark ? '#374151' : '#E5E7EB',
    },
    dareContent: {
      padding: 16,
      gap: 12,
    },
    dareTitle: {
      fontFamily: 'SpaceGrotesk-Bold',
      fontSize: 18,
      color: colors?.text?.primary?.[isDark ? 'dark' : 'light'] ?? (isDark ? '#F9FAFB' : '#111827'),
    },
    dareFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    participants: {
      fontFamily: 'Inter-Medium',
      fontSize: 14,
      color: colors?.primary?.[isDark ? 'dark' : 'light'],
    },
    creator: {
      fontFamily: 'Inter-Regular',
      fontSize: 14,
      color: colors?.text?.secondary?.[isDark ? 'dark' : 'light'] ?? (isDark ? '#9CA3AF' : '#6B7280'),
    },
  });
  
  return (
    <SafeAreaWrapper>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.notificationButton}
            onPress={handleNotificationPress}
            activeOpacity={0.6}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Bell 
              size={24} 
              color={colors?.text?.primary?.[isDark ? 'dark' : 'light'] ?? (isDark ? '#F9FAFB' : '#111827')}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>DareMeX</Text>
          <Text style={styles.headerSubtitle}>Dare to be different</Text>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          {/* Search Bar */}
          <UserSearch />

          {/* Categories */}
          <View style={{ marginBottom: 24 }}>
            <Text style={styles.sectionTitle}>Dare Categories</Text>
            {CATEGORIES.map((category, index) => (
              <AnimatedTouchable
                key={category.id}
                entering={FadeInDown.delay(100 + index * 100)}
                style={styles.categoryCard}
              >
                <View style={styles.categoryContent}>
                  <View style={styles.iconContainer}>
                    <category.icon size={20} color={colors?.primary?.[isDark ? 'dark' : 'light']} />
                  </View>
                  <View style={styles.categoryInfo}>
                    <Text style={styles.categoryTitle}>{category.title}</Text>
                    <Text style={styles.categoryDescription}>{category.description}</Text>
                  </View>
                </View>
              </AnimatedTouchable>
            ))}
          </View>

          {/* Recent Activity */}
          <View>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            {RECENT_DARES.map((dare, index) => (
              <AnimatedTouchable
                key={dare.id}
                entering={FadeInDown.delay(200 + index * 100)}
                style={styles.dareCard}
              >
                <View style={styles.dareContent}>
                  <Text style={styles.dareTitle}>{dare.title}</Text>
                  <View style={styles.dareFooter}>
                    <Text style={styles.participants}>
                      {dare.participants} participants
                    </Text>
                    <Text style={styles.creator}>
                      by {dare.creator}
                    </Text>
                  </View>
                </View>
              </AnimatedTouchable>
            ))}
          </View>
        </ScrollView>
      </View>
    </SafeAreaWrapper>
  );
}