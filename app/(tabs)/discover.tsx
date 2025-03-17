import { View, Text, ScrollView, Pressable, useColorScheme } from 'react-native';
import { Bell, Compass, TrendingUp, Sparkles, Flame, Star, MessageSquare, Zap, Lock } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { globalStyles, colors, gradientColors, useThemeStyles } from '@/styles/globalStyles';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type DifficultyLevel = 'Easy' | 'Medium' | 'Hard';

const DIFFICULTY_COLORS: Record<DifficultyLevel, string> = {
  Easy: '#22C55E',
  Medium: '#F59E0B',
  Hard: '#EF4444',
};

interface Category {
  id: string;
  title: string;
  icon: any; // Using any for Lucide icon component type
  color: string;
}

const CATEGORIES: Category[] = [
  {
    id: 'popular',
    title: 'Popular Dares',
    icon: Star,
    color: '#FF4D6A',
  },
  {
    id: 'embarrassing',
    title: 'Embarrassing Stories',
    icon: MessageSquare,
    color: '#F59E0B',
  },
  {
    id: 'wild',
    title: 'Wild/Freaky Tales',
    icon: Zap,
    color: '#EF4444',
  },
  {
    id: 'nsfw',
    title: 'NSFW Dump',
    icon: Lock,
    color: '#9333EA',
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
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const styles = useThemeStyles();

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[gradientColors.header.start, gradientColors.header.end]}
        style={styles.headerGradient}>
        <Text style={styles.headerTitle}>Discover</Text>
        <Text style={styles.headerSubtitle}>Find your next adventure</Text>
      </LinearGradient>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.content}>
        {/* Categories */}
        <View style={{ marginBottom: 24 }}>
          <Text style={[styles.title, { marginBottom: 16 }]}>Categories</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -16 }}>
            <View style={{ flexDirection: 'row', paddingHorizontal: 16, gap: 12 }}>
              {CATEGORIES.map((category, index) => (
                <AnimatedPressable
                  key={category.id}
                  entering={FadeInDown.delay(100 + index * 100)}
                  style={[styles.card, { paddingVertical: 16, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', gap: 8 }]}>
                  <category.icon size={20} color={category.color} />
                  <Text style={[styles.text, { color: category.color }]}>{category.title}</Text>
                </AnimatedPressable>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Popular Dares */}
        <View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Text style={styles.title}>Popular Dares</Text>
            <Pressable style={styles.iconContainer}>
              <Bell size={20} color={isDark ? colors.text.primary.dark : colors.text.primary.light} />
            </Pressable>
          </View>

          <View style={{ gap: 16 }}>
            {POPULAR_DARES.map((dare, index) => (
              <AnimatedPressable
                key={dare.title}
                entering={FadeInDown.delay(200 + index * 100)}
                style={styles.card}>
                <View style={{ padding: 16, gap: 12 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={styles.cardTitle}>{dare.title}</Text>
                    <View
                      style={[
                        styles.badge,
                        { backgroundColor: DIFFICULTY_COLORS[dare.difficulty] + '20' },
                      ]}>
                      <Text
                        style={[
                          styles.badgeText,
                          { color: DIFFICULTY_COLORS[dare.difficulty] },
                        ]}>
                        {dare.difficulty}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.cardContent}>{dare.description}</Text>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={[styles.text, { color: colors.primary }]}>
                      {dare.participants} participants
                    </Text>
                    <Text style={[styles.text, { color: isDark ? colors.text.secondary.dark : colors.text.secondary.light }]}>
                      by {dare.creator}
                    </Text>
                  </View>
                </View>
              </AnimatedPressable>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}