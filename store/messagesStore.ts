import { create } from 'zustand';
import { supabase } from '@/supabase/config';
import { ChatUser } from '@/types'; // Assuming you have a types file

interface MessagesState {
  loading: boolean;
  error: string | null;
  chatUsers: ChatUser[];
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setChatUsers: (chatUsers: ChatUser[]) => void;
  loadChatUsers: (userId: string | undefined) => Promise<void>;
}

export const useMessagesStore = create<MessagesState>((set) => ({
  loading: false,
  error: null,
  chatUsers: [],
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setChatUsers: (chatUsers) => set({ chatUsers }),
  loadChatUsers: async (userId) => {
    if (!userId) {
      set({ error: 'User not authenticated', loading: false });
      return;
    }
    set({ loading: true, error: null });
    try {
      // Fetch all messages where the current user is either sender or receiver
      const { data: messages, error: messagesError } = await supabase
        .from('messages')
        .select(`
          id,
          content,
          created_at,
          read,
          sender_id,
          receiver_id,
          sender:profiles!messages_sender_id_fkey (
            id,
            username,
            display_name,
            avatar_url
          ),
          receiver:profiles!messages_receiver_id_fkey (
            id,
            username,
            display_name,
            avatar_url
          )
        `)
        .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
        .order('created_at', { ascending: false });

      if (messagesError) throw messagesError;

      const uniqueChatUsersMap: Record<string, ChatUser> = {};

      for (const message of messages || []) {
        const otherUserId = message.sender_id === userId ? message.receiver_id : message.sender_id;
        const otherUser = message.sender_id === userId ? message.receiver : message.sender;

        if (otherUser) {
          const existingChatUser = uniqueChatUsersMap[otherUserId];

          const unread = message.receiver_id === userId && !message.read;

          if (!existingChatUser || new Date(message.created_at) > new Date(existingChatUser.last_message_time || '')) {
            uniqueChatUsersMap[otherUserId] = {
              id: otherUser.id,
              username: otherUser.username || 'Unknown User',
              display_name: otherUser.display_name,
              avatar_url: otherUser.avatar_url,
              last_message: message.content,
              last_message_time: message.created_at,
              unread_count: existingChatUser ? existingChatUser.unread_count + (unread ? 1 : 0) : unread ? 1 : 0,
            };
          } else if (unread && existingChatUser) {
            uniqueChatUsersMap[otherUserId] = {
              ...existingChatUser,
              unread_count: (existingChatUser.unread_count || 0) + 1,
            };
          }
        }
      }

      // Fetch unread counts in a single query
      const { data: unreadMessages, error: unreadError } = await supabase
        .from('messages')
        .select('sender_id')
        .eq('receiver_id', userId)
        .eq('read', false);

      if (unreadError) console.error('Error fetching unread messages:', unreadError);

      const unreadCounts: Record<string, number> = {};
      unreadMessages?.forEach((msg) => {
        unreadCounts[msg.sender_id] = (unreadCounts[msg.sender_id] || 0) + 1;
      });

      const finalChatUsers = Object.values(uniqueChatUsersMap).map((user) => ({
        ...user,
        unread_count: unreadCounts[user.id] || 0,
      })).sort((a, b) => new Date(b.last_message_time || '') - new Date(a.last_message_time || ''));


      set({ chatUsers: finalChatUsers, loading: false });
    } catch (error) {
      console.error('Error loading chat users:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to load messages', loading: false });
    }
  },
}));