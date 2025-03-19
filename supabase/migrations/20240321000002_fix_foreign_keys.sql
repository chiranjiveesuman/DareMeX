-- Drop existing foreign key constraints if they exist
ALTER TABLE IF EXISTS friends
DROP CONSTRAINT IF EXISTS friends_sender_id_fkey,
DROP CONSTRAINT IF EXISTS friends_receiver_id_fkey;

-- Drop existing foreign key constraints if they exist for messages
ALTER TABLE IF EXISTS messages
DROP CONSTRAINT IF EXISTS messages_sender_id_fkey,
DROP CONSTRAINT IF EXISTS messages_receiver_id_fkey;

-- Add foreign key relationships for friends table with correct references
ALTER TABLE friends
ADD CONSTRAINT friends_sender_id_fkey
FOREIGN KEY (sender_id)
REFERENCES auth.users(id)
ON DELETE CASCADE;

ALTER TABLE friends
ADD CONSTRAINT friends_receiver_id_fkey
FOREIGN KEY (receiver_id)
REFERENCES auth.users(id)
ON DELETE CASCADE;

-- Add foreign key relationships for messages table with correct references
ALTER TABLE messages
ADD CONSTRAINT messages_sender_id_fkey
FOREIGN KEY (sender_id)
REFERENCES auth.users(id)
ON DELETE CASCADE;

ALTER TABLE messages
ADD CONSTRAINT messages_receiver_id_fkey
FOREIGN KEY (receiver_id)
REFERENCES auth.users(id)
ON DELETE CASCADE;

-- Create or replace the function to get user profile with messages
CREATE OR REPLACE FUNCTION get_profile_with_messages(profile_id UUID)
RETURNS TABLE (
    id UUID,
    username TEXT,
    avatar_url TEXT,
    last_message TEXT,
    last_message_time TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.username,
        p.avatar_url,
        m.content as last_message,
        m.created_at as last_message_time
    FROM profiles p
    LEFT JOIN LATERAL (
        SELECT content, created_at
        FROM messages
        WHERE (sender_id = profile_id OR receiver_id = profile_id)
        ORDER BY created_at DESC
        LIMIT 1
    ) m ON true
    WHERE p.id = profile_id;
END;
$$ LANGUAGE plpgsql; 