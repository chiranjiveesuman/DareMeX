import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/supabase/config';
import { useAuth } from './AuthContext';
import { RealtimeChannel } from '@supabase/supabase-js';

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
  const channelRef = useRef<RealtimeChannel | null>(null);
  const activeUserIdRef = useRef<string | null>(null);

  const cleanupSubscription = useCallback(() => {
    if (channelRef.current) {
      console.log('Cleaning up subscription');
      channelRef.current.unsubscribe();
      channelRef.current = null;
    }
  }, []);

  const setupMessageSubscription = useCallback(() => {
    if (!user) return;

    // Don't create a new subscription if we already have one
    if (channelRef.current) return;

    console.log('Setting up new subscription');
    const channel = supabase.channel('chat')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `receiver_id=eq.${user.id}`,
      }, async (payload) => {
        console.log('New message received:', payload);
        if (payload.new) {
          setMessages(prev => [...prev, payload.new as Message]);
          loadUnreadCount();
        }
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'messages',
        filter: `receiver_id=eq.${user.id}`,
      }, (payload) => {
        console.log('Message updated:', payload);
        if (payload.new) {
          setMessages(prev =>
            prev.map(msg =>
              msg.id === payload.new.id ? { ...msg, ...payload.new } : msg
            )
          );
        }
      });

    channel.subscribe((status) => {
      console.log(`Subscription status: ${status}`);
    });

    channelRef.current = channel;
  }, [user]);

  // Set up subscription when user changes
  useEffect(() => {
    setupMessageSubscription();
    return () => cleanupSubscription();
  }, [user, setupMessageSubscription, cleanupSubscription]);

  const loadUnreadCount = useCallback(async () => {
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
  }, [user]);

  const loadMessages = useCallback(async (userId: string) => {
    if (!user) return;

    try {
      activeUserIdRef.current = userId;

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
  }, [user, markAsRead]);

  const sendMessage = useCallback(async (receiverId: string, content: string) => {
    if (!user) return;

    try {
      const { data: insertedMessage, error: insertError } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          receiver_id: receiverId,
          content,
          read: false,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      if (insertedMessage) {
        setMessages(prev => [...prev, insertedMessage]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }, [user]);

  const markAsRead = useCallback(async (messageIds: string[]) => {
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
  }, [user, loadUnreadCount]);

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