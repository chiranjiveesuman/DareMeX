import React, { useState, useEffect, useRef } from 'react';
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
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Send, ChevronLeft } from 'lucide-react-native';
import { useChat } from '@/context/ChatContext';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/supabase/config';
import { colors } from '@/styles/globalStyles';

interface Profile {
  username: string;
  avatar_url?: string;
}

export default function ChatScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const { messages, sendMessage, loadMessages } = useChat();
  const [newMessage, setNewMessage] = useState('');
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const flatListRef = useRef<FlatList>(null);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  useEffect(() => {
    loadChatData();
    const subscription = subscribeToMessages();
    return () => {
      subscription?.unsubscribe();
    };
  }, [id]);

  const loadChatData = async () => {
    if (!id || !user) return;

    try {
      setLoading(true);
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
    } catch (error) {
      console.error('Error loading chat data:', error);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToMessages = () => {
    if (!id || !user) return;

    return supabase
      .channel('chat_messages')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'messages',
        filter: `or(and(sender_id.eq.${user.id},receiver_id.eq.${id}),and(sender_id.eq.${id},receiver_id.eq.${user.id}))`,
      }, () => {
        loadMessages(id as string);
      })
      .subscribe();
  };

  const handleSend = async () => {
    if (!newMessage.trim() || !id) return;

    await sendMessage(id as string, newMessage.trim());
    setNewMessage('');
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? colors.background.dark : colors.background.light,
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
      flex: 1,
      padding: 16,
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
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      borderTopWidth: 1,
      borderTopColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
      backgroundColor: isDark ? colors.background.card.dark : colors.background.card.light,
    },
    input: {
      flex: 1,
      height: 40,
      marginRight: 12,
      paddingHorizontal: 16,
      borderRadius: 20,
      backgroundColor: isDark ? colors.background.dark : colors.background.light,
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

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading chat...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
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

        <FlatList
          ref={flatListRef}
          data={[...messages].reverse()}
          renderItem={({ item }) => (
            <View
              style={[
                styles.messageContainer,
                item.sender_id === user?.id ? styles.sentMessage : styles.receivedMessage,
              ]}
            >
              <Text
                style={[
                  styles.messageText,
                  item.sender_id !== user?.id && styles.receivedMessageText,
                ]}
              >
                {item.content}
              </Text>
              <Text style={styles.timeText}>{formatTime(item.created_at)}</Text>
            </View>
          )}
          keyExtractor={item => item.id}
          inverted
          contentContainerStyle={styles.messageList}
        />

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={newMessage}
            onChangeText={setNewMessage}
            placeholder="Type a message..."
            placeholderTextColor={isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'}
            multiline
          />
          <Pressable style={styles.sendButton} onPress={handleSend}>
            <Send size={20} color="#FFFFFF" />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
} 