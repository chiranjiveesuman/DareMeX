import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { supabase } from '@/supabase/config';
import SafeAreaWrapper from '@/components/SafeAreaWrapper';
import { ArrowLeft, Heart, MessageCircle, Share } from 'lucide-react-native';

interface Dare {
  id: string;
  title: string;
  description: string;
  media_url: string | null;
  difficulty: string;
  likes: number;
  comments: number;
  shares: number;
  created_at: string;
  creator_id: string;
  creator: {
    username: string;
    avatar_url: string;
  } | null;
}

export default function DareDetailsScreen() {
  const { id } = useLocalSearchParams();
  const { colors } = useTheme();
  const router = useRouter();
  const [dare, setDare] = useState<Dare | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDareDetails();
  }, [id]);

  const fetchDareDetails = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('dares')
        .select(`
          *,
          creator:creator_id (
            username,
            avatar_url
          )
        `)
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;
      setDare(data);
    } catch (err) {
      console.error('Error fetching dare:', err);
      setError('Failed to load dare details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaWrapper>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaWrapper>
    );
  }

  if (error || !dare) {
    return (
      <SafeAreaWrapper>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: colors.error }]}>
            {error || 'Dare not found'}
          </Text>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: colors.primary }]}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaWrapper>
    );
  }

  return (
    <SafeAreaWrapper>
      <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        {dare.media_url && (
          <Image
            source={{ uri: dare.media_url }}
            style={styles.image}
            resizeMode="cover"
          />
        )}

        <View style={styles.content}>
          <View style={styles.titleContainer}>
            <Text style={[styles.title, { color: colors.text }]}>
              {dare.title}
            </Text>
            <View style={[styles.difficultyBadge, { backgroundColor: colors.primary + '20' }]}>
              <Text style={[styles.difficultyText, { color: colors.primary }]}>
                {dare.difficulty}
              </Text>
            </View>
          </View>

          <Text style={[styles.description, { color: colors.textSecondary }]}>
            {dare.description}
          </Text>

          <View style={styles.stats}>
            <View style={styles.statItem}>
              <Heart size={20} color={colors.textSecondary} />
              <Text style={[styles.statText, { color: colors.textSecondary }]}>
                {dare.likes}
              </Text>
            </View>
            <View style={styles.statItem}>
              <MessageCircle size={20} color={colors.textSecondary} />
              <Text style={[styles.statText, { color: colors.textSecondary }]}>
                {dare.comments}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Share size={20} color={colors.textSecondary} />
              <Text style={[styles.statText, { color: colors.textSecondary }]}>
                {dare.shares}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
    fontFamily: 'Inter-Medium',
  },
  header: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontFamily: 'Inter-Medium',
    fontSize: 16,
  },
  image: {
    width: '100%',
    height: 300,
  },
  content: {
    padding: 16,
    gap: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontFamily: 'SpaceGrotesk-Bold',
    flex: 1,
  },
  difficultyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  difficultyText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: 'Inter-Regular',
  },
  stats: {
    flexDirection: 'row',
    gap: 24,
    paddingTop: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
  },
}); 