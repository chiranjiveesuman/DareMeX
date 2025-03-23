import React from 'react';
import { View, Text, Image, ScrollView, StyleSheet } from 'react-native';
import { Crown, Trophy, Medal } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme } from '@/context/ThemeContext';
import SafeAreaWrapper from '@/components/SafeAreaWrapper';

interface LeaderboardUser {
  rank: number;
  name: string;
  points: number;
  image: string;
  badge?: any;
}

const TOP_USERS: LeaderboardUser[] = [
  {
    rank: 1,
    name: 'SwiftPhoenix42',
    points: 2500,
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&auto=format&fit=crop',
    badge: Crown,
  },
  {
    rank: 2,
    name: 'MysticDragon789',
    points: 2350,
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&auto=format&fit=crop',
    badge: Trophy,
  },
  {
    rank: 3,
    name: 'CosmicWolf365',
    points: 2200,
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&auto=format&fit=crop',
    badge: Medal,
  },
  {
    rank: 4,
    name: 'NobleEagle123',
    points: 1950,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&auto=format&fit=crop',
  },
  {
    rank: 5,
    name: 'PhantomRider567',
    points: 1820,
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&auto=format&fit=crop',
  },
];

const BADGE_COLORS = {
  1: '#FFD700', // Gold
  2: '#C0C0C0', // Silver
  3: '#CD7F32', // Bronze
};

export default function LeaderboardScreen() {
  const { colors, isDark } = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background[isDark ? 'dark' : 'light'],
    },
    header: {
      padding: 16,
      backgroundColor: colors.background.card[isDark ? 'dark' : 'light'],
      borderBottomWidth: 1,
      borderBottomColor: isDark ? '#374151' : '#E5E7EB',
    },
    headerTitle: {
      fontFamily: 'SpaceGrotesk-Bold',
      fontSize: 32,
      color: colors.text.primary[isDark ? 'dark' : 'light'],
      marginBottom: 4,
    },
    headerSubtitle: {
      fontFamily: 'Inter-Regular',
      fontSize: 16,
      color: colors.text.secondary[isDark ? 'dark' : 'light'],
    },
    content: {
      padding: 16,
      paddingBottom: 32,
    },
    userCard: {
      backgroundColor: colors.background.card[isDark ? 'dark' : 'light'],
      borderRadius: 12,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: isDark ? '#374151' : '#E5E7EB',
    },
    userCardContent: {
      padding: 16,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
    },
    rankBadge: {
      width: 32,
      height: 32,
      borderRadius: 16,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background.card[isDark ? 'dark' : 'light'],
    },
    rankText: {
      fontFamily: 'Inter-Bold',
      fontSize: 16,
      color: colors.text.primary[isDark ? 'dark' : 'light'],
    },
    avatar: {
      width: 48,
      height: 48,
      borderRadius: 24,
    },
    userInfo: {
      flex: 1,
    },
    userName: {
      fontFamily: 'SpaceGrotesk-Bold',
      fontSize: 16,
      color: colors.text.primary[isDark ? 'dark' : 'light'],
      marginBottom: 4,
    },
    points: {
      fontFamily: 'Inter-Medium',
      fontSize: 14,
      color: colors.text.secondary[isDark ? 'dark' : 'light'],
    },
  });

  const getBadgeColor = (rank: number) => {
    return BADGE_COLORS[rank as keyof typeof BADGE_COLORS] || colors.primary;
  };

  return (
    <SafeAreaWrapper>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Leaderboard</Text>
          <Text style={styles.headerSubtitle}>Top performers this week</Text>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          {TOP_USERS.map((user, index) => (
            <Animated.View
              key={user.name}
              entering={FadeInDown.delay(100 + index * 100)}
              style={styles.userCard}
            >
              <View style={styles.userCardContent}>
                <View style={[
                  styles.rankBadge,
                  { backgroundColor: getBadgeColor(user.rank) + '20' }
                ]}>
                  <Text style={[
                    styles.rankText,
                    { color: getBadgeColor(user.rank) }
                  ]}>
                    #{user.rank}
                  </Text>
                </View>
                
                <Image 
                  source={{ uri: user.image }} 
                  style={[
                    styles.avatar,
                    user.rank <= 3 && {
                      borderWidth: 2,
                      borderColor: getBadgeColor(user.rank)
                    }
                  ]} 
                />
                
                <View style={styles.userInfo}>
                  <View style={styles.nameContainer}>
                    <Text style={styles.userName}>{user.name}</Text>
                    {user.badge && (
                      <user.badge size={16} color={getBadgeColor(user.rank)} />
                    )}
                  </View>
                  <Text style={styles.points}>{user.points} points</Text>
                </View>
              </View>
            </Animated.View>
          ))}
        </ScrollView>
      </View>
    </SafeAreaWrapper>
  );
}