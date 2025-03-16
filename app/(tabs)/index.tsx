import { View, Text, StyleSheet, Pressable, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Users, Lock, Sparkles } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  
  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <LinearGradient
        colors={['#FF4D6A', '#FF8C94']}
        style={styles.container}>
        <View style={[styles.content, { paddingTop: insets.top || 48 }]}>
          <View style={styles.header}>
            <Text style={styles.title}>DareMeX</Text>
            <Text style={styles.subtitle}>Dare to be different</Text>
          </View>

          <View style={styles.categories}>
            <AnimatedPressable
              entering={FadeInDown.delay(200)}
              style={styles.categoryCard}>
              <View style={styles.iconContainer}>
                <Users size={24} color="#FF4D6A" />
              </View>
              <View style={styles.categoryTextContainer}>
                <Text style={styles.categoryTitle}>Public Dares</Text>
                <Text style={styles.categoryDescription}>
                  Join community challenges and show your daring side
                </Text>
              </View>
            </AnimatedPressable>

            <AnimatedPressable
              entering={FadeInDown.delay(300)}
              style={styles.categoryCard}>
              <View style={styles.iconContainer}>
                <Lock size={24} color="#FF4D6A" />
              </View>
              <View style={styles.categoryTextContainer}>
                <Text style={styles.categoryTitle}>Private Dares</Text>
                <Text style={styles.categoryDescription}>
                  Create exclusive challenges for your friends
                </Text>
              </View>
            </AnimatedPressable>

            <AnimatedPressable
              entering={FadeInDown.delay(400)}
              style={styles.categoryCard}>
              <View style={styles.iconContainer}>
                <Sparkles size={24} color="#FF4D6A" />
              </View>
              <View style={styles.categoryTextContainer}>
                <Text style={styles.categoryTitle}>AI Dares</Text>
                <Text style={styles.categoryDescription}>
                  Get personalized dare suggestions powered by AI
                </Text>
              </View>
            </AnimatedPressable>
          </View>
        </View>
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 32,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: 'SpaceGrotesk-Regular',
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  categories: {
    gap: 16,
  },
  categoryCard: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryTextContainer: {
    flex: 1,
  },
  categoryTitle: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 18,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  categoryDescription: {
    fontFamily: 'SpaceGrotesk-Regular',
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.8,
  },
});