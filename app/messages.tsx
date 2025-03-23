import React, { useEffect, useState, useCallback, memo } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { supabase } from '@/supabase/config';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import SafeAreaWrapper from '@/components/SafeAreaWrapper';

interface Sender {
  id: string;
  username: string;
  avatar_url?: string;
}

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  read: boolean;
  sender: Sender;
}

const ITEM_HEIGHT = 80;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 24,
    flex: 1,
  },
  listContainer: {
    padding: 16,
    flexGrow: 1,
  },
  messageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  messageContent: {
    flex: 1,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  username: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },
  timestamp: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  messagePreview: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#007AFF',
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  emptyText: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    textAlign: 'center',
  },
});

// Memoized components
const Avatar = memo(({ uri, style }: { uri: string; style: any }) => (
  <Image source={{ uri }} style={style} />
));

const EmptyComponent = memo(({ textColor }: { textColor: string }) => (
  <View style={styles.emptyContainer}>
    <Text style={[styles.emptyText, { color: textColor }]}>No messages yet</Text>
  </View>
));

interface MessagesScreenProps {
  isEmbedded?: boolean;
}

export default memo(function MessagesScreen({ isEmbedded = false }: MessagesScreenProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { colors, isDark } = useTheme();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  // Load messages
  useEffect(() => {
    if (!user) return;
    
    const loadMessages = async () => {
      try {
        const { data: messageData, error: messageError } = await supabase
          .from('messages')
          .select(`
            *,
            sender:profiles!fk_sender_profile (
              id,
              username,
              avatar_url
            ),
            receiver:profiles!fk_receiver_profile (
              id,
              username,
              avatar_url
            )
          `)
          .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
          .order('created_at', { ascending: false });

        if (messageError) throw messageError;

        if (messageData) {
          // Group messages by conversation (sender/receiver)
          const conversationMap = new Map();
          
          messageData.forEach(msg => {
            const otherUserId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
            const otherUser = msg.sender_id === user.id ? msg.receiver : msg.sender;
            
            // Always update with the latest message
            conversationMap.set(otherUserId, {
              id: msg.id,
              sender_id: msg.sender_id,
              receiver_id: msg.receiver_id,
              content: msg.content,
              created_at: msg.created_at,
              read: msg.read,
              sender: {
                id: otherUser.id,
                username: otherUser.username || 'Unknown User',
                avatar_url: otherUser.avatar_url
              }
            });
          });

          // Convert map to array and sort by most recent first
          const processedMessages = Array.from(conversationMap.values())
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

          setMessages(processedMessages);
        }
      } catch (error) {
        console.error('Error loading messages:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMessages();

    // Subscribe to new messages
    const messageSubscription = supabase
      .channel('messages')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'messages',
        filter: `receiver_id=eq.${user.id}`,
      }, async (payload: { eventType: string; new: any }) => {
        if (payload.eventType === 'INSERT') {
          try {
            const { data: msgData, error: msgError } = await supabase
              .from('messages')
              .select(`
                *,
                sender:profiles!fk_sender_profile (
                  id,
                  username,
                  avatar_url
                )
              `)
              .eq('id', payload.new.id)
              .single();

            if (msgError) throw msgError;

            if (msgData && msgData.sender) {
              const newMessage: Message = {
                id: msgData.id,
                sender_id: msgData.sender_id,
                receiver_id: msgData.receiver_id,
                content: msgData.content,
                created_at: msgData.created_at,
                read: msgData.read,
                sender: {
                  id: msgData.sender.id,
                  username: msgData.sender.username || 'Unknown User',
                  avatar_url: msgData.sender.avatar_url
                }
              };

              setMessages(current => {
                const existingIndex = current.findIndex(msg => 
                  (msg.sender_id === newMessage.sender_id && msg.receiver_id === newMessage.receiver_id) ||
                  (msg.sender_id === newMessage.receiver_id && msg.receiver_id === newMessage.sender_id)
                );

                if (existingIndex >= 0) {
                  // Update existing conversation
                  const updatedMessages = [...current];
                  updatedMessages[existingIndex] = newMessage;
                  return updatedMessages;
                } else {
                  // Add new conversation
                  return [newMessage, ...current];
                }
              });
            }
          } catch (error) {
            console.error('Error processing new message:', error);
          }
        }
      })
      .subscribe();

    return () => {
      messageSubscription.unsubscribe();
    };
  }, [user?.id]);

  const formatTime = useCallback((timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));

    if (minutes < 60) {
      return `${minutes}m ago`;
    } else if (hours < 24) {
      return `${hours}h ago`;
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return `${days}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  }, []);

  const renderMessageItem = useCallback(({ item }: { item: Message }) => {
    if (!user) return null;

    const handlePress = () => {
      // Mark message as read
      supabase
        .from('messages')
        .update({ read: true })
        .eq('id', item.id)
        .then(() => {
          setMessages(current => 
            current.map(msg => 
              msg.id === item.id ? { ...msg, read: true } : msg
            )
          );
        });
      
      // Navigate to chat with the other user
      const otherUserId = item.sender_id === user.id ? item.receiver_id : item.sender_id;
      router.push({
        pathname: '/chat/[id]' as const,
        params: { id: otherUserId }
      });
    };

    return (
      <TouchableOpacity
        style={[
          styles.messageItem,
          { backgroundColor: colors?.background?.card?.[isDark ? 'dark' : 'light'] }
        ]}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        <Avatar
          uri={item.sender.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.sender.username)}`}
          style={styles.avatar}
        />
        <View style={styles.messageContent}>
          <View style={styles.messageHeader}>
            <Text style={[styles.username, { color: colors?.text?.primary?.[isDark ? 'dark' : 'light'] }]}>
              {item.sender.username}
            </Text>
            <Text style={[styles.timestamp, { color: colors?.text?.secondary?.[isDark ? 'dark' : 'light'] }]}>
              {formatTime(item.created_at)}
            </Text>
          </View>
          <Text
            style={[styles.messagePreview, { color: colors?.text?.secondary?.[isDark ? 'dark' : 'light'] }]}
            numberOfLines={1}
          >
            {item.content}
          </Text>
        </View>
        {!item.read && <View style={styles.unreadDot} />}
      </TouchableOpacity>
    );
  }, [colors, isDark, router, formatTime, user?.id]);

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors?.background?.[isDark ? 'dark' : 'light'] }]}>
        <ActivityIndicator size="large" color={colors?.primary} />
      </View>
    );
  }

  const content = (
    <View style={styles.content}>
      <FlatList
        data={messages}
        renderItem={renderMessageItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <EmptyComponent textColor={colors?.text?.primary?.[isDark ? 'dark' : 'light']} />
        }
        getItemLayout={(_, index) => ({
          length: ITEM_HEIGHT,
          offset: ITEM_HEIGHT * index,
          index,
        })}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={10}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );

  if (isEmbedded) {
    return content;
  }

  return (
    <SafeAreaWrapper>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[styles.container, { backgroundColor: colors?.background?.[isDark ? 'dark' : 'light'] }]}>
        <View style={[styles.header, { 
          backgroundColor: colors?.background?.card?.[isDark ? 'dark' : 'light'],
          borderBottomColor: isDark ? '#374151' : '#E5E7EB',
        }]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <ArrowLeft size={24} color={colors?.text?.primary?.[isDark ? 'dark' : 'light']} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors?.text?.primary?.[isDark ? 'dark' : 'light'] }]}>
            Messages
          </Text>
        </View>
        {content}
      </View>
    </SafeAreaWrapper>
  );
}); 