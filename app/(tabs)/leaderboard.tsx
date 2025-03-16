import { View, Text, Image, ScrollView, useColorScheme } from 'react-native';
import { Crown, Trophy, Medal } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { globalStyles, colors, gradientColors, useThemeStyles } from '@/styles/globalStyles';

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

export default function LeaderboardScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const styles = useThemeStyles();

  const getBadgeColor = (rank: number) => {
    switch (rank) {
      case 1: return '#FFD700'; // Gold
      case 2: return '#C0C0C0'; // Silver
      case 3: return '#CD7F32'; // Bronze
      default: return colors.primary;
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[gradientColors.header.start, gradientColors.header.end]}
        style={styles.headerGradient}>
        <Text style={styles.headerTitle}>Leaderboard</Text>
        <Text style={styles.headerSubtitle}>Top performers this week</Text>
      </LinearGradient>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.content}>
        {/* Top Users */}
        <View style={{ gap: 16 }}>
          {TOP_USERS.map((user, index) => (
            <Animated.View
              key={user.name}
              entering={FadeInDown.delay(100 + index * 100)}
              style={styles.card}>
              <View style={{ 
                padding: 16, 
                flexDirection: 'row', 
                alignItems: 'center', 
                gap: 16 
              }}>
                <View style={{ 
                  width: 40, 
                  height: 40, 
                  borderRadius: 20, 
                  backgroundColor: getBadgeColor(user.rank) + '20',
                  justifyContent: 'center', 
                  alignItems: 'center' 
                }}>
                  <Text style={{ 
                    fontFamily: 'SpaceGrotesk-Bold', 
                    fontSize: 16, 
                    color: getBadgeColor(user.rank) 
                  }}>
                    #{user.rank}
                  </Text>
                </View>
                
                <Image 
                  source={{ uri: user.image }} 
                  style={{ 
                    width: 48, 
                    height: 48, 
                    borderRadius: 24,
                    borderWidth: user.rank <= 3 ? 2 : 0,
                    borderColor: getBadgeColor(user.rank)
                  }} 
                />
                
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={styles.cardTitle}>{user.name}</Text>
                    {user.badge && (
                      <user.badge size={16} color={getBadgeColor(user.rank)} />
                    )}
                  </View>
                  <Text style={styles.cardContent}>{user.points} points</Text>
                </View>
              </View>
            </Animated.View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}