import React, { useEffect, useState, useCallback, memo, useMemo, useRef } from 'react';
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native';
import { useRouter, Stack, useLocalSearchParams } from 'expo-router';
import { Send, Camera, Image as ImageIcon, ArrowLeft, Phone, Video } from 'lucide-react-native';
import { supabase } from '@/supabase/config';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useChatStore } from '@/store/chatStore';
import SafeAreaWrapper from '@/components/SafeAreaWrapper';
import * as ImagePicker from 'expo-image-picker';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  headerSubtitle: {
    fontSize: 14,
  },
  content: {
    flex: 1,
  },
  messageList: {
    flexGrow: 1,
    padding: 16,
  },
  messageItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
  },
  messageText: {
    fontSize: 16,
  },
  messageTime: {
    fontSize: 12,
    marginTop: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  input: {
    flex: 1,
    marginHorizontal: 12,
    padding: 8,
    borderRadius: 20,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
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
  image: {
    width: 200,
    height: 200,
    borderRadius: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
  },
  loadingMore: {
    padding: 16,
  },
});

export const ChatScreen = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const { colors, isDark } = useTheme();
  const [newMessage, setNewMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);

  const {
    messages,
    chatPartner,
    loading,
    loadingMore,
    hasMoreData,
    isAttaching,
    loadMessages,
    sendMessage,
    uploadImage,
    setChatPartner,
    reset
  } = useChatStore();

  useEffect(() => {
    if (!user) {
      setError('Please sign in to access chat');
      return;
    }
    if (!id) {
      setError('Invalid chat ID');
      return;
    }

    const loadChatPartner = async () => {
      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        if (!profile) throw new Error('Chat partner not found');
        
        setChatPartner(profile);
      } catch (error) {
        console.error('Error loading chat partner:', error);
        setError(error instanceof Error ? error.message : 'Failed to load chat partner');
      }
    };

    const setupChat = async () => {
      try {
        await loadChatPartner();
        await loadMessages(user.id, id as string, true);
      } catch (error) {
        console.error('Error setting up chat:', error);
        setError(error instanceof Error ? error.message : 'Failed to load chat');
      }
    };

    setupChat();

    const subscription = supabase
      .channel(`chat:${id}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'messages',
        filter: `(sender_id=eq.${user.id} AND receiver_id=eq.${id}) OR (sender_id=eq.${id} AND receiver_id=eq.${user.id})`,
      }, async (payload) => {
        if (payload.eventType === 'INSERT') {
          try {
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

            if (msgError) throw msgError;
            if (!msgData) throw new Error('Message not found');

            const newMessage = {
              id: msgData.id,
              sender_id: msgData.sender_id,
              receiver_id: msgData.receiver_id,
              content: msgData.content,
              created_at: msgData.created_at,
              read: msgData.read,
              type: msgData.type || 'text',
              status: msgData.status || 'sent',
              sender: {
                id: msgData.sender.id,
                username: msgData.sender.username || 'Unknown User',
                avatar_url: msgData.sender.avatar_url
              }
            };

            useChatStore.getState().addMessage(newMessage);

            if (msgData.receiver_id === user.id && !msgData.read) {
              await supabase
                .from('messages')
                .update({ read: true })
                .eq('id', msgData.id);
            }
          } catch (error) {
            console.error('Error processing new message:', error);
          }
        }
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
      reset();
    };
  }, [user?.id, id]);

  const handleImagePick = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsEditing: true,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        const publicUrl = await uploadImage(imageUri);
        await sendMessage(publicUrl, 'image');
      }
    } catch (error) {
      console.error('Error picking image:', error);
    }
  };

  const handleCamera = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        alert('Sorry, we need camera permissions to make this work!');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsEditing: true,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        const publicUrl = await uploadImage(imageUri);
        await sendMessage(publicUrl, 'image');
      }
    } catch (error) {
      console.error('Error using camera:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    await sendMessage(newMessage);
    setNewMessage('');
  };

  const keyExtractor = useCallback((item: Message) => item.id.toString(), []);

  const renderMessageItem = useCallback(({ item }: { item: Message }) => (
    <MessageItem
      item={item}
      isSent={item.sender_id === user?.id}
      colors={colors}
      isDark={isDark}
      formatTime={(timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }}
    />
  ), [colors, isDark, user?.id]);

  const renderSeparator = useCallback(() => <View style={{ height: 8 }} />, []);

  const renderEmpty = useCallback(() => (
    <View style={styles.emptyContainer}>
      <Text style={[styles.emptyText, { color: colors.text }]}>
        No messages yet. Start the conversation!
      </Text>
    </View>
  ), [colors.text]);

  const renderFooter = useCallback(() => (
    loadingMore ? (
      <View style={styles.loadingMore}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    ) : null
  ), [loadingMore, colors.primary]);

  const handleEndReached = useCallback(() => {
    if (!loadingMore && hasMoreData && user?.id) {
      loadMessages(user.id, id as string);
    }
  }, [loadingMore, hasMoreData, user?.id, id]);

  const screenStyle = useMemo(() => ({
    ...styles.container,
    backgroundColor: colors.background,
  }), [colors]);

  const headerStyle = useMemo(() => ({
    ...styles.header,
    backgroundColor: colors.card,
  }), [colors]);

  const inputStyle = useMemo(() => ({
    ...styles.input,
    backgroundColor: colors.card,
    color: colors.text,
  }), [colors]);

  if (error) {
    return (
      <SafeAreaWrapper>
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          <View style={styles.errorContainer}>
            <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
            <TouchableOpacity
              style={[styles.errorButton, { backgroundColor: colors.primary }]}
              onPress={() => router.back()}
            >
              <Text style={styles.errorButtonText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaWrapper>
    );
  }

  if (loading) {
    return (
      <SafeAreaWrapper>
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          <ActivityIndicator size="large" color={colors.primary} />
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
            <ArrowLeft size={24} color={colors.text} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>
              {chatPartner?.display_name || chatPartner?.username || 'Chat'}
            </Text>
            <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
              {chatPartner?.username}
            </Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.actionButton} activeOpacity={0.7}>
              <Phone size={20} color={colors.text} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} activeOpacity={0.7}>
              <Video size={20} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.content}>
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessageItem}
            keyExtractor={keyExtractor}
            ItemSeparatorComponent={renderSeparator}
            ListEmptyComponent={renderEmpty}
            ListFooterComponent={renderFooter}
            contentContainerStyle={styles.messageList}
            onEndReached={handleEndReached}
            onEndReachedThreshold={0.2}
            maintainVisibleContentPosition={{
              minIndexForVisible: 0,
              autoscrollToTopThreshold: 10,
            }}
          />
        </View>

        <View style={styles.inputContainer}>
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: colors.card }]}
            onPress={handleCamera}
            activeOpacity={0.7}
          >
            <Camera size={20} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: colors.card }]}
            onPress={handleImagePick}
            activeOpacity={0.7}
          >
            <ImageIcon size={20} color={colors.text} />
          </TouchableOpacity>
          <TextInput
            style={inputStyle}
            value={newMessage}
            onChangeText={setNewMessage}
            placeholder="Type a message..."
            placeholderTextColor={colors.textSecondary}
            multiline
          />
          <TouchableOpacity
            style={[styles.sendButton, { opacity: newMessage.trim() ? 1 : 0.5 }]}
            onPress={handleSendMessage}
            disabled={!newMessage.trim() || isAttaching}
            activeOpacity={0.7}
          >
            <Send size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaWrapper>
  );
}; 