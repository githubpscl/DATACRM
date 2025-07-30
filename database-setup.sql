-- Role-Based Access Control System Database Schema
-- Run this script in your Supabase SQL editor to set up the tables

-- First, create organizations table with simpler structure for testing
CREATE TABLE IF NOT EXISTS organizations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  domain VARCHAR(255),
  admin_email VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

-- Create a simple permissions table first
CREATE TABLE IF NOT EXISTS permissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  category VARCHAR(50) DEFAULT 'general',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_roles table
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL DEFAULT 'user',
  assigned_by UUID,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

-- Create user_permissions table
CREATE TABLE IF NOT EXISTS user_permissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  granted_by UUID,
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

-- Insert basic permissions if they don't exist
INSERT INTO permissions (name, description, category) VALUES 
  ('view_customers', 'View customer data', 'customers'),
  ('edit_customers', 'Edit customer information', 'customers'),
  ('delete_customers', 'Delete customer records', 'customers'),
  ('import_data', 'Import data from CSV files', 'data'),
  ('export_data', 'Export data to CSV files', 'data'),
  ('view_analytics', 'View analytics and reports', 'analytics'),
  ('manage_campaigns', 'Create and manage campaigns', 'campaigns'),
  ('manage_journeys', 'Create and manage customer journeys', 'journeys'),
  ('manage_content', 'Create and manage content templates', 'content'),
  ('manage_team', 'Manage team members and roles', 'admin'),
  ('manage_settings', 'Manage system settings', 'admin'),
  ('view_all_data', 'View all organizational data', 'admin'),
  ('super_admin', 'Super administrator privileges', 'system')
ON CONFLICT (name) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_organization_id ON user_roles(organization_id);
CREATE INDEX IF NOT EXISTS idx_user_permissions_user_id ON user_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_permissions_organization_id ON user_permissions(organization_id);
CREATE INDEX IF NOT EXISTS idx_organizations_admin_email ON organizations(admin_email);

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS update_organizations_updated_at ON organizations;
CREATE TRIGGER update_organizations_updated_at 
  BEFORE UPDATE ON organizations 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS) but make it permissive for testing
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their organization" ON organizations;
DROP POLICY IF EXISTS "Super admin can manage organizations" ON organizations;
DROP POLICY IF EXISTS "Users can view roles in their organization" ON user_roles;
DROP POLICY IF EXISTS "Authenticated users can view permissions" ON permissions;
DROP POLICY IF EXISTS "Users can view permissions in their organization" ON user_permissions;

-- Create more permissive policies for testing
CREATE POLICY "Allow all for authenticated users" ON organizations
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for authenticated users" ON user_roles
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for authenticated users" ON permissions
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for authenticated users" ON user_permissions
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Grant necessary permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON organizations TO authenticated;
GRANT ALL ON user_roles TO authenticated;
GRANT ALL ON user_permissions TO authenticated;
GRANT ALL ON permissions TO authenticated;

-- Add some helpful comments
COMMENT ON TABLE organizations IS 'Organizations in the CRM system';
COMMENT ON TABLE permissions IS 'Available permissions in the system';
COMMENT ON TABLE user_roles IS 'User roles within organizations';
COMMENT ON TABLE user_permissions IS 'Specific permissions granted to users';

-- Test data insertion (optional)
-- You can uncomment these to test if the tables work
-- INSERT INTO organizations (name, admin_email, domain) VALUES 
--   ('Test Organization', 'testdatacrmpascal@gmail.com', 'test.com')
-- ON CONFLICT DO NOTHING;
