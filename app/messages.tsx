import React, { useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import SafeAreaWrapper from '@/components/SafeAreaWrapper';
import { formatDistanceToNow } from 'date-fns';
import { useMessagesStore } from '@/store/messagesStore'; // Import the Zustand store
import { ChatUser } from '@/types'; // Assuming you have a types file

export default function MessagesScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { colors } = useTheme();
  const { loading, error, chatUsers, loadChatUsers, setChatUsers } = useMessagesStore();

  useEffect(() => {
    if (user?.id) {
      loadChatUsers(user.id);

      const subscription = supabase
        .channel('messages_channel')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `sender_id=eq.${user.id} OR receiver_id=eq.${user.id}`,
        }, () => {
          loadChatUsers(user.id);
        })
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [user?.id, loadChatUsers]);

  const handleChatPress = (userId: string) => {
    router.push(`/chat/${userId}`);
  };

  const renderItem = ({ item }: { item: ChatUser }) => (
    <TouchableOpacity
      style={[styles.chatItem, { backgroundColor: colors.card }]}
      onPress={() => handleChatPress(item.id)}
      activeOpacity={0.7}
    >
      <Image
        source={item.avatar_url ? { uri: item.avatar_url } : require('@/assets/default-avatar.png')}
        style={styles.avatar}
      />
      <View style={styles.chatInfo}>
        <View style={styles.chatHeader}>
          <Text style={[styles.username, { color: colors.text }]}>
            {item.display_name || item.username}
          </Text>
          {item.last_message_time && (
            <Text style={[styles.time, { color: colors.textSecondary }]}>
              {formatDistanceToNow(new Date(item.last_message_time), { addSuffix: true })}
            </Text>
          )}
        </View>
        {item.last_message && (
          <Text
            style={[styles.lastMessage, { color: colors.textSecondary }]}
            numberOfLines={1}
          >
            {item.last_message}
          </Text>
        )}
      </View>
      {item.unread_count ? (
        <View style={[styles.badge, { backgroundColor: colors.primary }]}>
          <Text style={styles.badgeText}>{item.unread_count}</Text>
        </View>
      ) : null}
    </TouchableOpacity>
  );

  if (error) {
    return (
      <SafeAreaWrapper>
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          <Text style={[styles.error, { color: colors.error }]}>{error}</Text>
        </View>
      </SafeAreaWrapper>
    );
  }

  return (
    <SafeAreaWrapper>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} />
        ) : chatUsers.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No messages yet
            </Text>
          </View>
        ) : (
          <FlatList
            data={chatUsers}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
            ItemSeparatorComponent={() => (
              <View style={[styles.separator, { backgroundColor: colors.border }]} />
            )}
          />
        )}
      </View>
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    flexGrow: 1,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
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
    fontSize: 16,
    fontWeight: '600',
  },
  time: {
    fontSize: 12,
  },
  lastMessage: {
    fontSize: 14,
  },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  separator: {
    height: StyleSheet.hairlineWidth,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
  },
  error: {
    fontSize: 16,
    textAlign: 'center',
    margin: 16,
  },
});