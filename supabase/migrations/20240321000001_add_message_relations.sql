-- Add foreign key relationships for messages table
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

-- Add foreign key relationships for friends table
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