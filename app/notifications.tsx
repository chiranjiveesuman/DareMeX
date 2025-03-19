import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, FlatList, StyleSheet, Image, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { Check, X, UserPlus, MessageCircle, Bell } from 'lucide-react-native';
import { supabase } from '@/supabase/config';
import { useAuth } from '@/context/AuthContext';
import { colors } from '@/styles/globalStyles';

interface FriendRequestResponse {
  id: string;
  sender_id: string;
  receiver_id: string;
  created_at: string;
  sender: {
    username: string;
    avatar_url?: string;
  };
}

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

interface Notification {
  id: string;
  type: 'comment' | 'like' | 'dare';
  user_id: string;
  content: string;
  created_at: string;
  user: {
    username: string;
    avatar_url?: string;
  };
}

export default function NotificationsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [activeTab, setActiveTab] = useState<'notifications' | 'messages'>('notifications');
  const [friendRequests, setFriendRequests] = useState<FriendRequestResponse[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
    const subscriptions = subscribeToUpdates();
    return () => {
      subscriptions.forEach(subscription => subscription?.unsubscribe());
    };
  }, [activeTab, user?.id]);

  const loadData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      if (activeTab === 'notifications') {
        // Load friend requests - use separate query for profiles
        const { data: requestData, error: requestError } = await supabase
          .from('friends')
          .select('*')
          .eq('receiver_id', user.id)
          .eq('status', 'pending')
          .order('created_at', { ascending: false });

        if (requestError) throw requestError;
        
        // Get sender profiles for friend requests
        if (requestData && requestData.length > 0) {
          const senderIds = requestData.map(request => request.sender_id);
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id, username, avatar_url')
            .in('id', senderIds);
          
          // Combine data
          const requestsWithProfiles = requestData.map(request => {
            const sender = profiles?.find(p => p.id === request.sender_id);
            return {
              ...request,
              sender: sender ? { username: sender.username, avatar_url: sender.avatar_url } : undefined
            };
          });
          
          setFriendRequests(requestsWithProfiles);
        } else {
          setFriendRequests([]);
        }

        // Load other notifications - use separate query for profiles
        const { data: notifData, error: notifError } = await supabase
          .from('notifications')
          .select('*')
          .eq('receiver_id', user.id)
          .order('created_at', { ascending: false });

        if (notifError) throw notifError;
        
        // Get user profiles for notifications
        if (notifData && notifData.length > 0) {
          const userIds = notifData.map(notif => notif.user_id);
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id, username, avatar_url')
            .in('id', userIds);
          
          // Combine data
          const notificationsWithProfiles = notifData.map(notif => {
            const user = profiles?.find(p => p.id === notif.user_id);
            return {
              ...notif,
              user: user ? { username: user.username, avatar_url: user.avatar_url } : undefined
            };
          });
          
          setNotifications(notificationsWithProfiles);
        } else {
          setNotifications([]);
        }
      } else {
        // Load messages - use separate query for sender profiles
        const { data: messageData, error: messageError } = await supabase
          .from('messages')
          .select('*')
          .eq('receiver_id', user.id)
          .eq('read', false)
          .order('created_at', { ascending: false });

        if (messageError) throw messageError;
        
        // Get sender profiles
        if (messageData && messageData.length > 0) {
          const senderIds = messageData.map(msg => msg.sender_id);
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id, username, avatar_url')
            .in('id', senderIds);
          
          // Combine data
          const messagesWithProfiles = messageData.map(msg => {
            const sender = profiles?.find(p => p.id === msg.sender_id);
            return {
              ...msg,
              sender: sender ? { username: sender.username, avatar_url: sender.avatar_url } : undefined
            };
          });
          
          setMessages(messagesWithProfiles);
        } else {
          setMessages([]);
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToUpdates = () => {
    if (!user) return [];

    const subscriptions = [];

    // Subscribe to messages
    const messageSubscription = supabase
      .channel('messages')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'messages',
        filter: `receiver_id=eq.${user.id}`,
      }, async (payload) => {
        if (payload.eventType === 'INSERT') {
          // Get the message
          const { data: message, error } = await supabase
            .from('messages')
            .select('*')
            .eq('id', payload.new.id)
            .single();

          if (!error && message) {
            // Get sender profile
            const { data: profile } = await supabase
              .from('profiles')
              .select('username, avatar_url')
              .eq('id', message.sender_id)
              .single();
            
            const messageWithProfile = {
              ...message,
              sender: profile ? { 
                username: profile.username, 
                avatar_url: profile.avatar_url 
              } : undefined
            };
            
            // Add to messages list only if we're in messages tab
            if (activeTab === 'messages') {
              setMessages(prev => [messageWithProfile, ...prev]);
            }
          }
        }
      })
      .subscribe();

    subscriptions.push(messageSubscription);

    // Rest of the subscription handlers remain the same
    const notificationSubscription = supabase
      .channel('notifications')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'notifications',
        filter: `receiver_id=eq.${user.id}`,
      }, () => {
        if (activeTab === 'notifications') {
          loadData();
        }
      })
      .subscribe();

    subscriptions.push(notificationSubscription);

    const friendRequestSubscription = supabase
      .channel('friend_requests')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'friends',
        filter: `receiver_id=eq.${user.id}`,
      }, () => {
        if (activeTab === 'notifications') {
          loadData();
        }
      })
      .subscribe();

    subscriptions.push(friendRequestSubscription);

    return subscriptions;
  };

  const formatTime = (timestamp: string) => {
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
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? colors.background.dark : colors.background.light,
    },
    header: {
      paddingHorizontal: 16,
      paddingTop: 60,
      paddingBottom: 16,
      backgroundColor: isDark ? colors.background.card.dark : colors.background.card.light,
    },
    headerTitle: {
      fontFamily: 'SpaceGrotesk-Bold',
      fontSize: 32,
      color: isDark ? colors.text.dark : colors.text.light,
      marginBottom: 16,
    },
    tabs: {
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderBottomColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
    },
    tab: {
      flex: 1,
      paddingVertical: 12,
      alignItems: 'center',
    },
    activeTab: {
      borderBottomWidth: 2,
      borderBottomColor: colors.primary,
    },
    tabText: {
      fontFamily: 'SpaceGrotesk-Medium',
      fontSize: 16,
      color: isDark ? colors.text.dark : colors.text.light,
    },
    activeTabText: {
      color: colors.primary,
    },
    centerContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 16,
      gap: 8,
    },
    loadingText: {
      fontFamily: 'Inter-Regular',
      fontSize: 16,
      color: isDark ? colors.text.dark : colors.text.light,
    },
    emptyText: {
      fontFamily: 'SpaceGrotesk-Bold',
      fontSize: 20,
      color: isDark ? colors.text.dark : colors.text.light,
      textAlign: 'center',
      marginTop: 16,
    },
    emptySubtext: {
      fontFamily: 'Inter-Regular',
      fontSize: 16,
      color: isDark ? colors.subtext.dark : colors.subtext.light,
      textAlign: 'center',
    },
    item: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      backgroundColor: isDark ? colors.background.card.dark : colors.background.card.light,
      marginHorizontal: 16,
      marginVertical: 4,
      borderRadius: 12,
    },
    avatar: {
      width: 50,
      height: 50,
      borderRadius: 25,
      borderWidth: 2,
      borderColor: colors.primary,
    },
    content: {
      flex: 1,
      marginLeft: 12,
    },
    username: {
      fontFamily: 'SpaceGrotesk-Bold',
      fontSize: 16,
      color: isDark ? colors.text.dark : colors.text.light,
    },
    message: {
      fontFamily: 'Inter-Regular',
      fontSize: 14,
      color: isDark ? colors.subtext.dark : colors.subtext.light,
      marginTop: 2,
    },
    time: {
      fontFamily: 'Inter-Regular',
      fontSize: 12,
      color: isDark ? colors.subtext.dark : colors.subtext.light,
      marginTop: 2,
    },
    actions: {
      flexDirection: 'row',
      gap: 8,
      marginLeft: 8,
    },
    actionButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
    },
    acceptButton: {
      backgroundColor: colors.success,
    },
    declineButton: {
      backgroundColor: colors.error,
    },
  });

  const renderNotificationItem = ({ item }: { item: Notification | FriendRequestResponse }) => {
    if ('sender' in item) {
      // Friend request
  return (
        <View style={styles.item}>
          <Pressable 
            style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}
            onPress={() => router.push(`/profile/${item.sender_id}`)}
          >
            <Image
              source={{
                uri: item.sender.avatar_url || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&auto=format&fit=crop',
              }}
              style={styles.avatar}
            />
            <View style={styles.content}>
              <Text style={styles.username}>{item.sender.username}</Text>
              <Text style={styles.message}>sent you a friend request</Text>
              <Text style={styles.time}>{formatTime(item.created_at)}</Text>
            </View>
          </Pressable>
          <View style={styles.actions}>
        <Pressable 
              style={[styles.actionButton, styles.acceptButton]}
              onPress={() => respondToRequest(item.id, true)}
        >
              <Check size={20} color="#FFFFFF" />
        </Pressable>
            <Pressable
              style={[styles.actionButton, styles.declineButton]}
              onPress={() => respondToRequest(item.id, false)}
            >
              <X size={20} color="#FFFFFF" />
            </Pressable>
            </View>
        </View>
      );
    } else {
      // Regular notification
      return (
        <Pressable 
          style={styles.item}
          onPress={() => {
            // Handle notification press based on type
            if (item.type === 'dare') {
              router.push(`/dare/${item.id}`);
            } else {
              router.push(`/profile/${item.user_id}`);
            }
          }}
        >
          <Image
            source={{
              uri: item.user.avatar_url || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&auto=format&fit=crop',
            }}
            style={styles.avatar}
          />
          <View style={styles.content}>
            <Text style={styles.username}>{item.user.username}</Text>
            <Text style={styles.message}>{item.content}</Text>
            <Text style={styles.time}>{formatTime(item.created_at)}</Text>
          </View>
        </Pressable>
      );
    }
  };

  const renderMessageItem = ({ item }: { item: Message }) => {
    // Determine message preview based on type, defaulting to text
    let messagePreview = item.content;
    if (item.type === 'image') {
      messagePreview = '📷 Image';
    } else if (item.type === 'video') {
      messagePreview = '🎥 Video';
    } else if (item.type === 'file') {
      messagePreview = '📎 File';
    }
    
    return (
      <Pressable 
        style={styles.item}
        onPress={() => router.push(`/chat/${item.sender_id}`)}
      >
        <Image
          source={{
            uri: item.sender.avatar_url || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&auto=format&fit=crop',
          }}
          style={styles.avatar}
        />
        <View style={styles.content}>
          <Text style={styles.username}>{item.sender.username}</Text>
          <Text style={styles.message} numberOfLines={2}>{messagePreview}</Text>
          <Text style={styles.time}>{formatTime(item.created_at)}</Text>
        </View>
      </Pressable>
    );
  };

  const respondToRequest = async (requestId: string, accept: boolean) => {
    try {
      const { error } = await supabase
        .from('friends')
        .update({ status: accept ? 'accepted' : 'rejected' })
        .eq('id', requestId);

      if (error) throw error;
      
      // Remove the request from the list
      setFriendRequests(current => 
        current.filter(request => request.id !== requestId)
      );
    } catch (error) {
      console.error('Error responding to friend request:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={styles.tabs}>
          <Pressable
            style={[styles.tab, activeTab === 'notifications' && styles.activeTab]}
            onPress={() => setActiveTab('notifications')}
          >
            <Text style={[styles.tabText, activeTab === 'notifications' && styles.activeTabText]}>
              Notifications
            </Text>
          </Pressable>
          <Pressable
            style={[styles.tab, activeTab === 'messages' && styles.activeTab]}
            onPress={() => setActiveTab('messages')}
          >
            <Text style={[styles.tabText, activeTab === 'messages' && styles.activeTabText]}>
              Messages
            </Text>
          </Pressable>
        </View>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      ) : (
        <>
          {activeTab === 'notifications' ? (
            friendRequests.length === 0 && notifications.length === 0 ? (
              <View style={styles.centerContainer}>
                <Bell size={48} color={isDark ? colors.subtext.dark : colors.subtext.light} />
                <Text style={styles.emptyText}>No new notifications</Text>
                <Text style={styles.emptySubtext}>
                  You'll see notifications about your dares and friend requests here
                </Text>
              </View>
            ) : (
              <FlatList
                data={[...friendRequests, ...notifications]}
                renderItem={renderNotificationItem}
                keyExtractor={item => item.id}
                contentContainerStyle={{ paddingVertical: 8 }}
                removeClippedSubviews={true}
                initialNumToRender={10}
                maxToRenderPerBatch={5}
                windowSize={5}
              />
            )
          ) : messages.length === 0 ? (
            <View style={styles.centerContainer}>
              <MessageCircle size={48} color={isDark ? colors.subtext.dark : colors.subtext.light} />
              <Text style={styles.emptyText}>No messages yet</Text>
              <Text style={styles.emptySubtext}>
                Start a conversation with your friends
              </Text>
            </View>
          ) : (
            <FlatList
              data={messages}
              renderItem={renderMessageItem}
              keyExtractor={item => item.id}
              contentContainerStyle={{ paddingVertical: 8 }}
              removeClippedSubviews={true}
              initialNumToRender={10}
              maxToRenderPerBatch={5}
              windowSize={5}
            />
          )}
        </>
      )}
    </View>
  );
}
