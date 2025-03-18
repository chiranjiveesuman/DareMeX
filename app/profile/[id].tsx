import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, useColorScheme, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Award, Users, Trophy, Star } from 'lucide-react-native';
import { globalStyles, colors, gradientColors, useThemeStyles } from '@/styles/globalStyles';
import { supabase } from '@/supabase/config';

interface UserProfile {
  id: string;
  username: string;
  avatar_url?: string;
  bio?: string;
  stats: {
    daresCompleted: number;
    followers: number;
    following: number;
    points: number;
  };
}

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const styles = useThemeStyles();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, [id]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      
      // Get profile data
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (profileError) {
        console.error('Error loading profile:', profileError);
        return;
      }

      // Get user stats (you'll need to implement these queries based on your database schema)
      const stats = {
        daresCompleted: 42,
        followers: 1200,
        following: 384,
        points: 2500,
      };

      setProfile({
        id: profileData.id,
        username: profileData.username,
        avatar_url: profileData.avatar_url,
        bio: profileData.bio,
        stats,
      });
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={styles.text}>Profile not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[gradientColors.header.start, gradientColors.header.end]}
        style={styles.headerGradient}>
        <Text style={styles.headerTitle}>{profile.username}</Text>
        <Text style={styles.headerSubtitle}>DareMeX Profile</Text>
      </LinearGradient>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.content}>
        {/* Profile Card */}
        <View style={styles.card}>
          <View style={{ padding: 16, alignItems: 'center', gap: 12 }}>
            <Image
              source={{
                uri: profile.avatar_url || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&auto=format&fit=crop',
              }}
              style={{ 
                width: 80, 
                height: 80, 
                borderRadius: 40,
                borderWidth: 3,
                borderColor: colors.primary,
              }}
            />
            <View style={{ alignItems: 'center' }}>
              <Text style={styles.cardTitle}>{profile.username}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Award size={16} color={colors.primary} />
                <Text style={styles.cardContent}>Level 15 • {profile.stats.points} points</Text>
              </View>
            </View>

            {/* Stats */}
            <View style={{ 
              flexDirection: 'row', 
              width: '100%', 
              justifyContent: 'space-around',
              marginTop: 8,
              paddingTop: 16,
              borderTopWidth: 1,
              borderTopColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
            }}>
              <View style={{ alignItems: 'center' }}>
                <Trophy size={20} color={colors.primary} />
                <Text style={[styles.cardTitle, { fontSize: 18 }]}>
                  {profile.stats.daresCompleted}
                </Text>
                <Text style={styles.cardContent}>Dares</Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Users size={20} color={colors.primary} />
                <Text style={[styles.cardTitle, { fontSize: 18 }]}>
                  {profile.stats.followers}
                </Text>
                <Text style={styles.cardContent}>Followers</Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Star size={20} color={colors.primary} />
                <Text style={[styles.cardTitle, { fontSize: 18 }]}>
                  {profile.stats.following}
                </Text>
                <Text style={styles.cardContent}>Following</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Bio */}
        {profile.bio && (
          <View style={[styles.card, { marginTop: 16 }]}>
            <View style={{ padding: 16 }}>
              <Text style={[styles.title, { marginBottom: 8 }]}>About</Text>
              <Text style={styles.cardContent}>{profile.bio}</Text>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
} 