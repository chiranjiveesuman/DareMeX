import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Share } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { supabase } from '@/supabase/config';
import SafeAreaWrapper from '@/components/SafeAreaWrapper';

interface Message {
  id: string;
  content: string;
  created_at: string;
}

export default function CreateScreen() {
  const { user } = useAuth();
  const { colors } = useTheme();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState('Easy');
  const [mediaUri, setMediaUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant camera roll permissions to add media.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setMediaUri(result.assets[0].uri);
        setError(null);
      }
    } catch (err) {
      console.error('Error picking image:', err);
      setError('Failed to pick image. Please try again.');
    }
  };

  const uploadMedia = async (uri: string) => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const fileExt = uri.split('.').pop();
      const fileName = `${user?.id}/${Date.now()}.${fileExt}`;
      const filePath = `dare-media/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('dares')
        .upload(filePath, blob);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('dares')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading media:', error);
      throw error;
    }
  };

  const handleShare = async (dareId: string) => {
    try {
      const result = await Share.share({
        message: `Check out my new dare: ${title}\n${description}\nhttps://yourapp.com/dares/${dareId}`,
        title: title,
      });

      if (result.action === Share.sharedAction) {
        // Update share count
        await supabase
          .from('dares')
          .update({ shares: 1 })
          .eq('id', dareId);
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const validateForm = () => {
    if (!title.trim()) {
      setError('Please enter a dare title');
      return false;
    }
    if (!description.trim()) {
      setError('Please enter a dare description');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!user) {
      setError('Please sign in to create a dare');
      return;
    }

    if (!validateForm()) return;

    setLoading(true);
    setError(null);

    try {
      let mediaUrl = null;
      if (mediaUri) {
        mediaUrl = await uploadMedia(mediaUri);
      }

      const { data, error: insertError } = await supabase
        .from('dares')
        .insert({
          title: title.trim(),
          description: description.trim(),
          difficulty,
          creator_id: user.id,
          media_url: mediaUrl,
          likes: 0,
          shares: 0,
          comments: 0,
        })
        .select()
        .single();

      if (insertError) {
        console.error('Supabase insert error:', insertError);
        throw new Error(insertError.message || 'Failed to create dare');
      }

      if (!data) {
        throw new Error('No data returned from insert');
      }

      // Clear form
      setTitle('');
      setDescription('');
      setDifficulty('Easy');
      setMediaUri(null);

      // Show success message
      Alert.alert(
        'Success',
        'Your dare has been created!',
        [
          {
            text: 'Share',
            onPress: () => handleShare(data.id),
          },
          {
            text: 'OK',
            style: 'cancel',
          },
        ]
      );
    } catch (error) {
      console.error('Error creating dare:', error);
      setError(error instanceof Error ? error.message : 'Failed to create dare');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaWrapper>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={[styles.container, { backgroundColor: colors.background }]}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>
              Create
            </Text>
            <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
              Start a new dare challenge
            </Text>
          </View>

          {error && (
            <View style={styles.errorContainer}>
              <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
            </View>
          )}

          <View style={styles.form}>
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
              placeholder="Dare Title"
              placeholderTextColor={colors.textSecondary}
              value={title}
              onChangeText={setTitle}
              maxLength={100}
            />

            <TextInput
              style={[styles.input, styles.textArea, { backgroundColor: colors.card, color: colors.text }]}
              placeholder="Describe your dare challenge..."
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={4}
              value={description}
              onChangeText={setDescription}
              maxLength={500}
              textAlignVertical="top"
            />

            <View style={styles.difficultyContainer}>
              {['Easy', 'Medium', 'Hard'].map((level) => (
                <TouchableOpacity
                  key={level}
                  style={[
                    styles.difficultyButton,
                    {
                      backgroundColor: difficulty === level ? colors.primary : colors.card,
                      opacity: loading ? 0.5 : 1
                    },
                  ]}
                  onPress={() => setDifficulty(level)}
                  disabled={loading}
                >
                  <Text
                    style={[
                      styles.difficultyText,
                      { color: difficulty === level ? '#FFFFFF' : colors.text },
                    ]}
                  >
                    {level}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={[
                styles.mediaButton,
                {
                  backgroundColor: colors.card,
                  opacity: loading ? 0.5 : 1
                }
              ]}
              onPress={pickImage}
              disabled={loading}
            >
              <Text style={[styles.mediaButtonText, { color: colors.text }]}>
                Add Photo/Video
              </Text>
            </TouchableOpacity>

            {mediaUri && (
              <View style={styles.mediaContainer}>
                <Image
                  source={{ uri: mediaUri }}
                  style={styles.mediaPreview}
                  resizeMode="cover"
                />
                <TouchableOpacity
                  style={styles.removeMediaButton}
                  onPress={() => setMediaUri(null)}
                  disabled={loading}
                >
                  <Text style={styles.removeMediaText}>✕</Text>
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity
              style={[
                styles.submitButton,
                {
                  backgroundColor: colors.primary,
                  opacity: loading ? 0.5 : 1
                }
              ]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.submitButtonText}>Create Dare</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
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
  errorContainer: {
    backgroundColor: '#FEE2E2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  form: {
    gap: 16,
  },
  input: {
    padding: 12,
    borderRadius: 8,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    minHeight: 48,
  },
  textArea: {
    height: 120,
    paddingTop: 12,
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
    minHeight: 48,
  },
  difficultyText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
  mediaButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    minHeight: 48,
  },
  mediaButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
  mediaContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  mediaPreview: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    backgroundColor: '#ccc',
  },
  removeMediaButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeMediaText: {
    color: '#FFFFFF',
    fontSize: 12,
  },
  submitButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
    minHeight: 56,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
    fontSize: 16,
  },
});