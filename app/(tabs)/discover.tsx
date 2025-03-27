import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Compass, TrendingUp, Sparkles, Flame, Users, Lock } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme } from '@/context/ThemeContext';
import SafeAreaWrapper from '@/components/SafeAreaWrapper';
import { UserSearch } from '@/components/UserSearch';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

type DifficultyLevel = 'Easy' | 'Medium' | 'Hard';

const DIFFICULTY_COLORS: Record<DifficultyLevel, string> = {
  Easy: '#22C55E',
  Medium: '#F59E0B',
  Hard: '#EF4444',
};

interface Category {
  id: string;
  title: string;
  icon: any;
  color: string;
}

const CATEGORIES: Category[] = [
  {
    id: 'trending',
    title: 'Trending',
    icon: TrendingUp,
    color: '#FF4D6A',
  },
  {
    id: 'new',
    title: 'New',
    icon: Sparkles,
    color: '#F59E0B',
  },
  {
    id: 'hot',
    title: 'Hot',
    icon: Flame,
    color: '#EF4444',
  },
  {
    id: 'explore',
    title: 'Explore',
    icon: Compass,
    color: '#22C55E',
  },
];

interface DareCategory {
  id: string;
  title: string;
  description: string;
  icon: any;
}

const DARE_CATEGORIES: DareCategory[] = [
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

interface Dare {
  title: string;
  description: string;
  difficulty: DifficultyLevel;
  participants: number;
  creator: string;
}

const POPULAR_DARES: Dare[] = [
  {
    title: 'Dance Challenge',
    description: 'Show off your best dance moves to a trending song',
    difficulty: 'Easy',
    participants: 128,
    creator: 'SwiftPhoenix42',
  },
  {
    title: 'Karaoke Time',
    description: 'Sing your heart out to your favorite song in public',
    difficulty: 'Medium',
    participants: 64,
    creator: 'MysticDragon789',
  },
  {
    title: 'Food Challenge',
    description: 'Try this unique food combination and record your reaction',
    difficulty: 'Hard',
    participants: 256,
    creator: 'CosmicWolf365',
  },
  {
    title: 'Random Act of Kindness',
    description: 'Do something unexpectedly nice for a stranger and capture their reaction',
    difficulty: 'Easy',
    participants: 512,
    creator: 'NobleEagle123',
  },
  {
    title: 'Talent Showcase',
    description: 'Show off your hidden talent in a creative way',
    difficulty: 'Medium',
    participants: 96,
    creator: 'PhantomRider567',
  },
];

export default function DiscoverScreen() {
  const { colors, isDark } = useTheme();

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
    categoriesContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
      marginBottom: 24,
    },
    categoryCard: {
      flex: 1,
      minWidth: '45%',
      backgroundColor: colors?.background?.card?.[isDark ? 'dark' : 'light'] ?? (isDark ? '#1F2937' : '#F3F4F6'),
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: isDark ? '#374151' : '#E5E7EB',
    },
    categoryTitle: {
      fontFamily: 'SpaceGrotesk-Bold',
      fontSize: 16,
      color: colors?.text?.primary?.[isDark ? 'dark' : 'light'] ?? (isDark ? '#F9FAFB' : '#111827'),
      marginTop: 8,
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
    dareDescription: {
      fontFamily: 'Inter-Regular',
      fontSize: 14,
      color: colors?.text?.secondary?.[isDark ? 'dark' : 'light'] ?? (isDark ? '#9CA3AF' : '#6B7280'),
    },
    dareFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 12,
    },
    participants: {
      fontFamily: 'Inter-Medium',
      fontSize: 14,
      color: colors?.primary ?? '#000000',
    },
    creator: {
      fontFamily: 'Inter-Regular',
      fontSize: 14,
      color: colors?.text?.secondary?.[isDark ? 'dark' : 'light'] ?? (isDark ? '#9CA3AF' : '#6B7280'),
    },
    difficultyBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
      alignSelf: 'flex-start',
    },
    difficultyText: {
      fontFamily: 'Inter-Medium',
      fontSize: 12,
      color: '#FFFFFF',
    },
    dareCategoryCard: {
      backgroundColor: colors?.background?.card?.[isDark ? 'dark' : 'light'] ?? (isDark ? '#1F2937' : '#F3F4F6'),
      borderRadius: 12,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: isDark ? '#374151' : '#E5E7EB',
    },
    dareCategoryContent: {
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
    dareCategoryInfo: {
      flex: 1,
    },
    dareCategoryTitle: {
      fontFamily: 'SpaceGrotesk-Bold',
      fontSize: 16,
      color: colors?.text?.primary?.[isDark ? 'dark' : 'light'] ?? (isDark ? '#F9FAFB' : '#111827'),
      marginBottom: 4,
    },
    dareCategoryDescription: {
      fontFamily: 'Inter-Regular',
      fontSize: 14,
      color: colors?.text?.secondary?.[isDark ? 'dark' : 'light'] ?? (isDark ? '#9CA3AF' : '#6B7280'),
    },
  });

  return (
    <SafeAreaWrapper>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Discover</Text>
          <Text style={styles.headerSubtitle}>Find your next challenge</Text>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          {/* User Search */}
          <UserSearch />

          {/* Dare Categories */}
          <View style={{ marginBottom: 24, marginTop: 24 }}>
            <Text style={styles.sectionTitle}>Dare Categories</Text>
            {DARE_CATEGORIES.map((category, index) => (
              <AnimatedTouchable
                key={category.id}
                entering={FadeInDown.delay(100 + index * 100)}
                style={styles.dareCategoryCard}
              >
                <View style={styles.dareCategoryContent}>
                  <View style={styles.iconContainer}>
                    <category.icon size={20} color={colors?.primary?.[isDark ? 'dark' : 'light']} />
                  </View>
                  <View style={styles.dareCategoryInfo}>
                    <Text style={styles.dareCategoryTitle}>{category.title}</Text>
                    <Text style={styles.dareCategoryDescription}>{category.description}</Text>
                  </View>
                </View>
              </AnimatedTouchable>
            ))}
          </View>

          {/* Browse by Category */}
          <Text style={styles.sectionTitle}>Browse by Category</Text>
          <View style={styles.categoriesContainer}>
            {CATEGORIES.map((category, index) => (
              <AnimatedTouchable
                key={category.id}
                entering={FadeInDown.delay(100 + index * 100)}
                style={styles.categoryCard}
              >
                <category.icon size={24} color={category.color} />
                <Text style={styles.categoryTitle}>{category.title}</Text>
              </AnimatedTouchable>
            ))}
          </View>

          {/* Popular Dares */}
          <Text style={styles.sectionTitle}>Popular Dares</Text>
          {POPULAR_DARES.map((dare, index) => (
            <AnimatedTouchable
              key={index}
              entering={FadeInDown.delay(200 + index * 100)}
              style={styles.dareCard}
            >
              <View style={styles.dareContent}>
                <View style={[
                  styles.difficultyBadge,
                  { backgroundColor: DIFFICULTY_COLORS[dare.difficulty] }
                ]}>
                  <Text style={styles.difficultyText}>{dare.difficulty}</Text>
                </View>
                <Text style={styles.dareTitle}>{dare.title}</Text>
                <Text style={styles.dareDescription}>{dare.description}</Text>
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
        </ScrollView>
      </View>
    </SafeAreaWrapper>
  );
}