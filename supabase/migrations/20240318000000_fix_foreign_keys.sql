-- Add foreign key relationships for messages table
ALTER TABLE messages
ADD CONSTRAINT fk_sender_profile
FOREIGN KEY (sender_id)
REFERENCES profiles(id)
ON DELETE CASCADE;

-- Add foreign key relationships for notifications table
ALTER TABLE notifications
ADD CONSTRAINT fk_sender_profile
FOREIGN KEY (sender_id)
REFERENCES profiles(id)
ON DELETE CASCADE;

-- Add foreign key relationships for friends table
ALTER TABLE friends
ADD CONSTRAINT fk_sender_profile
FOREIGN KEY (sender_id)
REFERENCES profiles(id)
ON DELETE CASCADE; 