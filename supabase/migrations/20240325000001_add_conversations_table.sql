-- Create conversations table for optimized chat loading
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_1 UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    user_2 UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    last_message TEXT,
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    unread_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure user_1 and user_2 are unique together (prevent duplicate conversations)
    CONSTRAINT unique_conversation UNIQUE(user_1, user_2)
);

-- Create index on user_1 and user_2 for faster lookups
CREATE INDEX IF NOT EXISTS idx_conversations_user_1 ON public.conversations(user_1);
CREATE INDEX IF NOT EXISTS idx_conversations_user_2 ON public.conversations(user_2);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message_at ON public.conversations(last_message_at DESC);

-- Add status column to messages table
ALTER TABLE public.messages 
ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'text' CHECK (type IN ('text', 'image', 'video', 'file')),
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'read'));

-- Create a function to upsert a conversation (create if it doesn't exist, update if it does)
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
    IF p_user_1 < p_user_2 THEN
        v_ordered_user_1 := p_user_1;
        v_ordered_user_2 := p_user_2;
    ELSE
        v_ordered_user_1 := p_user_2;
        v_ordered_user_2 := p_user_1;
    END IF;

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
            unread_count = CASE 
                -- If sender is user_1, increment unread count for user_2
                WHEN p_last_sender_id = v_ordered_user_1 THEN 
                    CASE WHEN p_last_sender_id = user_1 THEN unread_count + 1 ELSE unread_count END
                -- If sender is user_2, increment unread count for user_1
                WHEN p_last_sender_id = v_ordered_user_2 THEN 
                    CASE WHEN p_last_sender_id = user_2 THEN unread_count + 1 ELSE unread_count END
                ELSE unread_count
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
            1
        )
        RETURNING id INTO v_conversation_id;
    END IF;

    RETURN v_conversation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to update the conversations table when a message is inserted
CREATE OR REPLACE FUNCTION public.update_conversation_on_message() RETURNS TRIGGER AS $$
BEGIN
    -- Call the upsert function
    PERFORM public.upsert_conversation(
        LEAST(NEW.sender_id, NEW.receiver_id),
        GREATEST(NEW.sender_id, NEW.receiver_id),
        NEW.content,
        NEW.sender_id
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add the trigger
DROP TRIGGER IF EXISTS update_conversation_trigger ON public.messages;
CREATE TRIGGER update_conversation_trigger
AFTER INSERT ON public.messages
FOR EACH ROW
EXECUTE FUNCTION public.update_conversation_on_message();

-- Create a function to get recent conversations for a user
CREATE OR REPLACE FUNCTION public.get_recent_conversations(p_user_id UUID)
RETURNS TABLE (
    conversation_id UUID,
    user_id UUID,
    username TEXT,
    avatar_url TEXT,
    last_message TEXT,
    last_message_at TIMESTAMP WITH TIME ZONE,
    last_sender_id UUID,
    unread_count INT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id AS conversation_id,
        CASE 
            WHEN c.user_1 = p_user_id THEN c.user_2
            ELSE c.user_1
        END AS user_id,
        p.username,
        p.avatar_url,
        c.last_message,
        c.last_message_at,
        c.last_sender_id,
        CASE
            WHEN c.last_sender_id != p_user_id THEN c.unread_count
            ELSE 0
        END AS unread_count
    FROM public.conversations c
    JOIN public.profiles p ON (
        CASE 
            WHEN c.user_1 = p_user_id THEN c.user_2
            ELSE c.user_1
        END = p.id
    )
    WHERE c.user_1 = p_user_id OR c.user_2 = p_user_id
    ORDER BY c.last_message_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to mark conversation as read
CREATE OR REPLACE FUNCTION public.mark_conversation_as_read(
    p_user_id UUID,
    p_other_user_id UUID
) RETURNS void AS $$
DECLARE
    v_ordered_user_1 UUID;
    v_ordered_user_2 UUID;
BEGIN
    -- Ensure consistent ordering
    v_ordered_user_1 := LEAST(p_user_id, p_other_user_id);
    v_ordered_user_2 := GREATEST(p_user_id, p_other_user_id);
    
    -- Update conversation unread count
    UPDATE public.conversations
    SET unread_count = 0
    WHERE user_1 = v_ordered_user_1 AND user_2 = v_ordered_user_2;
    
    -- Mark messages as read
    UPDATE public.messages
    SET status = 'read'
    WHERE 
        sender_id = p_other_user_id AND 
        receiver_id = p_user_id AND
        status != 'read';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 