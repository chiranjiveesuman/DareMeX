-- Function to get recent conversations
CREATE OR REPLACE FUNCTION get_recent_conversations(p_user_id UUID)
RETURNS TABLE (
    conversation_id UUID,
    other_user_id UUID,
    username TEXT,
    avatar_url TEXT,
    last_message TEXT,
    last_message_time TIMESTAMPTZ,
    unread_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    WITH conversation_messages AS (
        SELECT 
            DISTINCT ON (
                CASE 
                    WHEN sender_id = p_user_id THEN receiver_id 
                    ELSE sender_id 
                END
            )
            id,
            CASE 
                WHEN sender_id = p_user_id THEN receiver_id 
                ELSE sender_id 
            END as other_user_id,
            content as last_message,
            created_at as last_message_time
        FROM messages
        WHERE sender_id = p_user_id OR receiver_id = p_user_id
        ORDER BY other_user_id, created_at DESC
    ),
    unread_counts AS (
        SELECT 
            sender_id,
            COUNT(*) as unread_count
        FROM messages
        WHERE receiver_id = p_user_id AND read = false
        GROUP BY sender_id
    )
    SELECT 
        cm.id as conversation_id,
        cm.other_user_id,
        p.username,
        p.avatar_url,
        cm.last_message,
        cm.last_message_time,
        COALESCE(uc.unread_count, 0) as unread_count
    FROM conversation_messages cm
    JOIN profiles p ON p.id = cm.other_user_id
    LEFT JOIN unread_counts uc ON uc.sender_id = cm.other_user_id
    ORDER BY cm.last_message_time DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public;

-- Function to mark conversation as read
CREATE OR REPLACE FUNCTION mark_conversation_as_read(p_other_user_id UUID, p_user_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE messages
    SET read = true
    WHERE receiver_id = p_user_id 
    AND sender_id = p_other_user_id
    AND read = false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public;

-- Function to get messages between two users
CREATE OR REPLACE FUNCTION get_messages_between_users(p_user_id UUID, p_other_user_id UUID)
RETURNS TABLE (
    id UUID,
    content TEXT,
    created_at TIMESTAMPTZ,
    sender_id UUID,
    receiver_id UUID,
    read BOOLEAN,
    sender_username TEXT,
    sender_avatar_url TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        m.id,
        m.content,
        m.created_at,
        m.sender_id,
        m.receiver_id,
        m.read,
        p.username as sender_username,
        p.avatar_url as sender_avatar_url
    FROM messages m
    JOIN profiles p ON p.id = m.sender_id
    WHERE (m.sender_id = p_user_id AND m.receiver_id = p_other_user_id)
    OR (m.sender_id = p_other_user_id AND m.receiver_id = p_user_id)
    ORDER BY m.created_at ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public; 