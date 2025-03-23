import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { supabase } from '@/supabase/config';
import { useAuth } from './AuthContext';
import { Message, Conversation } from '@/types';

// Message interface matching the database function return type
interface Message {
  id: string;
  content: string;
  created_at: string;
  sender_id: string;
  receiver_id: string;
  read: boolean;
  sender_username?: string;
  sender_avatar_url?: string;
}

// Add a type for cached conversations
interface MessageCache {
  [key: string]: {
    messages: Message[];
    lastUpdated: number;
  };
}

interface ConversationCache {
  conversations: Conversation[];
  lastUpdated: number;
}

interface ChatContextType {
  messages: Message[];
  conversations: Conversation[];
  sendMessage: (receiverId: string, content: string) => Promise<void>;
  loadMessages: (messages: Message[]) => void;
  loadConversations: () => Promise<void>;
  unreadCount: number;
  markAsRead: (userId: string) => Promise<void>;
  clearCache: () => void;
}

const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes in milliseconds

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const messageCache = useRef<MessageCache>({});
  const conversationsCache = useRef<ConversationCache | null>(null);
  const currentChatPartner = useRef<string | null>(null);

  // Load messages
  const loadMessages = (newMessages: Message[]) => {
    setMessages(newMessages);
  };

  // Send a new message
  const sendMessage = async (receiverId: string, content: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          receiver_id: receiverId,
          content: content,
        })
        .select('*')
        .single();

      if (error) throw error;

      if (data) {
        // Add the new message to the state
        setMessages(prev => [...prev, data]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  };

  // Mark messages as read
  const markAsRead = async (userId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .rpc('mark_conversation_as_read', {
          p_other_user_id: userId,
          p_user_id: user.id
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  // Load conversations for chat list
  const loadConversations = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase.rpc('get_recent_conversations', { p_user_id: user.id });

      if (error) {
        console.error('Error loading conversations:', error);
        return;
      }

      setConversations(data || []);
      console.log(`Loaded ${data?.length || 0} conversations`);
    } catch (err) {
      console.error('Unexpected error loading conversations:', err);
    }
  };

  // Load unread count from conversations table
  const loadUnreadCount = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .rpc('get_recent_conversations', { p_user_id: user.id });

      if (error) {
        console.error('Error loading unread count:', error);
        return;
      }
      
      // Calculate total unread count from all conversations
      const total = data?.reduce((sum: number, conv: Conversation) => sum + (conv.unread_count || 0), 0) || 0;
      setUnreadCount(total);
      console.log(`Total unread messages: ${total}`);
    } catch (error) {
      console.error('Unexpected error loading unread count:', error);
    }
  };

  // Clear cache
  const clearCache = () => {
    messageCache.current = {};
    conversationsCache.current = null;
    console.log('Cache cleared');
  };

  const value = {
    messages,
    conversations,
    sendMessage,
    loadMessages,
    loadConversations,
    unreadCount,
    markAsRead,
    clearCache,
  };

  return (
    <ChatContext.Provider value={value}>
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