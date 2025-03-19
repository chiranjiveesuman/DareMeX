-- Drop the existing function
DROP FUNCTION IF EXISTS public.get_recent_conversations(UUID);

-- Create updated function to get recent conversations
CREATE OR REPLACE FUNCTION public.get_recent_conversations(p_user_id UUID)
RETURNS TABLE (
    conversation_id UUID,
    user_id UUID,
    username TEXT,
    avatar_url TEXT,
    last_message TEXT,
    last_message_type TEXT,
    last_message_status TEXT,
    last_message_at TIMESTAMPTZ,
    unread_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    WITH recent_messages AS (
        SELECT 
            CASE 
                WHEN sender_id = p_user_id THEN receiver_id
                ELSE sender_id
            END AS partner_id,
            MAX(created_at) AS last_message_time,
            MAX(content) AS last_message,
            MAX(type) AS last_message_type,
            MAX(status) AS last_message_status,
            COUNT(*) FILTER (WHERE receiver_id = p_user_id AND read = false) AS unread_count
        FROM messages
        WHERE sender_id = p_user_id OR receiver_id = p_user_id
        GROUP BY 
            CASE 
                WHEN sender_id = p_user_id THEN receiver_id
                ELSE sender_id
            END
    )
    SELECT 
        gen_random_uuid() AS conversation_id,
        p.id AS user_id,
        p.username,
        p.avatar_url,
        rm.last_message,
        rm.last_message_type,
        rm.last_message_status,
        rm.last_message_time AS last_message_at,
        rm.unread_count
    FROM recent_messages rm
    JOIN profiles p ON p.id = rm.partner_id
    ORDER BY rm.last_message_time DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_recent_conversations(UUID) TO authenticated; 