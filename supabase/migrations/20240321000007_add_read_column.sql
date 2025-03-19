-- Add read column to messages table
ALTER TABLE messages ADD COLUMN IF NOT EXISTS read BOOLEAN DEFAULT FALSE;

-- Create index for read column to optimize unread count queries
CREATE INDEX IF NOT EXISTS idx_messages_read ON messages(read); 