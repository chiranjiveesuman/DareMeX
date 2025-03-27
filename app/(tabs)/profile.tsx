import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, StyleSheet, Modal, Pressable, FlatList, Dimensions } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { Settings, LogOut, MoreVertical } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import SafeAreaWrapper from '@/components/SafeAreaWrapper';
import { supabase } from '@/supabase/config';

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

  useEffect(() => {
    fetchUserDares();
  }, [user]);

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
        </View>

        {loading ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Loading dares...</Text>
          </View>
        ) : dares.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No dares created yet</Text>
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