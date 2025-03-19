-- Add status and type columns to messages table
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'sent' 
CHECK (status IN ('sent', 'delivered', 'read')),
ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'text' 
CHECK (type IN ('text', 'image', 'video', 'file'));

-- Create an index on the status column for performance
CREATE INDEX IF NOT EXISTS idx_messages_status ON messages(status);

-- Update existing messages with default values
UPDATE messages 
SET 
  status = 'sent' WHERE status IS NULL,
  type = 'text' WHERE type IS NULL; 