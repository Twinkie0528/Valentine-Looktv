-- LOOKTV Match Night Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Participants table
CREATE TABLE participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nickname TEXT NOT NULL,
    gender TEXT NOT NULL CHECK (gender IN ('male', 'female')),
    answers JSONB DEFAULT '{}',
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Matches table
CREATE TABLE matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    male_id UUID REFERENCES participants(id) ON DELETE CASCADE,
    female_id UUID REFERENCES participants(id) ON DELETE CASCADE,
    similarity_score INTEGER DEFAULT 0,
    category TEXT DEFAULT 'default',
    revealed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Event state table (for controlling the event flow)
CREATE TABLE event_state (
    id INTEGER PRIMARY KEY DEFAULT 1,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'matching', 'revealing', 'ended')),
    matches_generated BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default event state
INSERT INTO event_state (id, status) VALUES (1, 'active');

-- Indexes for performance
CREATE INDEX idx_participants_gender ON participants(gender);
CREATE INDEX idx_participants_completed ON participants(completed);
CREATE INDEX idx_matches_revealed ON matches(revealed);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for participants
CREATE TRIGGER update_participants_updated_at
    BEFORE UPDATE ON participants
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_state ENABLE ROW LEVEL SECURITY;

-- Policies for participants (anyone can read and insert, but only update their own)
CREATE POLICY "Anyone can read participants"
    ON participants FOR SELECT
    USING (true);

CREATE POLICY "Anyone can insert participants"
    ON participants FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Anyone can update participants"
    ON participants FOR UPDATE
    USING (true);

-- Policies for matches (anyone can read, only service role can insert/update)
CREATE POLICY "Anyone can read matches"
    ON matches FOR SELECT
    USING (true);

CREATE POLICY "Anyone can insert matches"
    ON matches FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Anyone can update matches"
    ON matches FOR UPDATE
    USING (true);

CREATE POLICY "Anyone can delete matches"
    ON matches FOR DELETE
    USING (true);

-- Policies for event_state
CREATE POLICY "Anyone can read event_state"
    ON event_state FOR SELECT
    USING (true);

CREATE POLICY "Anyone can update event_state"
    ON event_state FOR UPDATE
    USING (true);

-- Enable realtime for tables
ALTER PUBLICATION supabase_realtime ADD TABLE participants;
ALTER PUBLICATION supabase_realtime ADD TABLE matches;
ALTER PUBLICATION supabase_realtime ADD TABLE event_state;

-- Function to reset event (call from admin)
CREATE OR REPLACE FUNCTION reset_event()
RETURNS void AS $$
BEGIN
    DELETE FROM matches;
    DELETE FROM participants;
    UPDATE event_state SET status = 'active', matches_generated = FALSE, updated_at = NOW() WHERE id = 1;
END;
$$ LANGUAGE plpgsql;
