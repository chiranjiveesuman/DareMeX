import React, { useEffect, useState, useCallback, memo, useMemo, useRef } from 'react';
import { View, Text, Pressable, FlatList, StyleSheet, Image, TouchableOpacity, ActivityIndicator, TextInput, ViewStyle, TextStyle } from 'react-native';
import { useRouter, Stack, useLocalSearchParams } from 'expo-router';
import { Send, Camera, Image as ImageIcon, ArrowLeft, Phone, Video } from 'lucide-react-native';
import { supabase } from '@/supabase/config';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import SafeAreaWrapper from '@/components/SafeAreaWrapper';

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  read: boolean;
  type?: 'text' | 'image' | 'video' | 'file';
  status?: 'sent' | 'delivered' | 'read';
  sender: {
    username: string;
    avatar_url?: string;
  };
}

interface Profile {
  id: string;
  username: string;
  avatar_url?: string;
  display_name?: string;
}

// Constants for layout calculations
const ITEM_HEIGHT = 80;
const SEPARATOR_HEIGHT = 8;
const PAGE_SIZE = 20;

// Pre-define all styles to prevent recreation
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
  },
  headerSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    opacity: 0.7,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 16,
    marginLeft: 'auto',
  },
  content: {
    flex: 1,
    },
    messageList: {
    padding: 16,
    flexGrow: 1,
    },
    messageContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 8,
      maxWidth: '80%',
  },
  messageBubble: {
      padding: 12,
      borderRadius: 16,
    marginHorizontal: 4,
    },
    sentMessage: {
    backgroundColor: '#2563EB',
    marginLeft: 'auto',
    borderBottomRightRadius: 4,
    },
    receivedMessage: {
    backgroundColor: '#1F2937',
    marginRight: 'auto',
    borderBottomLeftRadius: 4,
    },
    messageText: {
    fontSize: 16,
      fontFamily: 'Inter-Regular',
      color: '#FFFFFF',
    },
  timestamp: {
    fontSize: 12,
      fontFamily: 'Inter-Regular',
    opacity: 0.7,
      marginTop: 4,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    padding: 16,
      borderTopWidth: 1,
    gap: 12,
    },
    input: {
      flex: 1,
    height: 40,
    borderRadius: 20,
      paddingHorizontal: 16,
    fontSize: 16,
      fontFamily: 'Inter-Regular',
    },
    sendButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
    backgroundColor: '#2563EB',
      justifyContent: 'center',
      alignItems: 'center',
    },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
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

