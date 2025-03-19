-- Ensure status and type columns exist in messages table
DO $$
BEGIN
    -- Add status column if not exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='messages' AND column_name='status'
    ) THEN
        EXECUTE 'ALTER TABLE messages ADD COLUMN status TEXT DEFAULT ''sent'' CHECK (status IN (''sent'', ''delivered'', ''read''))';
    END IF;

    -- Add type column if not exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='messages' AND column_name='type'
    ) THEN
        EXECUTE 'ALTER TABLE messages ADD COLUMN type TEXT DEFAULT ''text'' CHECK (type IN (''text'', ''image'', ''video'', ''file''))';
    END IF;
END $$;

-- Update existing messages with default values (fixed syntax)
UPDATE messages SET status = 'sent' WHERE status IS NULL;
UPDATE messages SET type = 'text' WHERE type IS NULL;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_messages_status ON messages(status);
CREATE INDEX IF NOT EXISTS idx_messages_type ON messages(type);

-- Ensure RLS policies allow inserting with these columns
ALTER TABLE messages ENABLE ROW LEVEL SECURITY; 