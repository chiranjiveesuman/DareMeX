-- Create dares table
CREATE TABLE IF NOT EXISTS public.dares (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    difficulty TEXT NOT NULL CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
    creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    media_url TEXT,
    likes INTEGER DEFAULT 0 NOT NULL,
    shares INTEGER DEFAULT 0 NOT NULL,
    comments INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.dares ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read access for all users" ON public.dares
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users" ON public.dares
    FOR INSERT WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Enable update for dare creators" ON public.dares
    FOR UPDATE USING (auth.uid() = creator_id);

CREATE POLICY "Enable delete for dare creators" ON public.dares
    FOR DELETE USING (auth.uid() = creator_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.dares
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.dares; 