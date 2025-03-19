-- Drop the existing function if it exists
DROP FUNCTION IF EXISTS public.get_chat_messages;

-- Recreate the function with proper schema qualification
CREATE OR REPLACE FUNCTION public.get_chat_messages(p_user_id uuid)
RETURNS TABLE (
    message_id uuid,
    content text,
    sender_id uuid,
    receiver_id uuid,
    created_at timestamptz,
    read boolean,
    sender_username text,
    sender_avatar text
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        m.id AS message_id,
        m.content,
        m.sender_id,
        m.receiver_id,
        m.created_at,
        m.read,
        p.username AS sender_username,
        p.avatar_url AS sender_avatar
    FROM public.messages m
    JOIN public.profiles p ON m.sender_id = p.id
    WHERE m.receiver_id = p_user_id OR m.sender_id = p_user_id
    ORDER BY m.created_at DESC;
END;
$$; 