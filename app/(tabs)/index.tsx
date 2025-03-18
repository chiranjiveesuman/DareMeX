import { View, Text, Pressable, ScrollView, useColorScheme } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Users, Lock, Sparkles, Bell } from 'lucide-react-native';
import { globalStyles, colors, gradientColors, useThemeStyles } from '@/styles/globalStyles';
import { UserSearch } from '@/components/UserSearch';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

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
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const styles = useThemeStyles();
  
  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[gradientColors.header.start, gradientColors.header.end]}
        style={styles.headerGradient}>
        <Text style={styles.headerTitle}>DareMeX</Text>
        <Text style={styles.headerSubtitle}>Dare to be different</Text>
      </LinearGradient>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.content}>
        {/* Search Bar */}
        <UserSearch />

        {/* Categories */}
        <View style={{ marginBottom: 24 }}>
          <Text style={[styles.title, { marginBottom: 16 }]}>Dare Categories</Text>
          <View style={{ gap: 12 }}>
            {CATEGORIES.map((category, index) => (
              <AnimatedPressable
                key={category.id}
                entering={FadeInDown.delay(100 + index * 100)}
                style={styles.card}>
                <View style={{ padding: 16, flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                  <View style={styles.iconContainer}>
                    <category.icon size={20} color={colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle}>{category.title}</Text>
                    <Text style={styles.cardContent}>{category.description}</Text>
                  </View>
                </View>
              </AnimatedPressable>
            ))}
          </View>
        </View>

        {/* Recent Activity */}
        <View>
          <View style={styles.sectionHeader}>
            <Text style={styles.title}>Recent Activity</Text>
            <Pressable style={styles.iconContainer}>
              <Bell size={20} color={isDark ? colors.text.primary.dark : colors.text.primary.light} />
            </Pressable>
          </View>

          <View style={{ gap: 16 }}>
            {RECENT_DARES.map((dare, index) => (
              <AnimatedPressable
                key={dare.id}
                entering={FadeInDown.delay(200 + index * 100)}
                style={styles.card}>
                <View style={{ padding: 16, gap: 12 }}>
                  <Text style={styles.cardTitle}>{dare.title}</Text>
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