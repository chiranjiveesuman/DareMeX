export interface Message {
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
    avatar_url: string;
  };
}

export interface Conversation {
  conversation_id: string;
  user_id: string;
  username: string;
  avatar_url: string;
  last_message: string;
  last_message_at: string;
  last_sender_id: string;
  unread_count: number;
} 