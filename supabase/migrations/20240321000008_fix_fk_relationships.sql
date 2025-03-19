-- First, alter the messages table to add the missing columns
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'text' CHECK (type IN ('text', 'image', 'video', 'file')),
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'read'));

-- Drop existing foreign key constraints if they exist (to avoid errors)
ALTER TABLE IF EXISTS messages 
DROP CONSTRAINT IF EXISTS messages_sender_id_fkey,
DROP CONSTRAINT IF EXISTS messages_receiver_id_fkey;

-- Create proper named foreign key constraints
ALTER TABLE messages
ADD CONSTRAINT fk_messages_sender FOREIGN KEY (sender_id) REFERENCES profiles(id) ON DELETE CASCADE,
ADD CONSTRAINT fk_messages_receiver FOREIGN KEY (receiver_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Do the same for friends table
ALTER TABLE IF EXISTS friends
DROP CONSTRAINT IF EXISTS friends_sender_id_fkey,
DROP CONSTRAINT IF EXISTS friends_receiver_id_fkey;

ALTER TABLE friends
ADD CONSTRAINT fk_sender_profile FOREIGN KEY (sender_id) REFERENCES profiles(id) ON DELETE CASCADE,
ADD CONSTRAINT fk_receiver_profile FOREIGN KEY (receiver_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- And for notifications table
ALTER TABLE IF EXISTS notifications
DROP CONSTRAINT IF EXISTS notifications_user_id_fkey,
DROP CONSTRAINT IF EXISTS notifications_receiver_id_fkey;

ALTER TABLE notifications
ADD CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE,
ADD CONSTRAINT fk_notifications_receiver FOREIGN KEY (receiver_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_messages_sender_receiver ON messages(sender_id, receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_messages_status ON messages(status); 