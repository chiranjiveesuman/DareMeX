
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Share } from 'react-native';
import { useSupabase } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import SafeAreaWrapper from '@/components/SafeAreaWrapper';

export default function CreateScreen() {
  const { supabase, user } = useSupabase();
  const { colors, isDark } = useTheme();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState('Easy');
  const [mediaUri, setMediaUri] = useState(null);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setMediaUri(result.assets[0].uri);
    }
  };

  const handleShare = async () => {
    try {
      const result = await Share.share({
        message: `Check out my new dare: ${title}\n${description}`,
        title: title,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmit = async () => {
    try {
      const { data, error } = await supabase
        .from('dares')
        .insert([
          {
            title,
            description,
            difficulty,
            creator_id: user?.id,
            media_url: mediaUri,
            likes: 0,
            shares: 0,
            comments: 0,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      
      // Clear form
      setTitle('');
      setDescription('');
      setDifficulty('Easy');
      setMediaUri(null);
      
      // Show share dialog
      handleShare();
    } catch (error) {
      console.error('Error creating dare:', error);
    }
  };

  return (
    <SafeAreaWrapper>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.text.primary[isDark ? 'dark' : 'light'] }]}>
            Create
          </Text>
          <Text style={[styles.headerSubtitle, { color: colors.text.secondary[isDark ? 'dark' : 'light'] }]}>
            Start a new dare challenge
          </Text>
        </View>

        <View style={styles.form}>
          <TextInput
            style={[styles.input, { backgroundColor: colors.background.card[isDark ? 'dark' : 'light'] }]}
            placeholder="Dare Title"
            placeholderTextColor={colors.text.secondary[isDark ? 'dark' : 'light']}
            value={title}
            onChangeText={setTitle}
          />

          <TextInput
            style={[styles.input, styles.textArea, { backgroundColor: colors.background.card[isDark ? 'dark' : 'light'] }]}
            placeholder="Describe your dare challenge..."
            placeholderTextColor={colors.text.secondary[isDark ? 'dark' : 'light']}
            multiline
            numberOfLines={4}
            value={description}
            onChangeText={setDescription}
          />

          <View style={styles.difficultyContainer}>
            {['Easy', 'Medium', 'Hard'].map((level) => (
              <TouchableOpacity
                key={level}
                style={[
                  styles.difficultyButton,
                  { backgroundColor: difficulty === level ? colors.primary : colors.background.card[isDark ? 'dark' : 'light'] },
                ]}
                onPress={() => setDifficulty(level)}
              >
                <Text
                  style={[
                    styles.difficultyText,
                    { color: difficulty === level ? '#FFFFFF' : colors.text.primary[isDark ? 'dark' : 'light'] },
                  ]}
                >
                  {level}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.mediaButton, { backgroundColor: colors.background.card[isDark ? 'dark' : 'light'] }]}
            onPress={pickImage}
          >
            <Text style={[styles.mediaButtonText, { color: colors.text.primary[isDark ? 'dark' : 'light'] }]}>
              Add Photo/Video
            </Text>
          </TouchableOpacity>

          {mediaUri && (
            <Image source={{ uri: mediaUri }} style={styles.mediaPreview} />
          )}

          <TouchableOpacity
            style={[styles.submitButton, { backgroundColor: colors.primary }]}
            onPress={handleSubmit}
          >
            <Text style={styles.submitButtonText}>Create Dare</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 32,
    fontFamily: 'SpaceGrotesk-Bold',
  },
  headerSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    marginTop: 4,
  },
  form: {
    gap: 16,
  },
  input: {
    padding: 12,
    borderRadius: 8,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  difficultyContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  difficultyButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  difficultyText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
  mediaButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  mediaButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
  mediaPreview: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    backgroundColor: '#ccc',
  },
  submitButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
    fontSize: 16,
  },
});
