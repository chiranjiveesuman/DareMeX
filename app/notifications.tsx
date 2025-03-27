import React, { useEffect, useState, useCallback, memo, useMemo, useRef } from 'react';
import { View, Text, Pressable, FlatList, StyleSheet, Image, useColorScheme, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Check, X, UserPlus, MessageCircle, Bell, ArrowLeft } from 'lucide-react-native';
import { supabase } from '@/supabase/config';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import SafeAreaWrapper from '@/components/SafeAreaWrapper';
import Ionicons from '@expo/vector-icons/Ionicons';

interface Sender {
  id: string;
  username: string;
  avatar_url?: string;
}

interface FriendRequestResponse {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  sender: Sender;
}

interface Notification {
  id: string;
  user_id: string;
  sender_id: string;
  type: 'message' | 'dare' | 'dare_response' | 'dare_complete' | 'dare_vote' | 'dare_comment' | 'dare_like' | 'dare_share' | 'dare_report' | 'dare_delete' | 'dare_update' | 'dare_create' | 'dare_accept' | 'dare_reject' | 'dare_expire';
  content: string;
  created_at: string;
  read: boolean;
  dare_id?: string;
  sender: Sender;
}

interface Profile {
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

// Constants for layout calculations
const ITEM_HEIGHT = 80;
const SEPARATOR_HEIGHT = 8;
const PAGE_SIZE = 15;

// Add this near the top of the file, after imports
const NOTIFICATION_BADGE_COLOR = '#FF3B30';
const MESSAGE_BADGE_COLOR = '#007AFF';

// Add these constants after the existing ones
const TABS = {
  NOTIFICATIONS: 'notifications',
  MESSAGES: 'messages'
} as const;

type TabType = typeof TABS[keyof typeof TABS];

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
  tabs: {
    flexDirection: 'row',
    padding: 16,
    gap: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
  content: {
    flex: 1,
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
    height: 200,
  },
  emptyText: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    textAlign: 'center',
  },
  listContainer: {
    padding: 16,
    flexGrow: 1,
  },
  separator: {
    height: SEPARATOR_HEIGHT,
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    height: ITEM_HEIGHT,
  },
  notificationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    height: ITEM_HEIGHT,
    borderWidth: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  contentContainer: {
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  timestamp: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
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
    backgroundColor: '#22C55E',
  },
  declineButton: {
    backgroundColor: '#EF4444',
  },
  loadingMore: {
    padding: 16,
    alignItems: 'center',
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    height: ITEM_HEIGHT,
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    marginBottom: 4,
  },
  notificationDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
  },
  notificationTime: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
  },
  friendRequestActions: {
    flexDirection: 'row',
    gap: 8,
    marginLeft: 8,
  },
  tabContainer: {
    flex: 1,
    flexDirection: 'row',
    borderRadius: 20,
    padding: 4,
    marginHorizontal: 16,
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  messageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
  },
  messageContent: {
    flex: 1,
    marginLeft: 12,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  messagePreview: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#007AFF',
    marginLeft: 8,
  },
});

// Simplified avatar component to reduce render complexity
const Avatar = memo(({ uri, style }: { uri: string; style: any }) => (
  <Image 
    source={{ uri }} 
    style={style} 
  />
));

// Memoized item separator
const ItemSeparator = memo(() => <View style={styles.separator} />);

// Memoized empty component
const EmptyComponent = memo(({ message, textColor }: { message: string; textColor: string }) => (
  <View style={styles.emptyContainer}>
    <Text style={[styles.emptyText, { color: textColor }]}>{message}</Text>
  </View>
));

// Memoized footer component for pagination loading
const ListFooterComponent = memo(({ loading, textColor }: { loading: boolean; textColor: string }) => {
  if (!loading) return null;
  return (
    <View style={styles.loadingMore}>
      <ActivityIndicator size="small" color={textColor} />
    </View>
  );
});

