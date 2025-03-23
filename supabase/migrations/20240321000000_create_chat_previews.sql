-- Create a function to get chat previews
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
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public; 