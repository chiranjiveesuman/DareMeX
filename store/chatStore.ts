import { create } from 'zustand';
import { supabase } from '@/supabase/config';

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
    id: string;
    username: string;
    display_name?: string;
    avatar_url?: string;
  };
}

interface Profile {
  id: string;
  username: string;
  display_name?: string;
  avatar_url?: string;
}

interface ChatState {
  messages: Message[];
  chatPartner: Profile | null;
  loading: boolean;
  loadingMore: boolean;
  hasMoreData: boolean;
  page: number;
  isAttaching: boolean;
  error: string | null;
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  setChatPartner: (partner: Profile | null) => void;
  setLoading: (loading: boolean) => void;
  setLoadingMore: (loading: boolean) => void;
  setHasMoreData: (hasMore: boolean) => void;
  setPage: (page: number) => void;
  setIsAttaching: (isAttaching: boolean) => void;
  setError: (error: string | null) => void;
  loadMessages: (userId: string, partnerId: string, reset?: boolean) => Promise<void>;
  sendMessage: (content: string, type?: 'text' | 'image') => Promise<void>;
  uploadImage: (uri: string) => Promise<string>;
  reset: () => void;
}

const PAGE_SIZE = 20;

const initialState = {
  messages: [],
  chatPartner: null,
  loading: false,
  loadingMore: false,
  hasMoreData: true,
  page: 0,
  isAttaching: false,
  error: null,
};

export const useChatStore = create<ChatState>((set, get) => ({
  ...initialState,

  setMessages: (messages) => set({ messages }),
  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
  setChatPartner: (partner) => set({ chatPartner: partner }),
  setLoading: (loading) => set({ loading }),
  setLoadingMore: (loading) => set({ loadingMore }),
  setHasMoreData: (hasMore) => set({ hasMoreData }),
  setPage: (page) => set({ page }),
  setIsAttaching: (isAttaching) => set({ isAttaching }),
  setError: (error) => set({ error }),
  reset: () => set(initialState),

  loadMessages: async (userId: string, partnerId: string, reset: boolean = false) => {
    const state = get();
    if (!userId || !partnerId || (state.loadingMore && !reset)) return;

    try {
      if (reset) {
        set({ loading: true, page: 0, messages: [], error: null });
      } else {
        set({ loadingMore: true, error: null });
      }

      const currentPage = reset ? 0 : state.page;

      const { data: messageData, error: messageError } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey (
            id,
            username,
            display_name,
            avatar_url
          )
        `)
        .or(`and(sender_id.eq.${userId},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${userId})`)
        .order('created_at', { ascending: true })
        .range(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE - 1);

      if (messageError) throw messageError;

      if (messageData) {
        const processedMessages = messageData.map(msg => ({
          id: msg.id,
          sender_id: msg.sender_id,
          receiver_id: msg.receiver_id,
          content: msg.content,
          created_at: msg.created_at,
          read: msg.read,
          type: msg.type || 'text',
          status: msg.status || 'sent',
          sender: {
            id: msg.sender.id,
            username: msg.sender.username || 'Unknown User',
            display_name: msg.sender.display_name,
            avatar_url: msg.sender.avatar_url
          }
        }));

        set((state) => ({
          messages: reset ? processedMessages : [...state.messages, ...processedMessages],
          hasMoreData: messageData.length === PAGE_SIZE,
          page: currentPage + 1,
          loading: false,
          loadingMore: false,
          error: null
        }));

        // Mark received messages as read
        const unreadMessages = messageData
          .filter(msg => msg.receiver_id === userId && !msg.read)
          .map(msg => msg.id);

        if (unreadMessages.length > 0) {
          await supabase
            .from('messages')
            .update({ read: true })
            .in('id', unreadMessages);
        }
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      set({ 
        loading: false, 
        loadingMore: false,
        error: error instanceof Error ? error.message : 'Failed to load messages'
      });
    }
  },

  sendMessage: async (content: string, type: 'text' | 'image' = 'text') => {
    const state = get();
    if (!content.trim() || !state.chatPartner) return;

    try {
      set({ error: null });
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('User not authenticated');

      const newMessage = {
        sender_id: userData.user.id,
        receiver_id: state.chatPartner.id,
        content,
        type,
        created_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('messages')
        .insert(newMessage)
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey (
            id,
            username,
            display_name,
            avatar_url
          )
        `)
        .single();

      if (error) throw error;

      if (data) {
        const processedMessage = {
          id: data.id,
          sender_id: data.sender_id,
          receiver_id: data.receiver_id,
          content: data.content,
          created_at: data.created_at,
          read: data.read,
          type: data.type || 'text',
          status: data.status || 'sent',
          sender: {
            id: data.sender.id,
            username: data.sender.username || 'Unknown User',
            display_name: data.sender.display_name,
            avatar_url: data.sender.avatar_url
          }
        };

        set((state) => ({
          messages: [...state.messages, processedMessage]
        }));
      }
    } catch (error) {
      console.error('Error sending message:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to send message' });
    }
  },

  uploadImage: async (uri: string) => {
    try {
      set({ isAttaching: true, error: null });
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('User not authenticated');

      const response = await fetch(uri);
      const blob = await response.blob();
      const filename = `${userData.user.id}/${Date.now()}.jpg`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('chat-images')
        .upload(filename, blob);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('chat-images')
        .getPublicUrl(filename);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to upload image' });
      throw error;
    } finally {
      set({ isAttaching: false });
    }
  }
})); 