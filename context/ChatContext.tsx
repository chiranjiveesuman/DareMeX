import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { supabase } from '@/supabase/config';
import { useAuth } from './AuthContext';
import { Message, Conversation } from '@/types';

// Update the Message interface to be more flexible
interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  read: boolean;
  type?: 'text' | 'image' | 'video' | 'file';
  status?: 'sent' | 'delivered' | 'read';
  sender?: {
    username: string;
    avatar_url?: string;
  };
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
  sendMessage: (receiverId: string, content: string, type?: 'text' | 'image' | 'video' | 'file') => Promise<Message | null>;
  loadMessages: (userId: string) => Promise<void>;
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

  // Subscribe to new messages
  useEffect(() => {
    if (!user) return;

    // First, load any unread messages
    loadUnreadCount();

    // Function to handle new messages
    const handleNewMessage = (payload: any) => {
      try {
        const newMessage = payload.new;
        if (!newMessage || !newMessage.id) return;
        
        const messageId = newMessage.id;
        console.log(`New message received with ID: ${messageId}`);

        // Check if we already have this message in our state (avoid duplicates)
        setMessages(prevMessages => {
          // Check if message already exists
          if (prevMessages.some(msg => msg.id === messageId)) {
            console.log(`Message ${messageId} already exists in state, skipping`);
            return prevMessages;
          }
          
          // If sender_id is current user, we already have the profile info
          let messageWithProfile = { ...newMessage };
          
          // If the new message involves the current chat partner, update message state
          const otherUserId = newMessage.sender_id === user.id ? newMessage.receiver_id : newMessage.sender_id;
          if (currentChatPartner.current === otherUserId) {
            console.log(`Adding new message ${messageId} to state`);
            
            // Create a new array to force React to detect the change
            const updatedMessages = [...prevMessages, messageWithProfile];
            
            // Update the cache for this conversation
            updateMessageCache(updatedMessages, user.id, otherUserId);
            
            return updatedMessages;
          }
          
          return prevMessages;
        });
        
        // Always update conversations since a new message affects the chat list
        loadConversations();
        
        // Update unread count
        loadUnreadCount();
      } catch (error) {
        console.error('Error handling new message:', error);
      }
    };

    // Function to handle conversation updates
    const handleConversationUpdate = (payload: any) => {
      console.log('Conversation update received');
      // Refresh conversations list when a conversation is updated
      loadConversations();
    };

    // Subscribe to message and conversation changes
    const messageSubscription = supabase
      .channel('public:messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `or(sender_id.eq.${user.id},receiver_id.eq.${user.id})`,
      }, handleNewMessage)
      .subscribe();

    const conversationSubscription = supabase
      .channel('public:conversations')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'conversations',
        filter: `or(user_1.eq.${user.id},user_2.eq.${user.id})`,
      }, handleConversationUpdate)
      .subscribe();

    console.log('Subscribed to message and conversation changes');

    return () => {
      console.log('Unsubscribing from message and conversation changes');
      messageSubscription.unsubscribe();
      conversationSubscription.unsubscribe();
    };
  }, [user]);

  // Helper function to update the message cache
  const updateMessageCache = (messages: Message[], userId: string, partnerId: string) => {
    const cacheKey = getCacheKey(userId, partnerId);
    messageCache.current[cacheKey] = {
      messages: messages.filter(msg => 
        (msg.sender_id === userId && msg.receiver_id === partnerId) || 
        (msg.sender_id === partnerId && msg.receiver_id === userId)
      ),
      lastUpdated: Date.now()
    };
    console.log(`Updated cache for chat ${cacheKey} with ${messageCache.current[cacheKey].messages.length} messages`);
  };

  // Helper to create a consistent cache key for a conversation
  const getCacheKey = (userId1: string, userId2: string) => {
    // Sort IDs to ensure the same key regardless of order
    return [userId1, userId2].sort().join('_');
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

  // Load messages for a specific chat
  const loadMessages = async (userId: string) => {
    if (!user) return;
    
    // Update current chat partner reference
    currentChatPartner.current = userId;
    
    // Create cache key for this conversation
    const cacheKey = getCacheKey(user.id, userId);
    const now = Date.now();
    
    // Mark messages as read when opening the chat
    await markAsRead(userId);
    
    console.log(`Loading messages between ${user.id} and ${userId}`);
    
    try {
      // Dynamically select columns to handle potential schema changes
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!inner(username, avatar_url)
        `)
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${userId}),and(sender_id.eq.${userId},receiver_id.eq.${user.id})`)
        .order('created_at', { ascending: true });
      
      if (messagesError) {
        console.error('Error loading messages:', messagesError);
        return;
      }
      
      console.log(`Loaded ${messagesData?.length || 0} messages from database`);
      
      // Ensure messages have a status and type, with fallback values
      const processedMessages = (messagesData || []).map(msg => ({
        ...msg,
        status: msg.status || 'sent',
        type: msg.type || 'text',
        read: msg.read ?? false
      }));
      
      // Update message state
      setMessages(processedMessages);
      
      // Store in cache
      messageCache.current[cacheKey] = {
        messages: processedMessages,
        lastUpdated: now
      };
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  // Send a message with optimistic UI updates
  const sendMessage = async (receiverId: string, content: string, type: 'text' | 'image' | 'video' | 'file' = 'text') => {
    if (!user) return null;

    try {
      console.log(`Sending message to ${receiverId}: ${content}`);
      
      // Get the sender profile for optimistic UI update
      const { data: senderProfile, error: profileError } = await supabase
        .from('profiles')
        .select('username, avatar_url')
        .eq('id', user.id)
        .single();
        
      if (profileError) {
        console.error('Error getting sender profile:', profileError);
        throw profileError;
      }
      
      // Create optimistic message for immediate UI update
      const optimisticMessage: Message = {
        id: `temp-${Date.now()}`,
        sender_id: user.id,
        receiver_id: receiverId,
        content,
        created_at: new Date().toISOString(),
        read: false,
        type,
        status: 'sent',
        sender: senderProfile ? {
          username: senderProfile.username,
          avatar_url: senderProfile.avatar_url
        } : undefined
      };
      
      // Update UI immediately with optimistic message
      console.log('Adding optimistic message to state');
      setMessages(prevMessages => [...prevMessages, optimisticMessage]);
      
      // Send the actual message to the database
      const { data: insertedMessage, error: insertError } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          receiver_id: receiverId,
          content,
          read: false,
          type: type || 'text',
          status: 'sent'
        })
        .select('*')
        .single();

      if (insertError) {
        console.error('Error inserting message:', insertError);
        
        // Remove optimistic message if there was an error
        setMessages(prevMessages => 
          prevMessages.filter(msg => msg.id !== optimisticMessage.id)
        );
        
        // If the error is due to missing columns, log additional details
        if (insertError.message.includes('Could not find the column')) {
          console.error('Potential schema mismatch. Please check your database migration.');
        }
        
        throw insertError;
      }
      
      console.log('Message successfully inserted with ID:', insertedMessage.id);
      
      // Replace optimistic message with real message
      const messageWithProfile = {
        ...insertedMessage,
        sender: senderProfile ? {
          username: senderProfile.username,
          avatar_url: senderProfile.avatar_url
        } : undefined
      };
      
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.id === optimisticMessage.id ? messageWithProfile : msg
        )
      );
      
      // Update the cache
      const cacheKey = getCacheKey(user.id, receiverId);
      if (messageCache.current[cacheKey]) {
        messageCache.current[cacheKey] = {
          messages: messageCache.current[cacheKey].messages.map(msg => 
            msg.id === optimisticMessage.id ? messageWithProfile : msg
          ),
          lastUpdated: Date.now()
        };
      }
      
      return messageWithProfile;
    } catch (error) {
      console.error('Error sending message:', error);
      return null;
    }
  };

  // Mark messages as read
  const markAsRead = async (userId: string) => {
    if (!user) return;
    
    try {
      // Use the database function to mark conversation as read
      const { error } = await supabase
        .rpc('mark_conversation_as_read', { 
          p_user_id: user.id,
          p_other_user_id: userId
        });
      
      if (error) throw error;
      
      console.log(`Marked messages from ${userId} as read`);
      
      // Update local state by marking messages as read
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.sender_id === userId && msg.receiver_id === user.id && msg.status !== 'read'
            ? { ...msg, status: 'read', read: true }
            : msg
        )
      );
      
      // Update cache
      const cacheKey = getCacheKey(user.id, userId);
      if (messageCache.current[cacheKey]) {
        messageCache.current[cacheKey] = {
          messages: messageCache.current[cacheKey].messages.map(msg => 
            msg.sender_id === userId && msg.receiver_id === user.id && msg.status !== 'read'
              ? { ...msg, status: 'read', read: true }
              : msg
          ),
          lastUpdated: Date.now()
        };
      }
      
      // Update unread count
      loadUnreadCount();
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  // Clear cache
  const clearCache = () => {
    messageCache.current = {};
    conversationsCache.current = null;
    console.log('Cache cleared');
  };

  return (
    <ChatContext.Provider value={{ 
      messages, 
      conversations,
      sendMessage, 
      loadMessages,
      loadConversations,
      unreadCount, 
      markAsRead, 
      clearCache 
    }}>
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