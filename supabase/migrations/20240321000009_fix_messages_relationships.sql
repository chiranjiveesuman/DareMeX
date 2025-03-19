-- Add foreign key constraints to messages table
ALTER TABLE messages 
ADD CONSTRAINT fk_messages_sender 
FOREIGN KEY (sender_id) 
REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE messages 
ADD CONSTRAINT fk_messages_receiver 
FOREIGN KEY (receiver_id) 
REFERENCES profiles(id) ON DELETE CASCADE;

-- Create indexes for performance
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_receiver ON messages(receiver_id);
CREATE INDEX idx_messages_conversation ON messages(sender_id, receiver_id);
CREATE INDEX idx_messages_read ON messages(read); 