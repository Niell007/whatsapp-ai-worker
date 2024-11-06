-- schema.sql

-- Messages table for storing all types of messages
CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL, -- 'text', 'voice', 'image'
    from_id TEXT NOT NULL,
    content TEXT,
    media_id TEXT,
    transcription TEXT,
    response TEXT,
    timestamp INTEGER NOT NULL
);

-- Errors table for logging
CREATE TABLE IF NOT EXISTS errors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    message TEXT NOT NULL,
    stack TEXT,
    timestamp INTEGER NOT NULL
);

-- Media metadata table
CREATE TABLE IF NOT EXISTS media (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    mimetype TEXT NOT NULL,
    metadata TEXT,
    timestamp INTEGER NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages(timestamp);
CREATE INDEX IF NOT EXISTS idx_messages_from_id ON messages(from_id);
CREATE INDEX IF NOT EXISTS idx_errors_timestamp ON errors(timestamp);
