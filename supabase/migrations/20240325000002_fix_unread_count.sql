-- Fix unread count increment logic in the upsert_conversation function
CREATE OR REPLACE FUNCTION public.upsert_conversation(
    p_user_1 UUID,
    p_user_2 UUID,
    p_last_message TEXT,
    p_last_sender_id UUID
) RETURNS UUID AS $$
DECLARE
    v_conversation_id UUID;
    v_ordered_user_1 UUID;
    v_ordered_user_2 UUID;
BEGIN
    -- Always ensure user_1 is the lower UUID (for consistent unique constraints)
    v_ordered_user_1 := LEAST(p_user_1, p_user_2);
    v_ordered_user_2 := GREATEST(p_user_1, p_user_2);

    -- Try to find existing conversation
    SELECT id INTO v_conversation_id
    FROM public.conversations
    WHERE (user_1 = v_ordered_user_1 AND user_2 = v_ordered_user_2);

    -- If conversation exists, update it
    IF v_conversation_id IS NOT NULL THEN
        UPDATE public.conversations
        SET 
            last_message = p_last_message,
            last_message_at = NOW(),
            last_sender_id = p_last_sender_id,
            -- Increment unread count only for the recipient
            unread_count = CASE 
                WHEN p_last_sender_id = user_1 THEN unread_count + 1  -- sender is user_1, increment for user_2
                WHEN p_last_sender_id = user_2 THEN unread_count + 1  -- sender is user_2, increment for user_1
                ELSE unread_count  -- handle edge case of external sender
            END,
            updated_at = NOW()
        WHERE id = v_conversation_id;
    ELSE
        -- Create new conversation
        INSERT INTO public.conversations (
            user_1, 
            user_2, 
            last_message, 
            last_message_at,
            last_sender_id,
            unread_count
        )
        VALUES (
            v_ordered_user_1, 
            v_ordered_user_2, 
            p_last_message, 
            NOW(),
            p_last_sender_id,
            1  -- Start with unread count of 1 for the recipient
        )
        RETURNING id INTO v_conversation_id;
    END IF;

    RETURN v_conversation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 