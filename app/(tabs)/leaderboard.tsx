import { View, Text, StyleSheet, Image, ScrollView } from 'react-native';
import { Crown } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

const TOP_USERS = [
  {
    rank: 1,
    name: 'Sarah J.',
    points: 2500,
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&auto=format&fit=crop',
  },
  {
    rank: 2,
    name: 'Michael R.',
    points: 2350,
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&auto=format&fit=crop',
  },
  {
    rank: 3,
    name: 'Emma W.',
    points: 2200,
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&auto=format&fit=crop',
  },
];

export default function LeaderboardScreen() {
  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Leaderboard</Text>
          <Crown size={24} color="#FFD700" />
        </View>

        <View style={styles.rankings}>
          {TOP_USERS.map((user, index) => (
            <Animated.View
              key={user.name}
              entering={FadeInDown.delay(200 + index * 100)}
              style={styles.rankCard}>
              <Text style={styles.rankNumber}>#{user.rank}</Text>
              <Image source={{ uri: user.image }} style={styles.avatar} />
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{user.name}</Text>
                <Text style={styles.userPoints}>{user.points} points</Text>
              </View>
            </Animated.View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#09090B',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 24,
  },
  title: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 24,
    color: '#FFFFFF',
  },
  rankings: {
    gap: 16,
  },
  rankCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#18181B',
    borderRadius: 16,
    padding: 16,
    gap: 16,
  },
  rankNumber: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 18,
    color: '#FF4D6A',
    width: 40,
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
    color: '#FFFFFF',
    marginBottom: 4,
  },
  userPoints: {
    fontFamily: 'SpaceGrotesk-Regular',
    fontSize: 14,
    color: '#71717A',
  },
});