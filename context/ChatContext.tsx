
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { supabase } from '@/supabase/config';
import { useAuth } from './AuthContext';
import { Message, Conversation } from '@/types';

interface ChatContextType {
  messages: Message[];
  conversations: Conversation[];
  sendMessage: (receiverId: string, content: string) => Promise<void>;
  loadMessages: (partnerId: string) => Promise<void>;
  loadConversations: () => Promise<void>;
  unreadCount: number;
  markAsRead: (userId: string) => Promise<void>;
  clearCache: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const currentChatPartner = useRef<string | null>(null);

  // Load messages for a specific chat
  const loadMessages = async (partnerId: string) => {
    if (!user) return;
    currentChatPartner.current = partnerId;
    
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${user.id})`)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      if (data) {
        setMessages(data);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  // Send a new message
  const sendMessage = async (receiverId: string, content: string) => {
    if (!user) return;

    try {
      const newMessage = {
        sender_id: user.id,
        receiver_id: receiverId,
        content: content,
        created_at: new Date().toISOString(),
        read: false
      };

      const { data, error } = await supabase
        .from('messages')
        .insert(newMessage)
        .select('*, sender:profiles!messages_sender_id_fkey(*)')
        .single();

      if (error) throw error;

      if (data) {
        // Add the message immediately for better UX
        setMessages(prev => [data, ...prev]);
        // Update conversation list with new message
        await loadConversations();
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // Update conversations list with new message
  const updateConversationWithNewMessage = (message: Message) => {
    setConversations(prev => {
      const existing = prev.find(conv => 
        conv.user_id === message.sender_id || conv.user_id === message.receiver_id
      );

      if (existing) {
        return prev.map(conv => {
          if (conv.user_id === message.sender_id || conv.user_id === message.receiver_id) {
            return {
              ...conv,
              last_message: message.content,
              last_message_at: message.created_at,
              unread_count: conv.user_id === message.sender_id ? conv.unread_count + 1 : conv.unread_count
            };
          }
          return conv;
        });
      }
      return prev;
    });
  };

  // Subscribe to new messages
  useEffect(() => {
    if (!user) return;

    const subscription = supabase
      .channel('messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `or(sender_id.eq.${user.id},receiver_id.eq.${user.id})`
      }, async (payload) => {
        const newMessage = payload.new as Message;
        
        // Only update messages if we're in the relevant chat
        if (currentChatPartner.current === newMessage.sender_id || 
            currentChatPartner.current === newMessage.receiver_id) {
          // Fetch the complete message with sender profile
          const { data: messageWithProfile } = await supabase
            .from('messages')
            .select('*, sender:profiles!messages_sender_id_fkey(*)')
            .eq('id', newMessage.id)
            .single();

          if (messageWithProfile) {
            setMessages(prev => {
              const exists = prev.some(msg => msg.id === messageWithProfile.id);
              if (!exists) {
                return [messageWithProfile, ...prev];
              }
              return prev;
            });
          }
        }
        
        // Refresh conversations list to show latest message
        await loadConversations();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  // Load conversations
  const loadConversations = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .rpc('get_chat_previews', {
          current_user_id: user.id
        });

      if (error) throw error;

      if (data) {
        setConversations(data);
        const total = data.reduce((sum, conv) => sum + (conv.unread_count || 0), 0);
        setUnreadCount(total);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  };

  // Mark messages as read
  const markAsRead = async (userId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('messages')
        .update({ read: true })
        .match({ sender_id: userId, receiver_id: user.id });

      if (error) throw error;

      setMessages(prev => 
        prev.map(msg => 
          msg.sender_id === userId && msg.receiver_id === user.id 
            ? { ...msg, read: true } 
            : msg
        )
      );

      // Update unread count in conversations
      setConversations(prev =>
        prev.map(conv =>
          conv.user_id === userId
            ? { ...conv, unread_count: 0 }
            : conv
        )
      );
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const clearCache = () => {
    setMessages([]);
    setConversations([]);
    currentChatPartner.current = null;
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
