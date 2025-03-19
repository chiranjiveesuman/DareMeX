-- First ensure the profiles table exists and has the correct structure
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Drop existing foreign key constraints
ALTER TABLE IF EXISTS messages
DROP CONSTRAINT IF EXISTS messages_sender_id_fkey,
DROP CONSTRAINT IF EXISTS messages_receiver_id_fkey;

ALTER TABLE IF EXISTS friends
DROP CONSTRAINT IF EXISTS friends_sender_id_fkey,
DROP CONSTRAINT IF EXISTS friends_receiver_id_fkey;

-- Add correct foreign key relationships for messages table
ALTER TABLE messages
ADD CONSTRAINT messages_sender_id_fkey
FOREIGN KEY (sender_id)
REFERENCES profiles(id)
ON DELETE CASCADE;

ALTER TABLE messages
ADD CONSTRAINT messages_receiver_id_fkey
FOREIGN KEY (receiver_id)
REFERENCES profiles(id)
ON DELETE CASCADE;

-- Add correct foreign key relationships for friends table
ALTER TABLE friends
ADD CONSTRAINT friends_sender_id_fkey
FOREIGN KEY (sender_id)
REFERENCES profiles(id)
ON DELETE CASCADE;

ALTER TABLE friends
ADD CONSTRAINT friends_receiver_id_fkey
FOREIGN KEY (receiver_id)
REFERENCES profiles(id)
ON DELETE CASCADE;

-- Create or replace function to get chat messages with profiles
CREATE OR REPLACE FUNCTION get_chat_messages(current_user_id UUID)
RETURNS TABLE (
    message_id UUID,
    content TEXT,
    created_at TIMESTAMPTZ,
    sender_id UUID,
    sender_username TEXT,
    sender_avatar TEXT,
    is_read BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        m.id as message_id,
        m.content,
        m.created_at,
        p.id as sender_id,
        p.username as sender_username,
        p.avatar_url as sender_avatar,
        m.read as is_read
    FROM messages m
    JOIN profiles p ON m.sender_id = p.id
    WHERE m.receiver_id = current_user_id
    ORDER BY m.created_at DESC;
END;
$$ LANGUAGE plpgsql; 