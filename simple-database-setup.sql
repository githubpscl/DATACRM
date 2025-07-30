-- Minimal Organizations Table Setup
-- Run this in Supabase SQL Editor if you're getting errors

-- Drop and recreate the organizations table to ensure it exists
DROP TABLE IF EXISTS organizations CASCADE;

CREATE TABLE organizations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  admin_email TEXT NOT NULL,
  domain TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Disable RLS temporarily for testing
ALTER TABLE organizations DISABLE ROW LEVEL SECURITY;

-- Grant full access to authenticated users
GRANT ALL ON organizations TO authenticated;

-- Test insertion
INSERT INTO organizations (name, admin_email, domain) VALUES 
  ('Test Organization', 'test@example.com', 'example.com');

-- Check if it worked
SELECT * FROM organizations;
