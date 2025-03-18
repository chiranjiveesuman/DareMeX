import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  Image,
  StyleSheet,
  useColorScheme,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MessageCircle } from 'lucide-react-native';
import { supabase } from '@/supabase/config';
import { useAuth } from '@/context/AuthContext';
import { colors } from '@/styles/globalStyles';

interface ChatPreview {
  user_id: string;
  username: string;
  avatar_url?: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
}

export default function ChatListScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [chats, setChats] = useState<ChatPreview[]>([]);
  const [loading, setLoading] = useState(true);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  useEffect(() => {
    loadChats();
    const subscription = subscribeToMessages();
    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const loadChats = async () => {
    if (!user) return;

    try {
      setLoading(true);
      // Get latest message for each conversation
      const { data: messages, error: messagesError } = await supabase
        .rpc('get_chat_previews', { current_user_id: user.id });

      if (messagesError) throw messagesError;
      setChats(messages || []);
    } catch (error) {
      console.error('Error loading chats:', error);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToMessages = () => {
    if (!user) return;

    return supabase
      .channel('chat_updates')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'messages',
        filter: `or(sender_id.eq.${user.id},receiver_id.eq.${user.id})`,
      }, () => {
        loadChats();
      })
      .subscribe();
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? colors.background.dark : colors.background.light,
    },
    content: {
      flex: 1,
    },
    header: {
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
      backgroundColor: isDark ? colors.background.card.dark : colors.background.card.light,
    },
    headerTitle: {
      fontFamily: 'SpaceGrotesk-Bold',
      fontSize: 32,
      color: isDark ? colors.text.dark : colors.text.light,
    },
    chatItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
      backgroundColor: isDark ? colors.background.card.dark : colors.background.card.light,
    },
    avatar: {
      width: 50,
      height: 50,
      borderRadius: 25,
      marginRight: 12,
    },
    chatInfo: {
      flex: 1,
    },
    chatHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 4,
    },
    username: {
      fontFamily: 'SpaceGrotesk-Bold',
      fontSize: 16,
      color: isDark ? colors.text.dark : colors.text.light,
    },
    time: {
      fontFamily: 'Inter-Regular',
      fontSize: 12,
      color: isDark ? colors.subtext.dark : colors.subtext.light,
    },
    lastMessage: {
      fontFamily: 'Inter-Regular',
      fontSize: 14,
      color: isDark ? colors.subtext.dark : colors.subtext.light,
      marginRight: 8,
    },
    unreadBadge: {
      minWidth: 20,
      height: 20,
      borderRadius: 10,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 6,
    },
    unreadCount: {
      fontFamily: 'Inter-Bold',
      fontSize: 12,
      color: '#FFFFFF',
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 16,
    },
    emptyTitle: {
      fontFamily: 'SpaceGrotesk-Bold',
      fontSize: 20,
      color: isDark ? colors.text.dark : colors.text.light,
      textAlign: 'center',
      marginTop: 16,
    },
    emptyText: {
      fontFamily: 'Inter-Regular',
      fontSize: 16,
      color: isDark ? colors.subtext.dark : colors.subtext.light,
      textAlign: 'center',
      marginTop: 8,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      fontFamily: 'Inter-Regular',
      fontSize: 16,
      color: isDark ? colors.text.dark : colors.text.light,
    },
  });

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading chats...</Text>
        </View>
      );
    }

    if (chats.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <MessageCircle size={48} color={isDark ? colors.subtext.dark : colors.subtext.light} />
          <Text style={styles.emptyTitle}>No messages yet</Text>
          <Text style={styles.emptyText}>
            Start a conversation with your friends from their profile
          </Text>
        </View>
      );
    }

    return (
      <FlatList
        data={chats}
        keyExtractor={item => item.user_id}
        renderItem={({ item }) => (
          <Pressable
            style={styles.chatItem}
            onPress={() => router.push(`/chat/${item.user_id}`)}
          >
            <Image
              source={{
                uri: item.avatar_url || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&auto=format&fit=crop',
              }}
              style={styles.avatar}
            />
            <View style={styles.chatInfo}>
              <View style={styles.chatHeader}>
                <Text style={styles.username}>{item.username}</Text>
                <Text style={styles.time}>{formatTime(item.last_message_time)}</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={styles.lastMessage} numberOfLines={1}>
                  {item.last_message}
                </Text>
                {item.unread_count > 0 && (
                  <View style={styles.unreadBadge}>
                    <Text style={styles.unreadCount}>{item.unread_count}</Text>
                  </View>
                )}
              </View>
            </View>
          </Pressable>
        )}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
      </View>
      <View style={styles.content}>
        {renderContent()}
      </View>
    </SafeAreaView>
  );
} 