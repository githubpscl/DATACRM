-- Role-Based Access Control System Database Schema
-- Run this script in your Supabase SQL editor to set up the tables

-- Create organizations table
CREATE TABLE IF NOT EXISTS organizations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  domain VARCHAR(255),
  admin_email VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

-- Create permissions table
CREATE TABLE IF NOT EXISTS permissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  category VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_roles table
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL,
  assigned_by UUID,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  UNIQUE(user_id, organization_id)
);

-- Create user_permissions table
CREATE TABLE IF NOT EXISTS user_permissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  granted_by UUID,
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  UNIQUE(user_id, permission_id, organization_id)
);

-- Insert default permissions
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

CREATE TRIGGER update_organizations_updated_at 
  BEFORE UPDATE ON organizations 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;

-- Organizations: Users can only see their own organization or all if super admin
CREATE POLICY "Users can view their organization" ON organizations
  FOR SELECT USING (
    admin_email = auth.jwt() ->> 'email' 
    OR auth.jwt() ->> 'email' = 'testdatacrmpascal@gmail.com'
  );

CREATE POLICY "Super admin can manage organizations" ON organizations
  FOR ALL USING (auth.jwt() ->> 'email' = 'testdatacrmpascal@gmail.com');

-- User roles: Users can see roles in their organization
CREATE POLICY "Users can view roles in their organization" ON user_roles
  FOR SELECT USING (
    organization_id IN (
      SELECT id FROM organizations 
      WHERE admin_email = auth.jwt() ->> 'email'
    )
    OR auth.jwt() ->> 'email' = 'testdatacrmpascal@gmail.com'
  );

-- Permissions: All authenticated users can view permissions
CREATE POLICY "Authenticated users can view permissions" ON permissions
  FOR SELECT TO authenticated USING (true);

-- User permissions: Users can see permissions in their organization
CREATE POLICY "Users can view permissions in their organization" ON user_permissions
  FOR SELECT USING (
    organization_id IN (
      SELECT id FROM organizations 
      WHERE admin_email = auth.jwt() ->> 'email'
    )
    OR auth.jwt() ->> 'email' = 'testdatacrmpascal@gmail.com'
  );

-- Grant necessary permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON organizations TO authenticated;
GRANT ALL ON user_roles TO authenticated;
GRANT ALL ON user_permissions TO authenticated;
GRANT SELECT ON permissions TO authenticated;

COMMENT ON TABLE organizations IS 'Organizations in the CRM system';
COMMENT ON TABLE permissions IS 'Available permissions in the system';
COMMENT ON TABLE user_roles IS 'User roles within organizations';
COMMENT ON TABLE user_permissions IS 'Specific permissions granted to users';
