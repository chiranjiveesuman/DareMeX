import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, useColorScheme } from 'react-native';
import { Camera, Image as ImageIcon, Clock, Tag } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { globalStyles, colors, gradientColors, useThemeStyles } from '@/styles/globalStyles';
import Animated, { FadeInDown } from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type DifficultyLevel = 'Easy' | 'Medium' | 'Hard';

const DIFFICULTY_OPTIONS: DifficultyLevel[] = ['Easy', 'Medium', 'Hard'];

const DIFFICULTY_COLORS: Record<DifficultyLevel, string> = {
  Easy: '#22C55E',
  Medium: '#F59E0B',
  Hard: '#EF4444',
};

export default function CreateScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const styles = useThemeStyles();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('Medium');

  const handleCreate = () => {
    // TODO: Implement dare creation
    console.log({
      title,
      description,
      duration,
      difficulty,
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[gradientColors.header.start, gradientColors.header.end]}
        style={styles.headerGradient}>
        <Text style={styles.headerTitle}>Create Dare</Text>
        <Text style={styles.headerSubtitle}>Challenge the community</Text>
      </LinearGradient>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.content}>
        {/* Title Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Title</Text>
          <TextInput
            style={styles.input}
            placeholder="Give your dare a catchy title"
            placeholderTextColor={isDark ? colors.text.secondary.dark : colors.text.secondary.light}
            value={title}
            onChangeText={setTitle}
          />
        </View>

        {/* Description Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
            placeholder="Describe your dare in detail"
            placeholderTextColor={isDark ? colors.text.secondary.dark : colors.text.secondary.light}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
          />
        </View>

        {/* Duration Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Duration</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Clock size={20} color={isDark ? colors.text.secondary.dark : colors.text.secondary.light} />
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="How long should this dare take?"
              placeholderTextColor={isDark ? colors.text.secondary.dark : colors.text.secondary.light}
              value={duration}
              onChangeText={setDuration}
            />
          </View>
        </View>

        {/* Difficulty Selection */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Difficulty</Text>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            {DIFFICULTY_OPTIONS.map((option) => (
              <Pressable
                key={option}
                style={[
                  styles.badge,
                  {
                    backgroundColor:
                      difficulty === option
                        ? DIFFICULTY_COLORS[option]
                        : DIFFICULTY_COLORS[option] + '20',
                  },
                ]}
                onPress={() => setDifficulty(option)}>
                <Text
                  style={[
                    styles.badgeText,
                    {
                      color:
                        difficulty === option
                          ? colors.white
                          : DIFFICULTY_COLORS[option],
                    },
                  ]}>
                  {option}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Media Upload Options */}
        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 24 }}>
          <AnimatedPressable
            entering={FadeInDown.delay(100)}
            style={[styles.card, { flex: 1, padding: 16, alignItems: 'center', gap: 8 }]}>
            <Camera size={24} color={colors.primary} />
            <Text style={[styles.text, { textAlign: 'center' }]}>Take Photo/Video</Text>
          </AnimatedPressable>

          <AnimatedPressable
            entering={FadeInDown.delay(200)}
            style={[styles.card, { flex: 1, padding: 16, alignItems: 'center', gap: 8 }]}>
            <ImageIcon size={24} color={colors.primary} />
            <Text style={[styles.text, { textAlign: 'center' }]}>Upload Media</Text>
          </AnimatedPressable>
        </View>

        {/* Create Button */}
        <Pressable style={styles.button} onPress={handleCreate}>
          <Text style={styles.buttonText}>Create Dare</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}