// Memoized notification item with simplified props
const NotificationItem = memo(({ item, onPress, onRespond, colors, isDark, formatTime }: {
  item: Notification | FriendRequestResponse;
  onPress: () => void;
  onRespond: (id: string, accept: boolean) => void;
  colors: any;
  isDark: boolean;
  formatTime: (timestamp: string) => string;
}) => {
  const isFriendRequest = 'status' in item;
  const sender = isFriendRequest ? item.sender : (item as Notification).sender;
  const content = isFriendRequest ? 'sent you a friend request' : (item as Notification).content;

  const containerStyle = useMemo(() => ({
    ...styles.notificationItem,
    backgroundColor: colors?.background?.card?.[isDark ? 'dark' : 'light'],
  }), [colors?.background?.card, isDark]);

  const textStyle = useMemo(() => ({
    ...styles.username,
    color: colors?.text?.primary?.[isDark ? 'dark' : 'light'],
  }), [colors?.text?.primary, isDark]);

  const subTextStyle = useMemo(() => ({
    ...styles.message,
    color: colors?.text?.secondary?.[isDark ? 'dark' : 'light'],
  }), [colors?.text?.secondary, isDark]);

  const avatarUri = useMemo(() => 
    sender?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(sender?.username || 'User')}`,
  [sender?.avatar_url, sender?.username]);

  const formattedTime = useMemo(() => formatTime(item.created_at), [formatTime, item.created_at]);

  return (
    <Pressable style={containerStyle} onPress={onPress}>
      <Avatar uri={avatarUri} style={styles.avatar} />
      <View style={styles.contentContainer}>
        <Text style={[styles.username, textStyle]} numberOfLines={1}>{sender?.username}</Text>
        <Text style={[styles.message, subTextStyle]} numberOfLines={1}>{content}</Text>
        <Text style={[styles.timestamp, subTextStyle]}>{formattedTime}</Text>
      </View>
      {isFriendRequest && (
        <View style={styles.friendRequestActions}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#34C759' }]}
            onPress={() => onRespond(item.id, true)}
            activeOpacity={0.7}
          >
            <Ionicons name="checkmark" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#FF3B30' }]}
            onPress={() => onRespond(item.id, false)}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      )}
    </Pressable>
  );
}, (prev, next) => {
  return (
    prev.item.id === next.item.id &&
    prev.isDark === next.isDark &&
    prev.item.created_at === next.item.created_at
  );
});

// Update the FlatList props type
type ListItem = FriendRequestResponse | Notification | Message;

export default memo(function NotificationsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { colors, isDark } = useTheme();
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMoreData, setHasMoreData] = useState(true);
  const [page, setPage] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequestResponse[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>(TABS.NOTIFICATIONS);

  const notificationsRef = useRef(notifications);
  const pageRef = useRef(page);

  // Update refs when state changes
  useEffect(() => {
    notificationsRef.current = notifications;
    pageRef.current = page;
  }, [friendRequests, notifications, page]);

  // Initial data load
  useEffect(() => {
    if (!user) {
      router.replace('/auth');
      return;
    }
    loadData(true);
    const subscriptions = subscribeToUpdates();
    return () => {
      subscriptions.forEach(subscription => subscription.unsubscribe());
    };
  }, [user]);

  useEffect(() => {
    if (!user) return;
    
    const loadMessages = async () => {
      try {
        const { data: messageData, error: messageError } = await supabase
          .from('messages')
          .select(`
            *,
            sender:profiles (
              id,
              username,
              avatar_url
            )
          `)
          .eq('receiver_id', user.id)
          .order('created_at', { ascending: false })
          .limit(PAGE_SIZE);

        if (messageError) throw messageError;

        if (messageData) {
          const processedMessages = messageData.map(msg => ({
            id: msg.id,
            sender_id: msg.sender_id,
            receiver_id: msg.receiver_id,
            content: msg.content,
            created_at: msg.created_at,
            read: msg.read,
            sender: {
              id: msg.sender.id,
              username: msg.sender.username || 'Unknown User',
              avatar_url: msg.sender.avatar_url
            }
          }));
          setMessages(processedMessages);
        }
      } catch (error) {
        console.error('Error loading messages:', error);
      }
    };

    loadMessages();
  }, [user?.id]);

  useEffect(() => {
    if (!user) return;

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

              setMessages(current => [newMessage, ...current]);
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

  const loadData = async (reset = false) => {
    if (!user || loadingMore) return;
    
    try {
      if (reset) {
        setLoading(true);
        setPage(0);
      } else {
        setLoadingMore(true);
      }
      
      const currentPage = reset ? 0 : page;
      
      // Load friend requests with explicit join
      const { data: friendRequests, error: friendError } = await supabase
        .from('friends')
        .select(`
          *,
          sender:profiles (
            id,
            username,
            avatar_url
          )
        `)
        .eq('receiver_id', user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (friendError) throw friendError;

      // Load notifications with explicit join
      const { data: notifications, error: notificationError } = await supabase
        .from('notifications')
        .select(`
          *,
          sender:profiles (
            id,
            username,
            avatar_url
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(PAGE_SIZE);

      if (notificationError) throw notificationError;

      // Process friend requests
      const processedFriendRequests: FriendRequestResponse[] = friendRequests.map((request: any) => ({
        id: request.id,
        sender_id: request.sender_id,
        receiver_id: request.receiver_id,
        status: request.status,
        created_at: request.created_at,
        sender: {
          id: request.sender.id,
          username: request.sender.username || 'Unknown User',
          avatar_url: request.sender.avatar_url
        }
      }));

      // Process notifications
      const processedNotifications: Notification[] = notifications.map((notif: any) => ({
        id: notif.id,
        user_id: notif.user_id,
        sender_id: notif.sender_id,
        type: notif.type,
        content: notif.content,
        created_at: notif.created_at,
        read: notif.read,
        dare_id: notif.dare_id,
        sender: {
          id: notif.sender.id,
          username: notif.sender.username || 'Unknown User',
          avatar_url: notif.sender.avatar_url
        }
      }));

      setFriendRequests(prev => reset ? processedFriendRequests : [...prev, ...processedFriendRequests]);
      setNotifications(prev => reset ? processedNotifications : [...prev, ...processedNotifications]);
      setHasMoreData(notifications.length === PAGE_SIZE);
      
      if (!reset) {
        setPage(currentPage + 1);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const subscribeToUpdates = () => {
    if (!user) return [];

    const subscriptions = [];

    // Update notification subscription
    const notificationSubscription = supabase
      .channel('notifications')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${user.id}`,
      }, async (payload: { eventType: string; new: any }) => {
        if (payload.eventType === 'INSERT') {
          try {
            const { data: notifData, error: notifError } = await supabase
              .from('notifications')
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

            if (notifError) throw notifError;

            if (notifData && notifData.sender) {
              const newNotification: Notification = {
                id: notifData.id,
                user_id: notifData.user_id,
                sender_id: notifData.sender_id,
                type: notifData.type,
                content: notifData.content,
                created_at: notifData.created_at,
                read: notifData.read,
                dare_id: notifData.dare_id,
                sender: {
                  id: notifData.sender.id,
                  username: notifData.sender.username || 'Unknown User',
                  avatar_url: notifData.sender.avatar_url
                }
              };

              setNotifications(current => [newNotification, ...current]);
            }
          } catch (error) {
            console.error('Error processing notification:', error);
          }
        }
      })
      .subscribe();

    subscriptions.push(notificationSubscription);

    // Update friend request subscription
    const friendRequestSubscription = supabase
      .channel('friend_requests')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'friends',
        filter: `receiver_id=eq.${user.id}`,
      }, async (payload: { eventType: string; new: any }) => {
        if (payload.eventType === 'INSERT') {
          try {
            const { data: requestData, error: requestError } = await supabase
              .from('friends')
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

            if (requestError) throw requestError;

            if (requestData && requestData.sender) {
              const newRequest: FriendRequestResponse = {
                id: requestData.id,
                sender_id: requestData.sender_id,
                receiver_id: requestData.receiver_id,
                status: requestData.status,
                created_at: requestData.created_at,
                sender: {
                  id: requestData.sender.id,
                  username: requestData.sender.username || 'Unknown User',
                  avatar_url: requestData.sender.avatar_url
                }
              };

              setFriendRequests(current => [newRequest, ...current]);
            }
          } catch (error) {
            console.error('Error processing friend request:', error);
          }
        }
      })
      .subscribe();

    subscriptions.push(friendRequestSubscription);

    // Subscribe to messages
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

              setMessages(current => [newMessage, ...current]);
            }
          } catch (error) {
            console.error('Error processing new message:', error);
          }
        }
      })
      .subscribe();

    subscriptions.push(messageSubscription);

    return subscriptions;
  };

  const formatTime = useCallback((timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
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

  // Memoize the combined data array
  const listData = useMemo(() => [...friendRequests, ...notifications], [friendRequests, notifications]);

  // Memoized render functions
  const keyExtractor = useCallback((item: ListItem) => item.id, []);

  const getItemLayout = useCallback((data: ArrayLike<ListItem> | null | undefined, index: number) => ({
    length: ITEM_HEIGHT + SEPARATOR_HEIGHT,
    offset: (ITEM_HEIGHT + SEPARATOR_HEIGHT) * index,
    index,
  }), []);

  const renderNotificationItem = useCallback(({ item }: { item: Notification | FriendRequestResponse }) => {
    const isFriendRequest = 'status' in item;
    const notification = isFriendRequest ? null : item as Notification;
    
    const isMessage = notification?.type === 'message';
    const isDare = notification?.type === 'dare';
    const isDareResponse = notification?.type === 'dare_response';
    const isDareComplete = notification?.type === 'dare_complete';
    const isDareVote = notification?.type === 'dare_vote';
    const isDareComment = notification?.type === 'dare_comment';
    const isDareLike = notification?.type === 'dare_like';
    const isDareShare = notification?.type === 'dare_share';
    const isDareReport = notification?.type === 'dare_report';
    const isDareDelete = notification?.type === 'dare_delete';
    const isDareUpdate = notification?.type === 'dare_update';
    const isDareCreate = notification?.type === 'dare_create';
    const isDareAccept = notification?.type === 'dare_accept';
    const isDareReject = notification?.type === 'dare_reject';
    const isDareExpire = notification?.type === 'dare_expire';

    const getNotificationIcon = () => {
      if (isFriendRequest) {
        return 'person-add';
      } else if (isMessage) {
        return 'chatbubble';
      } else if (isDare) {
        return 'flame';
      } else if (isDareResponse) {
        return 'checkmark-circle';
      } else if (isDareComplete) {
        return 'trophy';
      } else if (isDareVote) {
        return 'thumbs-up';
      } else if (isDareComment) {
        return 'chatbubble-ellipses';
      } else if (isDareLike) {
        return 'heart';
      } else if (isDareShare) {
        return 'share';
      } else if (isDareReport) {
        return 'flag';
      } else if (isDareDelete) {
        return 'trash';
      } else if (isDareUpdate) {
        return 'pencil';
      } else if (isDareCreate) {
        return 'add-circle';
      } else if (isDareAccept) {
        return 'checkmark-circle';
      } else if (isDareReject) {
        return 'close-circle';
      } else if (isDareExpire) {
        return 'time';
      }
      return 'notifications';
    };

    const getNotificationColor = () => {
      if (isFriendRequest) {
        return NOTIFICATION_BADGE_COLOR;
      } else if (isMessage) {
        return MESSAGE_BADGE_COLOR;
      } else if (isDare) {
        return '#FF9500';
      } else if (isDareResponse) {
        return '#34C759';
      } else if (isDareComplete) {
        return '#FFD60A';
      } else if (isDareVote) {
        return '#FF2D55';
      } else if (isDareComment) {
        return '#5856D6';
      } else if (isDareLike) {
        return '#FF2D55';
      } else if (isDareShare) {
        return '#30B0C7';
      } else if (isDareReport) {
        return '#FF3B30';
      } else if (isDareDelete) {
        return '#FF3B30';
      } else if (isDareUpdate) {
        return '#007AFF';
      } else if (isDareCreate) {
        return '#34C759';
      } else if (isDareAccept) {
        return '#34C759';
      } else if (isDareReject) {
        return '#FF3B30';
      } else if (isDareExpire) {
        return '#8E8E93';
      }
      return '#007AFF';
    };

    const getNotificationTitle = () => {
      if (isFriendRequest) {
        return 'New Friend Request';
      } else if (isMessage) {
        return 'New Message';
      } else if (isDare) {
        return 'New Dare';
      } else if (isDareResponse) {
        return 'Dare Response';
      } else if (isDareComplete) {
        return 'Dare Completed';
      } else if (isDareVote) {
        return 'Dare Voted';
      } else if (isDareComment) {
        return 'Dare Commented';
      } else if (isDareLike) {
        return 'Dare Liked';
      } else if (isDareShare) {
        return 'Dare Shared';
      } else if (isDareReport) {
        return 'Dare Reported';
      } else if (isDareDelete) {
        return 'Dare Deleted';
      } else if (isDareUpdate) {
        return 'Dare Updated';
      } else if (isDareCreate) {
        return 'Dare Created';
      } else if (isDareAccept) {
        return 'Dare Accepted';
      } else if (isDareReject) {
        return 'Dare Rejected';
      } else if (isDareExpire) {
        return 'Dare Expired';
      }
      return 'Notification';
    };

    const getNotificationDescription = () => {
      if (isFriendRequest) {
        return `${item.sender.username} sent you a friend request`;
      } else if (notification) {
        return `${notification.sender.username} ${getNotificationTitle().toLowerCase()}`;
      }
      return 'New notification';
    };

    const handlePress = () => {
      if (isFriendRequest) {
        router.push(`/profile/${item.sender.id}`);
      } else if (notification) {
        if (isMessage) {
          router.push(`/chat/${notification.sender.id}`);
        } else if (notification.dare_id) {
          router.push(`/dare/${notification.dare_id}`);
        }
      }
    };

    const handleRespond = async (id: string, accept: boolean) => {
      try {
        const { error } = await supabase
          .from('friends')
          .update({ status: accept ? 'accepted' : 'rejected' })
          .eq('id', id);

        if (error) throw error;
        setFriendRequests(current => current.filter(request => request.id !== id));
      } catch (error) {
        console.error('Error responding to friend request:', error);
      }
    };

    return (
      <NotificationItem
        item={item}
        onPress={handlePress}
        onRespond={handleRespond}
        colors={colors}
        isDark={isDark}
        formatTime={formatTime}
      />
    );
  }, [colors, isDark, router, formatTime]);

  const renderSeparator = useCallback(() => <ItemSeparator />, []);

  const renderEmpty = useCallback(() => (
    <EmptyComponent
      message="No notifications yet"
      textColor={colors?.text?.primary?.[isDark ? 'dark' : 'light']}
    />
  ), [colors?.text?.primary, isDark]);
  
  const renderFooter = useCallback(() => (
    <ListFooterComponent 
      loading={loadingMore} 
      textColor={colors?.primary ?? '#2563EB'} 
    />
  ), [loadingMore, colors?.primary]);

  const handleEndReached = useCallback(() => {
    if (!loadingMore && hasMoreData) {
      loadData();
    }
  }, [loadingMore, hasMoreData]);

  // Update the flatListProps definition
  const flatListProps = useMemo(() => ({
    keyExtractor: (item: ListItem) => item.id,
    ItemSeparatorComponent: renderSeparator,
    ListEmptyComponent: renderEmpty,
    ListFooterComponent: renderFooter,
    contentContainerStyle: styles.listContainer,
    removeClippedSubviews: true,
    maxToRenderPerBatch: 3,
    updateCellsBatchingPeriod: 100,
    initialNumToRender: 5,
    windowSize: 2,
    getItemLayout: (data: ArrayLike<ListItem> | null | undefined, index: number) => ({
      length: ITEM_HEIGHT + SEPARATOR_HEIGHT,
      offset: (ITEM_HEIGHT + SEPARATOR_HEIGHT) * index,
      index,
    }),
    showsVerticalScrollIndicator: false,
    onEndReached: handleEndReached,
    onEndReachedThreshold: 0.5,
    maintainVisibleContentPosition: {
      minIndexForVisible: 0,
    },
  }), [
    renderSeparator,
    renderEmpty,
    renderFooter,
    handleEndReached,
  ]);

  const renderMessageItem = useCallback(({ item }: { item: Message }) => {
    const handlePress = () => {
      router.push(`/chat/${item.sender.id}`);
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
  }, [colors, isDark, router, formatTime]);

  // Add memoized styles that depend on colors and isDark
  const tabContainerStyle = useMemo(() => ({
    ...styles.tabContainer,
    backgroundColor: colors?.background?.card?.[isDark ? 'dark' : 'light'],
  }), [colors?.background?.card, isDark]);

  const activeTabStyle = useMemo(() => ({
    backgroundColor: colors?.primary || '#007AFF',
  }), [colors?.primary]);

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
          <View style={tabContainerStyle}>
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === TABS.NOTIFICATIONS && activeTabStyle
              ]}
              onPress={() => setActiveTab(TABS.NOTIFICATIONS)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: colors?.text?.primary?.[isDark ? 'dark' : 'light'] },
                  activeTab === TABS.NOTIFICATIONS && styles.activeTabText
                ]}
              >
              Notifications
            </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === TABS.MESSAGES && activeTabStyle
              ]}
              onPress={() => setActiveTab(TABS.MESSAGES)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: colors?.text?.primary?.[isDark ? 'dark' : 'light'] },
                  activeTab === TABS.MESSAGES && styles.activeTabText
                ]}
              >
              Messages
            </Text>
            </TouchableOpacity>
        </View>
      </View>

        <View style={styles.content}>
              <FlatList
            {...flatListProps}
            data={activeTab === TABS.NOTIFICATIONS ? listData : messages}
            renderItem={({ item }) => {
              if (activeTab === TABS.NOTIFICATIONS) {
                return renderNotificationItem({ item: item as (Notification | FriendRequestResponse) });
              } else {
                return renderMessageItem({ item: item as Message });
              }
            }}
            ListEmptyComponent={
              <EmptyComponent
                message={activeTab === TABS.NOTIFICATIONS ? "No notifications yet" : "No messages yet"}
                textColor={colors?.text?.primary?.[isDark ? 'dark' : 'light']}
              />
            }
          />
    </View>
      </View>
    </SafeAreaWrapper>
  );
}, (prev: any, next: any) => {
  // Only re-render when user or theme changes
  return prev.user?.id === next.user?.id && prev.isDark === next.isDark;
});
