import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/supabase/config';
import { useAuth } from './AuthContext';

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  read: boolean;
}

interface ChatContextType {
  messages: Message[];
  sendMessage: (receiverId: string, content: string) => Promise<void>;
  loadMessages: (userId: string) => Promise<void>;
  unreadCount: number;
  markAsRead: (messageIds: string[]) => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;

    // Subscribe to new messages
    const subscription = supabase
      .channel('messages')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'messages',
        filter: `receiver_id=eq.${user.id}`,
      }, () => {
        loadUnreadCount();
      })
      .subscribe();

    loadUnreadCount();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  const loadUnreadCount = async () => {
    if (!user) return;

    try {
      const { count, error } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('receiver_id', user.id)
        .eq('read', false);

      if (error) throw error;
      setUnreadCount(count || 0);
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  };

  const loadMessages = async (userId: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${userId}),and(sender_id.eq.${userId},receiver_id.eq.${user.id})`)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);

      // Mark messages as read
      const unreadMessageIds = data
        ?.filter(msg => msg.receiver_id === user.id && !msg.read)
        .map(msg => msg.id) || [];

      if (unreadMessageIds.length > 0) {
        await markAsRead(unreadMessageIds);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const sendMessage = async (receiverId: string, content: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          receiver_id: receiverId,
          content,
          read: false,
        });

      if (error) throw error;

      // Reload messages to get the new one
      await loadMessages(receiverId);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const markAsRead = async (messageIds: string[]) => {
    if (!user || messageIds.length === 0) return;

    try {
      const { error } = await supabase
        .from('messages')
        .update({ read: true })
        .in('id', messageIds);

      if (error) throw error;
      await loadUnreadCount();
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  return (
    <ChatContext.Provider value={{ messages, sendMessage, loadMessages, unreadCount, markAsRead }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
} 