import React, { useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  useColorScheme,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { MessageCircle } from 'lucide-react-native';
import { useChat } from '@/context/ChatContext';
import { useAuth } from '@/context/AuthContext';
import { Conversation } from '@/types';
import { colors } from '@/styles/globalStyles';
import formatDistanceToNow from 'date-fns/formatDistanceToNow';
import { format, isToday, isYesterday, isThisWeek, isThisYear } from 'date-fns';

const defaultAvatar = require('@/assets/default-avatar.png');

export default function ChatListScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { conversations, loadConversations, markAsRead } = useChat();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  useEffect(() => {
    // Load conversations when screen mounts
    loadConversations();
  }, []);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    
    if (isToday(date)) {
      return format(date, 'h:mm a');
    } else if (isYesterday(date)) {
      return 'Yesterday';
    } else if (isThisWeek(date)) {
      return format(date, 'EEEE'); // Day name
    } else if (isThisYear(date)) {
      return format(date, 'MMM d'); // Month and day
    } else {
      return format(date, 'MM/dd/yyyy');
    }
  };

  const handleChatPress = (conversation: Conversation) => {
    // Navigate to chat screen
    router.push(`/chat/${conversation.user_id}`);
  };

  const renderItem = ({ item }: { item: Conversation }) => (
    <Pressable
      style={styles.chatItem}
      onPress={() => handleChatPress(item)}
    >
      <Image
        source={
          item.avatar_url
            ? { uri: item.avatar_url }
            : defaultAvatar
        }
        style={styles.avatar}
        contentFit="cover"
        transition={200}
      />
      <View style={styles.chatInfo}>
        <View style={styles.chatHeader}>
          <Text style={styles.username}>{item.username}</Text>
          <Text style={styles.time}>{formatTime(item.last_message_at)}</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={[
            styles.lastMessage, 
            item.unread_count > 0 && styles.unreadMessage
          ]} numberOfLines={1}>
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
  );

  const renderContent = () => {
    if (conversations.length === 0) {
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
        data={conversations}
        keyExtractor={item => item.conversation_id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
  },
  listContent: {
    flexGrow: 1,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
    backgroundColor: 'white',
  },
  headerTitle: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 32,
    color: '#333',
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
    backgroundColor: 'white',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 16,
    backgroundColor: '#e1e1e1',
  },
  chatInfo: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  username: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 16,
    color: '#333',
  },
  time: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#888',
  },
  lastMessage: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#666',
    marginRight: 8,
    flex: 1,
  },
  unreadMessage: {
    fontFamily: 'Inter-SemiBold',
    color: '#333',
  },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadCount: {
    fontFamily: 'Inter-Bold',
    fontSize: 12,
    color: 'white',
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
    color: '#333',
    textAlign: 'center',
    marginTop: 16,
  },
  emptyText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 