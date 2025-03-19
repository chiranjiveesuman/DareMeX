-- Drop existing tables and start fresh
DROP TABLE IF EXISTS public.messages CASCADE;
DROP TABLE IF EXISTS public.friends CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Create profiles table first
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create messages table with explicit foreign key names
CREATE TABLE public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content TEXT NOT NULL,
    sender_id UUID NOT NULL,
    receiver_id UUID NOT NULL,
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT fk_messages_sender FOREIGN KEY (sender_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
    CONSTRAINT fk_messages_receiver FOREIGN KEY (receiver_id) REFERENCES public.profiles(id) ON DELETE CASCADE
);

-- Create friends table with explicit foreign key names
CREATE TABLE public.friends (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID NOT NULL,
    receiver_id UUID NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT fk_friends_sender FOREIGN KEY (sender_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
    CONSTRAINT fk_friends_receiver FOREIGN KEY (receiver_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
    UNIQUE(sender_id, receiver_id)
);

-- Create notifications table with explicit foreign key names
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL CHECK (type IN ('comment', 'like', 'dare')),
    user_id UUID NOT NULL,
    receiver_id UUID NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
    CONSTRAINT fk_notifications_receiver FOREIGN KEY (receiver_id) REFERENCES public.profiles(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX idx_messages_receiver_id ON public.messages(receiver_id);
CREATE INDEX idx_messages_created_at ON public.messages(created_at DESC);
CREATE INDEX idx_friends_sender_id ON public.friends(sender_id);
CREATE INDEX idx_friends_receiver_id ON public.friends(receiver_id);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_receiver_id ON public.notifications(receiver_id);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friends ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Public profiles are viewable by everyone" 
ON public.profiles FOR SELECT 
USING (true);

CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Users can send messages" 
ON public.messages FOR INSERT 
WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can view their messages" 
ON public.messages FOR SELECT 
USING (auth.uid() IN (sender_id, receiver_id));

CREATE POLICY "Users can send friend requests" 
ON public.friends FOR INSERT 
WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can view their friend connections" 
ON public.friends FOR SELECT 
USING (auth.uid() IN (sender_id, receiver_id));

CREATE POLICY "Users can update received friend requests" 
ON public.friends FOR UPDATE 
USING (auth.uid() = receiver_id);

CREATE POLICY "Users can view their notifications" 
ON public.notifications FOR SELECT 
USING (auth.uid() = receiver_id);

-- Create function to get chat messages
CREATE OR REPLACE FUNCTION get_chat_messages(p_user_id UUID)
RETURNS TABLE (
    message_id UUID,
    content TEXT,
    sender_id UUID,
    receiver_id UUID,
    created_at TIMESTAMPTZ,
    read BOOLEAN,
    sender_username TEXT,
    sender_avatar TEXT
) AS $$
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
    FROM messages m
    JOIN profiles p ON m.sender_id = p.id
    WHERE m.receiver_id = p_user_id OR m.sender_id = p_user_id
    ORDER BY m.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 