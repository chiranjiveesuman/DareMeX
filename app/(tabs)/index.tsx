import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, FlatList } from 'react-native';
import { Users, Lock, Sparkles, Bell } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import SafeAreaWrapper from '@/components/SafeAreaWrapper';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/supabase/config';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface Dare {
  id: string;
  title: string;
  creator_id: string;
  creator_username: string;
  created_at: string;
}

export default function HomeScreen() {
  const { colors, isDark, theme } = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const [feedDares, setFeedDares] = useState<Dare[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeedDares();
  }, [user]);

  const handleNotificationPress = () => {
    console.log('Notification button pressed');
    // Add your desired functionality here, e.g., navigate to a notifications screen
    router.push('/notifications');
  };

  const fetchFeedDares = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
  
    try {
      // Fetch friends' IDs
      const { data: friendsData, error: friendsError } = await supabase
        .from('friends')
        .select('friend_id') // Ensure this column name matches your database schema
        .eq('user_id', user.id);
  
      if (friendsError) {
        console.error('Error fetching friends:', friendsError);
        setLoading(false);
        return;
      }
  
      const friendIds = friendsData ? friendsData.map(friend => friend.friend_id) : [];
      const userAndFriendIds = [user.id, ...friendIds];
  
      // Fetch dares from both the user and their friends
      const { data: daresData, error: daresError } = await supabase
        .from('dares')
        .select('id, title, creator_id, profiles(username), created_at')
        .in('creator_id', userAndFriendIds)
        .order('created_at', { ascending: false });
  
      if (daresError) {
        console.error('Error fetching feed dares:', daresError);
        setLoading(false);
        return;
      }
  
      // Format the fetched dares
      const formattedDares = daresData
        ? daresData.map(dare => ({
            id: dare.id,
            title: dare.title,
            creator_id: dare.creator_id,
            creator_username: dare.profiles?.username || 'Unknown',
            created_at: dare.created_at,
          }))
        : [];
  
      setFeedDares(formattedDares);
    } catch (error) {
      console.error('Error fetching feed:', error);
    } finally {
      setLoading(false);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors?.background?.[isDark ? 'dark' : 'light'] ?? (isDark ? '#111827' : '#FFFFFF'),
    },
    header: {
      padding: 16,
      backgroundColor: colors?.background?.card?.[isDark ? 'dark' : 'light'] ?? (isDark ? '#1F2937' : '#F3F4F6'),
      borderBottomWidth: 1,
      borderBottomColor: isDark ? '#374151' : '#E5E7EB',
    },
    headerTitle: {
      fontFamily: 'SpaceGrotesk-Bold',
      fontSize: 32,
      color: colors?.text?.primary?.[isDark ? 'dark' : 'light'] ?? (isDark ? '#F9FAFB' : '#111827'),
      marginBottom: 4,
    },
    headerSubtitle: {
      fontFamily: 'Inter-Regular',
      fontSize: 16,
      color: colors?.text?.secondary?.[isDark ? 'dark' : 'light'] ?? (isDark ? '#9CA3AF' : '#6B7280'),
    },
    notificationButton: {
      position: 'absolute',
      top: 16,
      right: 16,
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: colors?.background?.card?.[isDark ? 'dark' : 'light'] ?? (isDark ? '#1F2937' : '#F3F4F6'),
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: isDark ? '#374151' : '#E5E7EB',
      zIndex: 1,
    },
    content: {
      padding: 16,
      paddingBottom: 32,
    },
    sectionTitle: {
      fontFamily: 'SpaceGrotesk-Bold',
      fontSize: 20,
      color: colors?.text?.primary?.[isDark ? 'dark' : 'light'] ?? (isDark ? '#F9FAFB' : '#111827'),
      marginBottom: 16,
    },
    feedDareCard: {
      backgroundColor: colors?.background?.card?.[isDark ? 'dark' : 'light'] ?? (isDark ? '#1F2937' : '#F3F4F6'),
      borderRadius: 12,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: isDark ? '#374151' : '#E5E7EB',
      padding: 16,
    },
    feedDareTitle: {
      fontFamily: 'SpaceGrotesk-Bold',
      fontSize: 18,
      color: colors?.text?.primary?.[isDark ? 'dark' : 'light'] ?? (isDark ? '#F9FAFB' : '#111827'),
      marginBottom: 8,
    },
    feedDareMeta: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 4,
    },
    feedDareCreator: {
      fontFamily: 'Inter-Medium',
      fontSize: 14,
      color: colors?.primary?.[isDark ? 'dark' : 'light'],
    },
    feedDareTime: {
      fontFamily: 'Inter-Regular',
      fontSize: 12,
      color: colors?.text?.secondary?.[isDark ? 'dark' : 'light'] ?? (isDark ? '#9CA3AF' : '#6B7280'),
    },
  });

  return (
    <SafeAreaWrapper>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.notificationButton}
            onPress={handleNotificationPress}
            activeOpacity={0.6}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Bell
              size={24}
              color={colors?.text?.primary?.[isDark ? 'dark' : 'light'] ?? (isDark ? '#F9FAFB' : '#111827')}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>DareMeX</Text>
          <Text style={styles.headerSubtitle}>Dare to be different</Text>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.sectionTitle}>Latest Dares</Text>
          {loading ? (
            <Text style={{ color: colors?.text?.secondary?.[isDark ? 'dark' : 'light'] }}>Loading feed...</Text>
          ) : feedDares.length > 0 ? (
            feedDares.map((dare) => (
              <AnimatedTouchable
                key={dare.id}
                entering={FadeInDown.delay(100)}
                style={styles.feedDareCard}
                onPress={() => router.push(`/dare/${dare.id}`)}
              >
                <Text style={styles.feedDareTitle}>{dare.title}</Text>
                <View style={styles.feedDareMeta}>
                  <Text style={styles.feedDareCreator}>by {dare.creator_username}</Text>
                  <Text style={styles.feedDareTime}>{dayjs(dare.created_at).fromNow()}</Text>
                </View>
              </AnimatedTouchable>
            ))
          ) : (
            <Text style={{ color: colors?.text?.secondary?.[isDark ? 'dark' : 'light'] }}>No dares in your feed yet. Follow some friends!</Text>
          )}
        </ScrollView>
      </View>
    </SafeAreaWrapper>
  );
}