// Memoized message item component
const MessageItem = memo(({ item, isSent, colors, isDark, formatTime }: {
  item: Message;
  isSent: boolean;
  colors: any;
  isDark: boolean;
  formatTime: (timestamp: string) => string;
}) => {
  const containerStyle = useMemo(() => ({
    ...styles.messageContainer,
    flexDirection: isSent ? 'row-reverse' : 'row' as const,
    alignItems: 'flex-end' as const,
    marginBottom: 8,
    maxWidth: '80%',
  } satisfies ViewStyle), [isSent]);

  const bubbleStyle = useMemo(() => ({
    ...styles.messageBubble,
    ...(isSent ? styles.sentMessage : styles.receivedMessage),
  } satisfies ViewStyle), [isSent]);

  const textStyle = useMemo(() => ({
    ...styles.messageText,
    color: '#FFFFFF',
  } satisfies TextStyle), []);

  const timestampStyle = useMemo(() => ({
    ...styles.timestamp,
    color: '#FFFFFF',
    opacity: 0.7,
    textAlign: isSent ? 'right' : 'left' as const,
  } satisfies TextStyle), [isSent]);

  const avatarUri = useMemo(() => 
    item.sender?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.sender?.username || 'User')}`,
  [item.sender?.avatar_url, item.sender?.username]);

  const formattedTime = useMemo(() => formatTime(item.created_at), [formatTime, item.created_at]);

  return (
    <View style={containerStyle}>
      {!isSent && <Image source={{ uri: avatarUri }} style={styles.avatar} />}
      <View style={bubbleStyle}>
        <Text style={textStyle}>{item.content}</Text>
        <Text style={timestampStyle}>{formattedTime}</Text>
      </View>
      {isSent && <Image source={{ uri: avatarUri }} style={styles.avatar} />}
    </View>
  );
}, (prev, next) => {
  return (
    prev.item.id === next.item.id &&
    prev.isSent === next.isSent &&
    prev.isDark === next.isDark &&
    prev.item.created_at === next.item.created_at
  );
});

export default function ChatScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const { colors, isDark } = useTheme();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMoreData, setHasMoreData] = useState(true);
  const [page, setPage] = useState(0);
  const [chatPartner, setChatPartner] = useState<Profile | null>(null);
  const flatListRef = useRef<FlatList>(null);
  const messagesRef = useRef(messages);
  const pageRef = useRef(page);

  // Update refs when state changes
  useEffect(() => {
    messagesRef.current = messages;
    pageRef.current = page;
  }, [messages, page]);

  useEffect(() => {
    if (!user || !id) return;

    // Load chat partner profile
    const loadChatPartner = async () => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (profile) {
        setChatPartner(profile);
      }
    };

    loadChatPartner();

    // Load initial messages
    loadMessages(true);

    // Set up real-time subscription
    const subscription = supabase
      .channel(`chat:${id}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'messages',
        filter: `(sender_id=eq.${user.id} AND receiver_id=eq.${id}) OR (sender_id=eq.${id} AND receiver_id=eq.${user.id})`,
      }, async (payload: { eventType: string; new: any }) => {
        if (payload.eventType === 'INSERT') {
          try {
            // Get the message with sender profile in a single query
            const { data: msgData, error: msgError } = await supabase
              .from('messages')
              .select(`
                *,
                sender:profiles!messages_sender_id_fkey (
                  id,
                  username,
                  avatar_url
                )
              `)
              .eq('id', payload.new.id)
              .single();

            if (msgError) {
              console.error('Error fetching message details:', msgError);
              return;
            }

            if (msgData) {
              const newMessage: Message = {
                id: msgData.id,
                sender_id: msgData.sender_id,
                receiver_id: msgData.receiver_id,
                content: msgData.content,
                created_at: msgData.created_at,
                read: msgData.read,
                type: msgData.type,
                status: msgData.status,
                sender: msgData.sender ? {
                  username: msgData.sender.username || 'Unknown User',
                  avatar_url: msgData.sender.avatar_url
                } : { username: 'Unknown User' }
              };

              // Add new message to the list
              setMessages(prev => [...prev, newMessage]);

              // Mark message as read if it's received
              if (msgData.receiver_id === user.id && !msgData.read) {
                await supabase
                  .from('messages')
                  .update({ read: true })
                  .eq('id', msgData.id);
              }
            }
          } catch (error) {
            console.error('Error processing new message:', error);
          }
        }
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user?.id, id]);

  const loadMessages = async (reset = false) => {
    if (!user || !id || loadingMore) return;

    try {
      if (reset) {
        setLoading(true);
        setPage(0);
      } else {
        setLoadingMore(true);
      }

      const currentPage = reset ? 0 : page;

      const { data: messageData, error: messageError } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey (
            id,
            username,
            avatar_url
          )
        `)
        .eq('receiver_id', user.id)
        .order('created_at', { ascending: false })
        .limit(PAGE_SIZE);

      if (messageError) throw messageError;

      if (messageData && messageData.length < PAGE_SIZE) {
        setHasMoreData(false);
      }

      const processedMessages: Message[] = messageData.map((msg: any) => ({
        id: msg.id,
        sender_id: msg.sender_id,
        receiver_id: msg.receiver_id,
        content: msg.content,
        created_at: msg.created_at,
        read: msg.read,
        type: msg.type,
        status: msg.status,
        sender: msg.sender ? {
          username: msg.sender.username || 'Unknown User',
          avatar_url: msg.sender.avatar_url
        } : { username: 'Unknown User' }
      }));

      if (reset) {
        setMessages(processedMessages);
      } else {
        setMessages(prev => [...prev, ...processedMessages]);
      }

      if (!reset) {
        setPage(currentPage + 1);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const sendMessage = async () => {
    if (!user || !id || !newMessage.trim()) return;

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          receiver_id: id,
          content: newMessage.trim(),
          type: 'text',
          status: 'sent'
        })
        .select()
        .single();

      if (error) throw error;

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

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

  // Memoized style objects
  const screenStyle = useMemo(() => ({
    ...styles.container,
    backgroundColor: colors?.background?.[isDark ? 'dark' : 'light'],
  }), [colors?.background, isDark]);

  const headerStyle = useMemo(() => ({
    ...styles.header,
    backgroundColor: colors?.background?.card?.[isDark ? 'dark' : 'light'],
    borderBottomColor: isDark ? '#374151' : '#E5E7EB',
  }), [colors?.background?.card, isDark]);

  const inputStyle = useMemo(() => ({
    ...styles.input,
    backgroundColor: colors?.background?.card?.[isDark ? 'dark' : 'light'],
    color: colors?.text?.primary?.[isDark ? 'dark' : 'light'],
    borderColor: isDark ? '#374151' : '#E5E7EB',
  }), [colors?.background?.card, colors?.text?.primary, isDark]);

  // Memoized render functions
  const keyExtractor = useCallback((item: Message) => item.id.toString(), []);

  const getItemLayout = useCallback((_: any, index: number) => ({
    length: ITEM_HEIGHT + SEPARATOR_HEIGHT,
    offset: (ITEM_HEIGHT + SEPARATOR_HEIGHT) * index,
    index,
  }), []);

  const renderMessageItem = useCallback(({ item }: { item: Message }) => (
    <MessageItem
      item={item}
      isSent={item.sender_id === user?.id}
      colors={colors}
      isDark={isDark}
      formatTime={formatTime}
    />
  ), [colors, isDark, user?.id, formatTime]);

  const renderSeparator = useCallback(() => <View style={{ height: SEPARATOR_HEIGHT }} />, []);

  const renderEmpty = useCallback(() => (
    <View style={styles.emptyContainer}>
      <Text style={[styles.emptyText, { color: colors?.text?.primary?.[isDark ? 'dark' : 'light'] }]}>
        No messages yet. Start the conversation!
      </Text>
    </View>
  ), [colors?.text?.primary, isDark]);

  const renderFooter = useCallback(() => (
    loadingMore ? (
      <View style={{ padding: 16, alignItems: 'center' }}>
        <ActivityIndicator size="small" color={colors?.primary} />
      </View>
    ) : null
  ), [loadingMore, colors?.primary]);

  const handleEndReached = useCallback(() => {
    if (!loadingMore && hasMoreData) {
      loadMessages();
    }
  }, [loadingMore, hasMoreData]);

  // Super optimized FlatList props
  const flatListProps = useMemo(() => ({
    ref: flatListRef,
    data: messages,
    renderItem: renderMessageItem,
    keyExtractor,
    ItemSeparatorComponent: renderSeparator,
    ListEmptyComponent: renderEmpty,
    ListFooterComponent: renderFooter,
    contentContainerStyle: styles.messageList,
    removeClippedSubviews: true,
    maxToRenderPerBatch: 3,
    updateCellsBatchingPeriod: 100,
    initialNumToRender: 10,
    windowSize: 2,
    getItemLayout,
    showsVerticalScrollIndicator: false,
    onEndReached: handleEndReached,
    onEndReachedThreshold: 0.5,
    maintainVisibleContentPosition: {
      minIndexForVisible: 0,
    },
  }), [
    messages,
    renderMessageItem,
    keyExtractor,
    renderSeparator,
    renderEmpty,
    renderFooter,
    getItemLayout,
    handleEndReached,
  ]);

  if (loading) {
    return (
      <SafeAreaWrapper>
        <View style={screenStyle}>
          <ActivityIndicator size="large" color={colors?.primary} />
        </View>
      </SafeAreaWrapper>
    );
  }

  return (
    <SafeAreaWrapper>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={screenStyle}>
        <View style={headerStyle}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <ArrowLeft size={24} color={colors?.text?.primary?.[isDark ? 'dark' : 'light']} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={[styles.headerTitle, { color: colors?.text?.primary?.[isDark ? 'dark' : 'light'] }]}>
              {chatPartner?.display_name || chatPartner?.username || 'Chat'}
            </Text>
            <Text style={[styles.headerSubtitle, { color: colors?.text?.secondary?.[isDark ? 'dark' : 'light'] }]}>
              {chatPartner?.username}
            </Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.actionButton} activeOpacity={0.7}>
              <Phone size={20} color={colors?.text?.primary?.[isDark ? 'dark' : 'light']} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} activeOpacity={0.7}>
              <Video size={20} color={colors?.text?.primary?.[isDark ? 'dark' : 'light']} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.content}>
          <FlatList {...flatListProps} />
        </View>

        <View style={[styles.inputContainer, { borderTopColor: isDark ? '#374151' : '#E5E7EB' }]}>
          <TouchableOpacity style={styles.actionButton} activeOpacity={0.7}>
            <Camera size={20} color={colors?.text?.primary?.[isDark ? 'dark' : 'light']} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} activeOpacity={0.7}>
            <ImageIcon size={20} color={colors?.text?.primary?.[isDark ? 'dark' : 'light']} />
          </TouchableOpacity>
          <TextInput
            style={inputStyle}
            value={newMessage}
            onChangeText={setNewMessage}
            placeholder="Type a message..."
            placeholderTextColor={colors?.text?.secondary?.[isDark ? 'dark' : 'light']}
            multiline
          />
          <TouchableOpacity
            style={[styles.sendButton, { opacity: newMessage.trim() ? 1 : 0.5 }]}
            onPress={sendMessage}
            disabled={!newMessage.trim()}
            activeOpacity={0.7}
          >
            <Send size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaWrapper>
  );
} 