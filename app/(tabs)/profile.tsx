import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, StyleSheet, Modal, Pressable, FlatList, Dimensions } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { Settings, LogOut, MoreVertical, UserPlus } from 'lucide-react-native'; // Import UserPlus for potential future use
import { useRouter } from 'expo-router';
import SafeAreaWrapper from '@/components/SafeAreaWrapper';
import { supabase } from '@/supabase/config';
import Animated, { FadeInDown } from 'react-native-reanimated';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface RecentDare {
  id: string;
  title: string;
  creator: string;
  participants: number;
}

const RECENT_DARES: RecentDare[] = [
  {
    id: '1',
    title: 'Ice Bucket Challenge',
    creator: 'CosmicWolf365',
    participants: 128,
  },
  {
    id: '2',
    title: 'Lip Sync Battle',
    creator: 'MysticDragon789',
    participants: 64,
  },
  {
    id: '3',
    title: 'Blindfolded Makeup',
    creator: 'NobleEagle123',
    participants: 96,
  },
];

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
}

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const { colors, isDark } = useTheme();
  const router = useRouter();
  const [menuVisible, setMenuVisible] = useState(false);
  const [dares, setDares] = useState<Dare[]>([]);
  const [loading, setLoading] = useState(true);
  const [friendCount, setFriendCount] = useState(0); // State to hold the friend count

  useEffect(() => {
    fetchUserDares();
    fetchFriendCount(); // Fetch the friend count when the user changes
  }, [user]);

  const fetchFriendCount = async () => {
    if (!user?.id) return;
    try {
      const { data: sentRequests, error: sentError } = await supabase
        .from('friends')
        .select('*', { count: 'exact' })
        .eq('sender_id', user.id)
        .eq('status', 'accepted');

      const { data: receivedRequests, error: receivedError } = await supabase
        .from('friends')
        .select('*', { count: 'exact' })
        .eq('receiver_id', user.id)
        .eq('status', 'accepted');

      if (sentError || receivedError) {
        console.error('Error fetching friend count:', sentError || receivedError);
      } else {
        const sentCount = sentRequests ? sentRequests.length : 0;
        const receivedCount = receivedRequests ? receivedRequests.length : 0;
        setFriendCount(sentCount + receivedCount);
      }
    } catch (error) {
      console.error('Error fetching friend count:', error);
    }
  };

  const fetchUserDares = async () => {
    try {
      if (!user?.id) return;

      const { data, error } = await supabase
        .from('dares')
        .select('*')
        .eq('creator_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDares(data || []);
    } catch (error) {
      console.error('Error fetching dares:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderDareItem = ({ item }: { item: Dare }) => (
    <TouchableOpacity
      style={[
        styles.dareItem,
        item.media_url ? styles.dareCard : styles.dareTextOnly,
        { backgroundColor: colors.card }
      ]}
      onPress={() => router.push({
        pathname: '/dare/[id]',
        params: { id: item.id }
      })}
    >
      {item.media_url ? (
        <>
          <Image
            source={{ uri: item.media_url }}
            style={styles.dareImage}
            resizeMode="cover"
          />
          <View style={styles.dareInfo}>
            <Text style={[styles.dareTitle, { color: colors.text }]} numberOfLines={1}>
              {item.title}
            </Text>
            <View style={styles.dareStats}>
              <Text style={[styles.dareStatText, { color: colors.textSecondary }]}>
                {item.likes} likes • {item.comments} comments
              </Text>
              <View style={[styles.difficultyBadge, { backgroundColor: colors.primary + '20' }]}>
                <Text style={[styles.difficultyText, { color: colors.primary }]}>
                  {item.difficulty}
                </Text>
              </View>
            </View>
          </View>
        </>
      ) : (
        <View style={styles.dareTextContent}>
          <View style={styles.dareHeader}>
            <Text style={[styles.dareTitle, { color: colors.text }]} numberOfLines={2}>
              {item.title}
            </Text>
            <View style={[styles.difficultyBadge, { backgroundColor: colors.primary + '20' }]}>
              <Text style={[styles.difficultyText, { color: colors.primary }]}>
                {item.difficulty}
              </Text>
            </View>
          </View>
          <Text
            style={[styles.dareDescription, { color: colors.textSecondary }]}
            numberOfLines={2}
          >
            {item.description}
          </Text>
          <View style={styles.dareStats}>
            <Text style={[styles.dareStatText, { color: colors.textSecondary }]}>
              {item.likes} likes • {item.comments} comments
            </Text>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      padding: 16,
    },
    headerContainer: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      paddingHorizontal: 16,
      paddingTop: 8,
      paddingBottom: 16,
    },
    menuButton: {
      padding: 8,
    },
    header: {
      alignItems: 'center',
      marginBottom: 24,
    },
    avatar: {
      width: 120,
      height: 120,
      borderRadius: 60,
      marginBottom: 16,
      backgroundColor: colors.border,
    },
    username: {
      fontFamily: 'SpaceGrotesk-Bold',
      fontSize: 24,
      color: colors.text,
      marginBottom: 4,
    },
    email: {
      fontFamily: 'Inter-Regular',
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 8, // Added some margin below email
    },
    friendsContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    friendCountCircle: {
      backgroundColor: colors.primary,
      borderRadius: 10,
      width: 20,
      height: 20,
      justifyContent: 'center',
      alignItems: 'center',
      marginLeft: 8,
    },
    friendCountText: {
      fontFamily: 'Inter-Medium',
      fontSize: 12,
      color: colors.textLight,
    },
    // Menu Modal Styles
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    menuContainer: {
      position: 'absolute',
      top: 60,
      right: 20,
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 8,
      minWidth: 180,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      borderRadius: 8,
    },
    menuText: {
      fontFamily: 'Inter-Medium',
      fontSize: 16,
      color: colors.text,
      marginLeft: 12,
    },
    menuDivider: {
      height: 1,
      backgroundColor: colors.border,
      marginVertical: 4,
    },
    dangerText: {
      color: isDark ? '#FCA5A5' : '#991B1B',
    },
    // Dare Card Styles
    dareItem: {
      borderRadius: 12,
      marginBottom: 16,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: colors.border,
    },
    dareCard: {
      // No additional styles needed, uses dareItem base styles
    },
    dareTextOnly: {
      padding: 16,
    },
    dareTextContent: {
      gap: 8,
    },
    dareHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: 12,
    },
    dareDescription: {
      fontFamily: 'Inter-Regular',
      fontSize: 14,
      lineHeight: 20,
    },
    dareImage: {
      width: '100%',
      height: 200,
      backgroundColor: colors.border,
    },
    dareInfo: {
      padding: 12,
    },
    dareTitle: {
      fontFamily: 'SpaceGrotesk-Bold',
      fontSize: 16,
      marginBottom: 8,
    },
    dareStats: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    dareStatText: {
      fontFamily: 'Inter-Regular',
      fontSize: 12,
    },
    difficultyBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },
    difficultyText: {
      fontFamily: 'Inter-Medium',
      fontSize: 12,
    },
    emptyContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
    },
    emptyText: {
      fontFamily: 'Inter-Regular',
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    sectionTitle: {
      fontFamily: 'SpaceGrotesk-Bold',
      fontSize: 20,
      color: colors?.text?.primary?.[isDark ? 'dark' : 'light'] ?? (isDark ? '#F9FAFB' : '#111827'),
      marginBottom: 16,
      marginTop: 24, // Added some top margin for separation
    },
    recentDareCard: {
      backgroundColor: colors?.background?.card?.[isDark ? 'dark' : 'light'] ?? (isDark ? '#1F2937' : '#F3F4F6'),
      borderRadius: 12,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: isDark ? '#374151' : '#E5E7EB',
    },
    recentDareContent: {
      padding: 16,
      gap: 12,
    },
    recentDareTitle: {
      fontFamily: 'SpaceGrotesk-Bold',
      fontSize: 18,
      color: colors?.text?.primary?.[isDark ? 'dark' : 'light'] ?? (isDark ? '#F9FAFB' : '#111827'),
    },
    recentDareFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    participants: {
      fontFamily: 'Inter-Medium',
      fontSize: 14,
      color: colors?.primary?.[isDark ? 'dark' : 'light'],
    },
    creator: {
      fontFamily: 'Inter-Regular',
      fontSize: 14,
      color: colors?.text?.secondary?.[isDark ? 'dark' : 'light'] ?? (isDark ? '#9CA3AF' : '#6B7280'),
    },
  });

  const handleSignOut = async () => {
    try {
      setMenuVisible(false);
      await signOut();
      router.replace('/sign-in');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <SafeAreaWrapper>
      <View style={styles.headerContainer}>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => setMenuVisible(true)}
        >
          <MoreVertical size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Image
            source={{
              uri: user?.avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&auto=format&fit=crop'
            }}
            style={styles.avatar}
          />
          <Text style={styles.username}>
            {user?.username || 'User'}
          </Text>
          <Text style={styles.email}>{user?.email}</Text>
          <View style={styles.friendsContainer}>
            <UserPlus size={16} color={colors.primary} /> {/* Using UserPlus icon */}
            <View style={styles.friendCountCircle}>
              <Text style={styles.friendCountText}>{friendCount}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Your Dares</Text>
        {loading ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Loading your dares...</Text>
          </View>
        ) : dares.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No dares created by you yet.</Text>
          </View>
        ) : (
          <View>
            {dares.map((dare) => (
              <View key={dare.id}>
                {renderDareItem({ item: dare })}
              </View>
            ))}
          </View>
        )}

        {/* Recent Activity */}
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        {RECENT_DARES.map((dare, index) => (
          <AnimatedTouchable
            key={dare.id}
            entering={FadeInDown.delay(200 + index * 100)}
            style={styles.recentDareCard}
          >
            <View style={styles.recentDareContent}>
              <Text style={styles.recentDareTitle}>{dare.title}</Text>
              <View style={styles.recentDareFooter}>
                <Text style={styles.participants}>
                  {dare.participants} participants
                </Text>
                <Text style={styles.creator}>
                  by {dare.creator}
                </Text>
              </View>
            </View>
          </AnimatedTouchable>
        ))}
      </ScrollView>

      <Modal
        visible={menuVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setMenuVisible(false)}
        >
          <View style={styles.menuContainer}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                router.push('/settings');
              }}
            >
              <Settings size={20} color={colors.text} />
              <Text style={styles.menuText}>Settings</Text>
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleSignOut}
            >
              <LogOut size={20} color={isDark ? '#FCA5A5' : '#991B1B'} />
              <Text style={[styles.menuText, styles.dangerText]}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 16,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  menuButton: {
    padding: 8,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
    backgroundColor: colors.border,
  },
  username: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 24,
    color: colors.text,
    marginBottom: 4,
  },
  email: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8, // Added some margin below email
  },
  friendsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  friendCountCircle: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  friendCountText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: colors.textLight,
  },
  // Menu Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  menuContainer: {
    position: 'absolute',
    top: 60,
    right: 20,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 8,
    minWidth: 180,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
  },
  menuText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: colors.text,
    marginLeft: 12,
  },
  menuDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 4,
  },
  dangerText: {
    color: isDark ? '#FCA5A5' : '#991B1B',
  },
  // Dare Card Styles
  dareItem: {
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  dareCard: {
    // No additional styles needed, uses dareItem base styles
  },
  dareTextOnly: {
    padding: 16,
  },
  dareTextContent: {
    gap: 8,
  },
  dareHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  dareDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    lineHeight: 20,
  },
  dareImage: {
    width: '100%',
    height: 200,
    backgroundColor: colors.border,
  },
  dareInfo: {
    padding: 12,
  },
  dareTitle: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 16,
    marginBottom: 8,
  },
  dareStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dareStatText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  sectionTitle: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 20,
    color: colors?.text?.primary?.[isDark ? 'dark' : 'light'] ?? (isDark ? '#F9FAFB' : '#111827'),
    marginBottom: 16,
    marginTop: 24, // Added some top margin for separation
  },
  recentDareCard: {
    backgroundColor: colors?.background?.card?.[isDark ? 'dark' : 'light'] ?? (isDark ? '#1F2937' : '#F3F4F6'),
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: isDark ? '#374151' : '#E5E7EB',
  },
  recentDareContent: {
    padding: 16,
    gap: 12,
  },
  recentDareTitle: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 18,
    color: colors?.text?.primary?.[isDark ? 'dark' : 'light'] ?? (isDark ? '#F9FAFB' : '#111827'),
  },
  recentDareFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  participants: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: colors?.primary?.[isDark ? 'dark' : 'light'],
  },
  creator: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: colors?.text?.secondary?.[isDark ? 'dark' : 'light'] ?? (isDark ? '#9CA3AF' : '#6B7280'),
  },
});

export default ProfileScreen;