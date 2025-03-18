import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, useColorScheme, ActivityIndicator, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Award, Users, Trophy, Star, UserPlus, MessageCircle, Check, X } from 'lucide-react-native';
import { globalStyles, colors, gradientColors, useThemeStyles } from '@/styles/globalStyles';
import { supabase } from '@/supabase/config';
import { useAuth } from '@/context/AuthContext';

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

type FriendStatus = 'none' | 'pending' | 'accepted' | 'rejected';

interface FriendRequest {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: FriendStatus;
}

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const styles = useThemeStyles();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [friendStatus, setFriendStatus] = useState<FriendStatus>('none');
  const [pendingRequest, setPendingRequest] = useState<FriendRequest | null>(null);

  useEffect(() => {
    loadProfile();
    if (user) {
      checkFriendStatus();
    }
  }, [id, user]);

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

  const checkFriendStatus = async () => {
    if (!user || !id) return;
    
    try {
      // Check if there's any existing friend request
      const { data: friendData, error: friendError } = await supabase
        .from('friends')
        .select('*')
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${id}),and(sender_id.eq.${id},receiver_id.eq.${user.id})`)
        .order('created_at', { ascending: false })
        .limit(1);

      if (friendError) {
        console.error('Error checking friend status:', friendError);
        return;
      }

      if (friendData && friendData.length > 0) {
        const request = friendData[0];
        setFriendStatus(request.status);
        setPendingRequest(request);
      } else {
        setFriendStatus('none');
        setPendingRequest(null);
      }
    } catch (error) {
      console.error('Error checking friend status:', error);
    }
  };

  const sendFriendRequest = async () => {
    if (!user || !id) return;

    try {
      // First check if a request already exists
      const { data: existingRequest, error: checkError } = await supabase
        .from('friends')
        .select('*')
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${id}),and(sender_id.eq.${id},receiver_id.eq.${user.id})`)
        .limit(1);

      if (checkError) throw checkError;

      if (existingRequest && existingRequest.length > 0) {
        // Request already exists, update UI accordingly
        setFriendStatus(existingRequest[0].status);
        setPendingRequest(existingRequest[0]);
        return;
      }

      // No existing request, create a new one
      const { data, error } = await supabase
        .from('friends')
        .insert({
          sender_id: user.id,
          receiver_id: id,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setFriendStatus('pending');
        setPendingRequest(data);
      }
    } catch (error) {
      console.error('Error sending friend request:', error);
    }
  };

  const respondToFriendRequest = async (accept: boolean) => {
    if (!pendingRequest || !user) return;

    try {
      const { data, error } = await supabase
        .from('friends')
        .update({ 
          status: accept ? 'accepted' : 'rejected',
        })
        .eq('id', pendingRequest.id)
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setFriendStatus(data.status);
        setPendingRequest(null);
      }
    } catch (error) {
      console.error('Error responding to friend request:', error);
    }
  };

  const startChat = () => {
    router.push(`/chat/${id}`);
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

  const renderActionButtons = () => {
    if (user?.id === id) return null; // Don't show buttons on own profile

    return (
      <View style={{ 
        flexDirection: 'row', 
        justifyContent: 'center', 
        gap: 12,
        marginTop: 16,
        paddingHorizontal: 16,
      }}>
        {friendStatus === 'none' && (
          <Pressable
            style={[styles.button, { flex: 1 }]}
            onPress={sendFriendRequest}
          >
            <UserPlus size={20} color="#FFFFFF" />
            <Text style={styles.buttonText}>Add Friend</Text>
          </Pressable>
        )}

        {friendStatus === 'pending' && pendingRequest?.receiver_id === user?.id && (
          <View style={{ flexDirection: 'row', gap: 8, flex: 1 }}>
            <Pressable
              style={[styles.button, { flex: 1, backgroundColor: colors.success }]}
              onPress={() => respondToFriendRequest(true)}
            >
              <Check size={20} color="#FFFFFF" />
              <Text style={styles.buttonText}>Accept</Text>
            </Pressable>
            <Pressable
              style={[styles.button, { flex: 1, backgroundColor: colors.error }]}
              onPress={() => respondToFriendRequest(false)}
            >
              <X size={20} color="#FFFFFF" />
              <Text style={styles.buttonText}>Decline</Text>
            </Pressable>
          </View>
        )}

        {friendStatus === 'pending' && pendingRequest?.sender_id === user?.id && (
          <Pressable
            style={[styles.button, { flex: 1, opacity: 0.7 }]}
            disabled={true}
          >
            <UserPlus size={20} color="#FFFFFF" />
            <Text style={styles.buttonText}>Request Sent</Text>
          </Pressable>
        )}

        {friendStatus === 'accepted' && (
          <Pressable
            style={[styles.button, { flex: 1 }]}
            onPress={startChat}
          >
            <MessageCircle size={20} color="#FFFFFF" />
            <Text style={styles.buttonText}>Message</Text>
          </Pressable>
        )}
      </View>
    );
  };

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

            {/* Action Buttons */}
            {renderActionButtons()}

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