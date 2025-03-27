-- Drop existing foreign key constraints if they exist
ALTER TABLE IF EXISTS messages DROP CONSTRAINT IF EXISTS messages_sender_id_fkey;
ALTER TABLE IF EXISTS messages DROP CONSTRAINT IF EXISTS messages_receiver_id_fkey;

-- Add new foreign key constraints with explicit names
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

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_messages_sender_receiver ON messages(sender_id, receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);

-- Add column for other_user_id to optimize queries
ALTER TABLE messages ADD COLUMN IF NOT EXISTS other_user_id UUID;
UPDATE messages 
SET other_user_id = 
  CASE 
    WHEN sender_id = auth.uid() THEN receiver_id
    ELSE sender_id
  END; 