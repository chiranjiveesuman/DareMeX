import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Image,
  StyleSheet,
  useColorScheme,
  SafeAreaView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Send, ChevronLeft } from 'lucide-react-native';
import { useChat } from '@/context/ChatContext';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/supabase/config';
import { colors } from '@/styles/globalStyles';
import { formatDistanceToNow } from 'date-fns';

interface Profile {
  username: string;
  avatar_url?: string;
}

const defaultAvatar = require('@/assets/default-avatar.png');

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { messages, sendMessage, loadMessages, markAsRead } = useChat();
  const [newMessage, setNewMessage] = useState('');
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const flatListRef = useRef<FlatList>(null);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const isInitialLoadRef = useRef(true);
  const [shouldScrollToEnd, setShouldScrollToEnd] = useState(false);

  // Keep a reference to the latest messages count to detect new ones
  const prevMessageCountRef = useRef(0);

  // Load chat data on initial mount or ID change
  useEffect(() => {
    loadChatData();
    isInitialLoadRef.current = true;
    
    return () => {
      // Cleanup not needed due to global chat context
    };
  }, [id]);

  // Filter messages for the current conversation
  const currentChatMessages = useCallback(() => {
    if (!user || !id) return [];
    
    // Ensure we always see the latest messages for this conversation
    const filteredMessages = messages.filter(message => 
      (message.sender_id === user.id && message.receiver_id === id as string) || 
      (message.sender_id === id as string && message.receiver_id === user.id)
    );
    
    // Check for new messages and scroll if needed
    if (filteredMessages.length > prevMessageCountRef.current) {
      console.log(`New messages detected: ${filteredMessages.length} vs ${prevMessageCountRef.current}`);
      setShouldScrollToEnd(true);
    }
    
    // Update our reference count
    prevMessageCountRef.current = filteredMessages.length;
    
    return filteredMessages;
  }, [messages, user?.id, id]);
  
  // This will force the FlatList to rerender when messages change
  useEffect(() => {
    if (messages.length > 0) {
      console.log(`Messages updated: ${messages.length} total messages in state`);
      // Force a re-render and scroll when messages are updated
      setShouldScrollToEnd(true);
    }
  }, [messages]);

  // This effect handles the actual scrolling after render
  useEffect(() => {
    if (shouldScrollToEnd && !loading) {
      console.log('Executing scroll to end');
      
      // Use a shorter delay for quicker response
      const timer = setTimeout(() => {
        if (flatListRef.current) {
          flatListRef.current.scrollToEnd({ animated: true });
          console.log('Scrolled to end');
        }
        setShouldScrollToEnd(false);
      }, 50);
      
      return () => clearTimeout(timer);
    }
  }, [shouldScrollToEnd, loading]);

  const loadChatData = async () => {
    if (!id || !user) return;

    try {
      setLoading(true);
      console.log('Loading chat data for partner:', id);
      
      // Load chat partner's profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('username, avatar_url')
        .eq('id', id)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

      // Load messages
      await loadMessages(id as string);
      
      // Set flag to scroll to end after initial load
      setShouldScrollToEnd(true);

      // Mark messages as read when chat is opened
      await markAsRead(id);
    } catch (error) {
      console.error('Error loading chat data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!newMessage.trim() || !id) return;

    try {
      // Store message content and clear input immediately for better UX
      const messageContent = newMessage.trim();
      setNewMessage('');
      
      // Send the message
      await sendMessage(id as string, messageContent);
      
      // Set flag to scroll to end after sending
      setShouldScrollToEnd(true);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // Format timestamps for display
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return formatDistanceToNow(date, { addSuffix: true });
  };

  // Function to check if there are new messages for this conversation
  const hasNewMessages = useCallback(() => {
    if (!user || !id || messages.length === 0) return false;
    
    // Check for messages from the chat partner that are unread
    const unreadMessages = messages.filter(message => 
      message.sender_id === id && 
      message.receiver_id === user.id && 
      !message.read
    );
    
    return unreadMessages.length > 0;
  }, [messages, user?.id, id]);

  // Sort messages by creation time, newest last
  const sortedMessages = [...messages]
    .filter(msg => (msg.sender_id === user?.id && msg.receiver_id === id) || 
                 (msg.sender_id === id && msg.receiver_id === user?.id))
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  
  console.log(`Rendering chat with ${sortedMessages.length} messages`);
  
  // Auto-scroll to the bottom whenever messages change
  useEffect(() => {
    if (sortedMessages.length > 0 && flatListRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
      console.log('Auto-scrolling to latest message');
    }
  }, [sortedMessages.length]);

  // Render a single message item
  const renderMessage = ({ item }: { item: Message }) => {
    const isOwnMessage = item.sender_id === user?.id;
    
    return (
      <View style={[
        styles.messageContainer,
        isOwnMessage ? styles.sentMessage : styles.receivedMessage
      ]}>
        {!isOwnMessage && (
          <Image
            source={
              item.sender?.avatar_url 
                ? { uri: item.sender.avatar_url } 
                : defaultAvatar
            }
            style={styles.avatar}
            contentFit="cover"
            transition={200}
          />
        )}
        <View style={styles.messageContent}>
          <Text style={[
            styles.messageText,
            !isOwnMessage && styles.receivedMessageText
          ]}>
            {item.content}
          </Text>
          <View style={styles.messageFooter}>
            <Text style={styles.timeText}>
              {formatTime(item.created_at)}
            </Text>
            {isOwnMessage && renderMessageStatus(item)}
          </View>
        </View>
      </View>
    );
  };

  // Render message status indicators
  const renderMessageStatus = (message: Message) => {
    if (message.sender_id !== user?.id) return null;
    
    let statusText = '';
    let statusColor = 'gray';
    
    switch (message.status) {
      case 'sent':
        statusText = '✓';
        statusColor = '#999';
        break;
      case 'delivered':
        statusText = '✓✓';
        statusColor = '#999';
        break;
      case 'read':
        statusText = '✓✓';
        statusColor = '#2563EB';
        break;
      default:
        statusText = '✓';
        statusColor = '#999';
    }
    
    return (
      <Text style={[styles.messageStatus, { color: statusColor }]}>
        {statusText}
      </Text>
    );
  };

  const keyExtractor = React.useCallback((item) => item.id.toString(), []);

  const onContentSizeChange = React.useCallback(() => {
    if (flatListRef.current && sortedMessages.length > 0) {
      flatListRef.current.scrollToEnd({ animated: false });
    }
  }, [sortedMessages.length]);

  const onLayout = React.useCallback(() => {
    if (flatListRef.current && sortedMessages.length > 0) {
      flatListRef.current.scrollToEnd({ animated: false });
    }
  }, [sortedMessages.length]);

  // Add this function to extract FlatList component rendering
  const renderMessageList = () => (
    <FlatList
      ref={flatListRef}
      data={sortedMessages}
      renderItem={renderMessage}
      keyExtractor={keyExtractor}
      contentContainerStyle={styles.messageList}
      removeClippedSubviews={false}
      showsVerticalScrollIndicator={true}
      initialNumToRender={20}
      windowSize={21}
      maxToRenderPerBatch={10}
      updateCellsBatchingPeriod={30}
      // This forces a re-render whenever messages change
      extraData={sortedMessages.length + (sortedMessages.length > 0 ? sortedMessages[sortedMessages.length - 1].id : '')}
      onContentSizeChange={onContentSizeChange}
      onLayout={onLayout}
      keyboardShouldPersistTaps="handled"
      ListEmptyComponent={
        <View style={styles.emptyContainerInList}>
          <Text style={styles.emptyText}>No messages yet</Text>
          <Text style={styles.emptySubtext}>Start a conversation with {profile?.username}</Text>
        </View>
      }
    />
  );

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? colors.background.dark : colors.background.light,
    },
    keyboardView: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
    },
    chatContainer: {
      flex: 1,
      position: 'relative',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
      backgroundColor: isDark ? colors.background.card.dark : colors.background.card.light,
    },
    backButton: {
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 8,
    },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      marginRight: 12,
    },
    username: {
      fontFamily: 'SpaceGrotesk-Bold',
      fontSize: 18,
      color: isDark ? colors.text.dark : colors.text.light,
    },
    messageList: {
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 16,
    },
    messageContainer: {
      maxWidth: '80%',
      marginVertical: 4,
      padding: 12,
      borderRadius: 16,
    },
    sentMessage: {
      alignSelf: 'flex-end',
      backgroundColor: colors.primary,
    },
    receivedMessage: {
      alignSelf: 'flex-start',
      backgroundColor: isDark ? colors.background.card.dark : colors.background.card.light,
    },
    messageText: {
      fontFamily: 'Inter-Regular',
      fontSize: 16,
      color: '#FFFFFF',
    },
    receivedMessageText: {
      color: isDark ? colors.text.dark : colors.text.light,
    },
    timeText: {
      fontFamily: 'Inter-Regular',
      fontSize: 12,
      color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)',
      marginTop: 4,
      alignSelf: 'flex-end',
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      borderTopWidth: 1,
      borderTopColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
      backgroundColor: isDark ? colors.background.card.dark : colors.background.card.light,
    },
    input: {
      flex: 1,
      maxHeight: 100,
      minHeight: 40,
      marginRight: 12,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: isDark ? colors.background.dark : '#F3F4F6',
      color: isDark ? colors.text.dark : colors.text.light,
      fontFamily: 'Inter-Regular',
    },
    sendButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    disabledButton: {
      backgroundColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
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
      marginTop: 12,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 16,
    },
    emptyContainerInList: {
      paddingVertical: 80,
      justifyContent: 'center',
      alignItems: 'center',
    },
    emptyText: {
      fontFamily: 'SpaceGrotesk-Bold',
      fontSize: 18,
      color: isDark ? colors.text.dark : colors.text.light,
      marginBottom: 8,
    },
    emptySubtext: {
      fontFamily: 'Inter-Regular',
      fontSize: 14,
      color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)',
      textAlign: 'center',
    },
    messageStatus: {
      fontFamily: 'Inter-Regular',
      fontSize: 12,
      color: 'gray',
      marginLeft: 4,
    },
    messageFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    messageContent: {
      flexDirection: 'column',
    },
  });

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading chat...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <Stack.Screen
          options={{
            title: 'Chat'
          }}
        />
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <ChevronLeft size={24} color={isDark ? colors.text.dark : colors.text.light} />
          </Pressable>
          <Image
            source={{
              uri: profile?.avatar_url || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&auto=format&fit=crop',
            }}
            style={styles.avatar}
          />
          <Text style={styles.username}>{profile?.username}</Text>
        </View>

        <View style={styles.chatContainer}>
          {renderMessageList()}
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={newMessage}
            onChangeText={setNewMessage}
            placeholder="Type a message..."
            placeholderTextColor={isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'}
            multiline
          />
          <Pressable 
            style={[
              styles.sendButton,
              !newMessage.trim() && styles.disabledButton
            ]} 
            onPress={handleSend}
            disabled={!newMessage.trim()}
          >
            <Send size={20} color="#FFFFFF" />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
} 