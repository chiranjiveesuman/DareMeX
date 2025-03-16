import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Bell } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const DIFFICULTY_COLORS = {
  Easy: '#22C55E',
  Medium: '#F59E0B',
  Hard: '#EF4444',
};

const POPULAR_DARES = [
  {
    title: 'Dance Challenge',
    description: 'Show off your best dance moves to a trending song',
    difficulty: 'Easy',
    participants: 128,
  },
  {
    title: 'Karaoke Time',
    description: 'Sing your heart out to your favorite song in public',
    difficulty: 'Medium',
    participants: 64,
  },
  {
    title: 'Food Challenge',
    description: 'Try this unique food combination and record your reaction',
    difficulty: 'Hard',
    participants: 256,
  },
];

export default function DiscoverScreen() {
  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Popular Dares</Text>
          <Pressable style={styles.notificationButton}>
            <Bell size={24} color="#FF4D6A" />
          </Pressable>
        </View>

        <View style={styles.daresList}>
          {POPULAR_DARES.map((dare, index) => (
            <AnimatedPressable
              key={dare.title}
              entering={FadeInDown.delay(200 + index * 100)}
              style={styles.dareCard}>
              <View style={styles.dareContent}>
                <View style={styles.dareHeader}>
                  <Text style={styles.dareTitle}>{dare.title}</Text>
                  <View
                    style={[
                      styles.difficultyBadge,
                      { backgroundColor: DIFFICULTY_COLORS[dare.difficulty] + '20' },
                    ]}>
                    <Text
                      style={[
                        styles.difficultyText,
                        { color: DIFFICULTY_COLORS[dare.difficulty] },
                      ]}>
                      {dare.difficulty}
                    </Text>
                  </View>
                </View>
                <Text style={styles.dareDescription}>{dare.description}</Text>
                <Text style={styles.participants}>
                  {dare.participants} participants
                </Text>
              </View>
            </AnimatedPressable>
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
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#18181B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  daresList: {
    gap: 16,
  },
  dareCard: {
    backgroundColor: '#18181B',
    borderRadius: 16,
    overflow: 'hidden',
  },
  dareContent: {
    padding: 16,
    gap: 12,
  },
  dareHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dareTitle: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 18,
    color: '#FFFFFF',
  },
  difficultyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  difficultyText: {
    fontFamily: 'SpaceGrotesk-Regular',
    fontSize: 14,
  },
  dareDescription: {
    fontFamily: 'SpaceGrotesk-Regular',
    fontSize: 14,
    color: '#71717A',
  },
  participants: {
    fontFamily: 'SpaceGrotesk-Regular',
    fontSize: 14,
    color: '#FF4D6A',
  },
});