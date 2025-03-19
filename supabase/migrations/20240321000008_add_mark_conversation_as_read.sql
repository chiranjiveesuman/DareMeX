-- Function to mark messages as read
CREATE OR REPLACE FUNCTION public.mark_conversation_as_read(p_user_id UUID, p_other_user_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE messages
    SET read = true
    WHERE 
        (sender_id = p_other_user_id AND receiver_id = p_user_id) AND
        read = false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.mark_conversation_as_read(UUID, UUID) TO authenticated; 