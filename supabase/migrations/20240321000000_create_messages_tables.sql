-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL,
  receiver_id UUID NOT NULL,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create friends table
CREATE TABLE IF NOT EXISTS friends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL,
  receiver_id UUID NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(sender_id, receiver_id)
);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_messages_updated_at
  BEFORE UPDATE ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_friends_updated_at
  BEFORE UPDATE ON friends
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX idx_friends_sender_id ON friends(sender_id);
CREATE INDEX idx_friends_receiver_id ON friends(receiver_id);

-- Create function to get chat previews
CREATE OR REPLACE FUNCTION get_chat_previews(current_user_id UUID)
RETURNS TABLE (
  user_id UUID,
  username TEXT,
  avatar_url TEXT,
  last_message TEXT,
  last_message_time TIMESTAMPTZ,
  unread_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  WITH latest_messages AS (
    SELECT DISTINCT ON (
      CASE 
        WHEN sender_id = current_user_id THEN receiver_id
        ELSE sender_id
      END
    )
      CASE 
        WHEN sender_id = current_user_id THEN receiver_id
        ELSE sender_id
      END as chat_user_id,
      content as last_message,
      created_at as last_message_time,
      id as message_id
    FROM messages
    WHERE sender_id = current_user_id OR receiver_id = current_user_id
    ORDER BY chat_user_id, created_at DESC
  ),
  unread_counts AS (
    SELECT 
      sender_id,
      COUNT(*) as unread_count
    FROM messages
    WHERE receiver_id = current_user_id AND read = false
    GROUP BY sender_id
  )
  SELECT 
    p.id as user_id,
    p.username,
    p.avatar_url,
    lm.last_message,
    lm.last_message_time,
    COALESCE(uc.unread_count, 0) as unread_count
  FROM latest_messages lm
  JOIN profiles p ON p.id = lm.chat_user_id
  LEFT JOIN unread_counts uc ON uc.sender_id = lm.chat_user_id
  ORDER BY lm.last_message_time DESC;
END;
$$ LANGUAGE plpgsql; 