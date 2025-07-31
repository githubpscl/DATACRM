-- ===============================================
-- DATACRM - Comprehensive Database Schema
-- Version: 2.0
-- Date: 2025-07-31
-- ===============================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ===============================================
-- 1. ORGANIZATIONS (Firmen/Unternehmen)
-- ===============================================

CREATE TABLE organizations (
    -- Primary identifiers
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE, -- URL-friendly identifier
    
    -- Business information
    legal_name VARCHAR(255), -- Official registered name
    business_type VARCHAR(50) CHECK (business_type IN ('GmbH', 'AG', 'UG', 'e.K.', 'OHG', 'KG', 'GbR', 'Verein', 'Stiftung', 'Sonstige')),
    tax_id VARCHAR(50), -- Steuernummer
    vat_id VARCHAR(50), -- Umsatzsteuer-ID
    commercial_register VARCHAR(100), -- Handelsregistereintrag
    
    -- Contact information
    email VARCHAR(255),
    phone VARCHAR(50),
    website VARCHAR(255),
    
    -- Address
    street VARCHAR(255),
    house_number VARCHAR(20),
    postal_code VARCHAR(20),
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100) DEFAULT 'Deutschland',
    
    -- Business details
    industry VARCHAR(100), -- Branche
    employee_count INTEGER,
    founded_year INTEGER,
    annual_revenue DECIMAL(15,2),
    description TEXT,
    
    -- Subscription & billing
    subscription_plan VARCHAR(50) DEFAULT 'free' CHECK (subscription_plan IN ('free', 'basic', 'professional', 'enterprise')),
    subscription_status VARCHAR(20) DEFAULT 'active' CHECK (subscription_status IN ('active', 'inactive', 'suspended', 'cancelled')),
    billing_email VARCHAR(255),
    billing_cycle VARCHAR(20) DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'yearly')),
    trial_ends_at TIMESTAMP WITH TIME ZONE,
    subscription_starts_at TIMESTAMP WITH TIME ZONE,
    subscription_ends_at TIMESTAMP WITH TIME ZONE,
    
    -- Settings
    timezone VARCHAR(50) DEFAULT 'Europe/Berlin',
    locale VARCHAR(10) DEFAULT 'de-DE',
    currency VARCHAR(3) DEFAULT 'EUR',
    date_format VARCHAR(20) DEFAULT 'DD.MM.YYYY',
    
    -- Limits based on subscription
    max_users INTEGER DEFAULT 5,
    max_customers INTEGER DEFAULT 1000,
    max_storage_mb INTEGER DEFAULT 100,
    
    -- Status and metadata
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    onboarding_completed BOOLEAN DEFAULT false,
    last_activity_at TIMESTAMP WITH TIME ZONE,
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID, -- References users.id
    updated_by UUID  -- References users.id
);

-- ===============================================
-- 2. USERS (Benutzer der Anwendung)
-- ===============================================

CREATE TABLE users (
    -- Primary identifiers (linked to Supabase auth)
    id UUID PRIMARY KEY, -- This should match auth.users.id
    organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    
    -- Personal information
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    display_name VARCHAR(200),
    avatar_url TEXT,
    
    -- Contact information
    phone VARCHAR(50),
    mobile VARCHAR(50),
    
    -- Business information
    job_title VARCHAR(100),
    department VARCHAR(100),
    employee_id VARCHAR(50),
    
    -- System role and permissions
    role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('super_admin', 'org_admin', 'manager', 'user', 'readonly')),
    permissions JSONB DEFAULT '[]'::jsonb, -- Array of permission strings
    
    -- Access control
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    email_verified_at TIMESTAMP WITH TIME ZONE,
    phone_verified_at TIMESTAMP WITH TIME ZONE,
    
    -- Security
    two_factor_enabled BOOLEAN DEFAULT false,
    backup_codes TEXT[], -- Array of backup codes
    last_password_change TIMESTAMP WITH TIME ZONE,
    password_expires_at TIMESTAMP WITH TIME ZONE,
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP WITH TIME ZONE,
    
    -- Session and activity
    last_login_at TIMESTAMP WITH TIME ZONE,
    last_activity_at TIMESTAMP WITH TIME ZONE,
    login_count INTEGER DEFAULT 0,
    
    -- Preferences
    language VARCHAR(10) DEFAULT 'de',
    timezone VARCHAR(50) DEFAULT 'Europe/Berlin',
    date_format VARCHAR(20) DEFAULT 'DD.MM.YYYY',
    time_format VARCHAR(10) DEFAULT '24h',
    notifications_email BOOLEAN DEFAULT true,
    notifications_push BOOLEAN DEFAULT true,
    theme VARCHAR(20) DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'auto')),
    
    -- Onboarding and help
    onboarding_completed BOOLEAN DEFAULT false,
    tour_completed BOOLEAN DEFAULT false,
    help_tooltips_enabled BOOLEAN DEFAULT true,
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID, -- References users.id
    updated_by UUID, -- References users.id
    
    -- Soft delete
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by UUID -- References users.id
);

-- ===============================================
-- 3. CUSTOMERS (Kunden der Organisationen)
-- ===============================================

CREATE TABLE customers (
    -- Primary identifiers
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    customer_number VARCHAR(50), -- Internal customer number
    external_id VARCHAR(100), -- External system ID
    
    -- Customer type
    customer_type VARCHAR(20) NOT NULL CHECK (customer_type IN ('person', 'company')),
    
    -- Personal information (for persons)
    salutation VARCHAR(20) CHECK (salutation IN ('Herr', 'Frau', 'Dr.', 'Prof.', 'Prof. Dr.')),
    title VARCHAR(50),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    birth_date DATE,
    gender VARCHAR(20) CHECK (gender IN ('männlich', 'weiblich', 'divers', 'keine_angabe')),
    
    -- Company information (for companies)
    company_name VARCHAR(255),
    legal_form VARCHAR(50), -- GmbH, AG, etc.
    tax_id VARCHAR(50),
    vat_id VARCHAR(50),
    commercial_register VARCHAR(100),
    industry VARCHAR(100),
    employee_count INTEGER,
    annual_revenue DECIMAL(15,2),
    founding_date DATE,
    
    -- Primary contact information
    email VARCHAR(255),
    email_secondary VARCHAR(255),
    phone VARCHAR(50),
    mobile VARCHAR(50),
    fax VARCHAR(50),
    website VARCHAR(255),
    
    -- Address information
    street VARCHAR(255),
    house_number VARCHAR(20),
    postal_code VARCHAR(20),
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100) DEFAULT 'Deutschland',
    
    -- Additional addresses (JSON for flexibility)
    addresses JSONB DEFAULT '[]'::jsonb, -- Array of address objects
    
    -- Business relationship
    customer_status VARCHAR(50) DEFAULT 'prospect' CHECK (customer_status IN ('prospect', 'lead', 'customer', 'inactive', 'blocked')),
    acquisition_source VARCHAR(100), -- Website, Referral, Advertisement, etc.
    acquisition_date DATE,
    first_contact_date DATE,
    last_contact_date DATE,
    
    -- Financial information
    credit_limit DECIMAL(12,2) DEFAULT 0,
    payment_terms INTEGER DEFAULT 30, -- Days
    currency VARCHAR(3) DEFAULT 'EUR',
    tax_rate DECIMAL(5,2) DEFAULT 19.00, -- Percentage
    
    -- Preferences and settings
    language VARCHAR(10) DEFAULT 'de',
    communication_preference VARCHAR(50) DEFAULT 'email' CHECK (communication_preference IN ('email', 'phone', 'sms', 'letter', 'none')),
    newsletter_subscribed BOOLEAN DEFAULT false,
    marketing_consent BOOLEAN DEFAULT false,
    marketing_consent_date TIMESTAMP WITH TIME ZONE,
    
    -- GDPR and privacy
    privacy_consent BOOLEAN DEFAULT false,
    privacy_consent_date TIMESTAMP WITH TIME ZONE,
    data_processing_consent BOOLEAN DEFAULT false,
    data_retention_until DATE,
    
    -- Tags and categorization
    tags TEXT[], -- Array of tags
    category VARCHAR(100),
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'critical')),
    
    -- Notes and custom fields
    notes TEXT,
    internal_notes TEXT, -- Not visible to customer
    custom_fields JSONB DEFAULT '{}'::jsonb, -- Flexible custom fields
    
    -- Activity tracking
    last_order_date DATE,
    total_orders INTEGER DEFAULT 0,
    total_revenue DECIMAL(12,2) DEFAULT 0,
    average_order_value DECIMAL(12,2) DEFAULT 0,
    last_activity_type VARCHAR(100),
    last_activity_date TIMESTAMP WITH TIME ZONE,
    
    -- Assignment and responsibility
    assigned_to UUID REFERENCES users(id), -- Responsible user
    team VARCHAR(100),
    
    -- Status and metadata
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    quality_score INTEGER CHECK (quality_score >= 0 AND quality_score <= 100),
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    
    -- Soft delete
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by UUID REFERENCES users(id),
    
    -- Constraints
    CONSTRAINT customers_name_check CHECK (
        (customer_type = 'person' AND (first_name IS NOT NULL OR last_name IS NOT NULL)) OR
        (customer_type = 'company' AND company_name IS NOT NULL)
    ),
    
    -- Unique customer number per organization
    UNIQUE(organization_id, customer_number)
);

-- ===============================================
-- 4. CUSTOMER CONTACTS (Additional contacts)
-- ===============================================

CREATE TABLE customer_contacts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Contact information
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    job_title VARCHAR(100),
    department VARCHAR(100),
    email VARCHAR(255),
    phone VARCHAR(50),
    mobile VARCHAR(50),
    
    -- Contact type and relationship
    contact_type VARCHAR(50) DEFAULT 'contact' CHECK (contact_type IN ('primary', 'billing', 'technical', 'decision_maker', 'contact')),
    is_primary BOOLEAN DEFAULT false,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);

-- ===============================================
-- 5. CUSTOMER ACTIVITIES (Activity log)
-- ===============================================

CREATE TABLE customer_activities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    
    -- Activity details
    activity_type VARCHAR(100) NOT NULL, -- call, email, meeting, note, task, etc.
    title VARCHAR(255) NOT NULL,
    description TEXT,
    outcome VARCHAR(100),
    
    -- Scheduling
    scheduled_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    duration_minutes INTEGER,
    
    -- Status
    status VARCHAR(50) DEFAULT 'completed' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    
    -- Additional data
    metadata JSONB DEFAULT '{}'::jsonb,
    attachments TEXT[], -- Array of file URLs
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);

-- ===============================================
-- 6. INDEXES for Performance
-- ===============================================

-- Organizations
CREATE INDEX idx_organizations_slug ON organizations(slug);
CREATE INDEX idx_organizations_subscription_plan ON organizations(subscription_plan);
CREATE INDEX idx_organizations_is_active ON organizations(is_active);
CREATE INDEX idx_organizations_created_at ON organizations(created_at);

-- Users
CREATE INDEX idx_users_organization_id ON users(organization_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_is_active ON users(is_active);
CREATE INDEX idx_users_last_login_at ON users(last_login_at);

-- Customers
CREATE INDEX idx_customers_organization_id ON customers(organization_id);
CREATE INDEX idx_customers_customer_type ON customers(customer_type);
CREATE INDEX idx_customers_customer_status ON customers(customer_status);
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_assigned_to ON customers(assigned_to);
CREATE INDEX idx_customers_is_active ON customers(is_active);
CREATE INDEX idx_customers_created_at ON customers(created_at);
CREATE INDEX idx_customers_last_contact_date ON customers(last_contact_date);
CREATE INDEX idx_customers_customer_number ON customers(organization_id, customer_number);

-- Customer contacts
CREATE INDEX idx_customer_contacts_customer_id ON customer_contacts(customer_id);
CREATE INDEX idx_customer_contacts_is_primary ON customer_contacts(customer_id, is_primary);

-- Customer activities
CREATE INDEX idx_customer_activities_customer_id ON customer_activities(customer_id);
CREATE INDEX idx_customer_activities_user_id ON customer_activities(user_id);
CREATE INDEX idx_customer_activities_activity_type ON customer_activities(activity_type);
CREATE INDEX idx_customer_activities_scheduled_at ON customer_activities(scheduled_at);
CREATE INDEX idx_customer_activities_created_at ON customer_activities(created_at);

-- ===============================================
-- 7. FUNCTIONS and TRIGGERS
-- ===============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customer_contacts_updated_at BEFORE UPDATE ON customer_contacts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customer_activities_updated_at BEFORE UPDATE ON customer_activities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to generate customer number
CREATE OR REPLACE FUNCTION generate_customer_number(org_id UUID)
RETURNS VARCHAR AS $$
DECLARE
    next_number INTEGER;
    formatted_number VARCHAR;
BEGIN
    -- Get the next customer number for this organization
    SELECT COALESCE(MAX(CAST(NULLIF(regexp_replace(customer_number, '[^0-9]', '', 'g'), '') AS INTEGER)), 0) + 1
    INTO next_number
    FROM customers 
    WHERE organization_id = org_id 
    AND customer_number IS NOT NULL;
    
    -- Format as KD000001, KD000002, etc.
    formatted_number := 'KD' || LPAD(next_number::TEXT, 6, '0');
    
    RETURN formatted_number;
END;
$$ LANGUAGE plpgsql;

-- Function to automatically generate customer number if not provided
CREATE OR REPLACE FUNCTION set_customer_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.customer_number IS NULL THEN
        NEW.customer_number := generate_customer_number(NEW.organization_id);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_customer_number_trigger 
    BEFORE INSERT ON customers 
    FOR EACH ROW 
    EXECUTE FUNCTION set_customer_number();

-- ===============================================
-- 8. ROW LEVEL SECURITY (RLS)
-- ===============================================

-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_activities ENABLE ROW LEVEL SECURITY;

-- Organizations: Users can only see their own organization
CREATE POLICY "Users can view their organization" ON organizations
    FOR SELECT USING (
        id IN (
            SELECT organization_id 
            FROM users 
            WHERE id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role = 'super_admin'
        )
    );

-- Users: Can see users in their organization + super admins see all
CREATE POLICY "Users can view users in their organization" ON users
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id 
            FROM users 
            WHERE id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role = 'super_admin'
        )
    );

-- Customers: Can only see customers from their organization
CREATE POLICY "Users can view customers from their organization" ON customers
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id 
            FROM users 
            WHERE id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role = 'super_admin'
        )
    );

-- Customer contacts: Can only see contacts from their organization's customers
CREATE POLICY "Users can view customer contacts from their organization" ON customer_contacts
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id 
            FROM users 
            WHERE id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role = 'super_admin'
        )
    );

-- Customer activities: Can only see activities from their organization's customers
CREATE POLICY "Users can view customer activities from their organization" ON customer_activities
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id 
            FROM users 
            WHERE id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role = 'super_admin'
        )
    );

-- ===============================================
-- 9. INITIAL DATA
-- ===============================================

-- Insert system organization for super admins
INSERT INTO organizations (
    id,
    name,
    slug,
    legal_name,
    email,
    subscription_plan,
    max_users,
    max_customers,
    max_storage_mb,
    is_active,
    created_at
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    'System Administration',
    'system',
    'DataCRM System',
    'admin@datacrm.system',
    'enterprise',
    999999,
    999999,
    999999,
    true,
    NOW()
);

-- Insert sample organization
INSERT INTO organizations (
    name,
    slug,
    legal_name,
    business_type,
    email,
    phone,
    website,
    street,
    house_number,
    postal_code,
    city,
    country,
    industry,
    subscription_plan,
    is_active
) VALUES (
    'Beispiel GmbH',
    'beispiel-gmbh',
    'Beispiel GmbH',
    'GmbH',
    'info@beispiel.de',
    '+49 30 12345678',
    'https://www.beispiel.de',
    'Musterstraße',
    '123',
    '10115',
    'Berlin',
    'Deutschland',
    'IT-Dienstleistungen',
    'professional',
    true
);

-- ===============================================
-- 10. USEFUL VIEWS
-- ===============================================

-- View for customer overview
CREATE VIEW customer_overview AS
SELECT 
    c.*,
    CASE 
        WHEN c.customer_type = 'person' THEN CONCAT(c.first_name, ' ', c.last_name)
        ELSE c.company_name
    END as display_name,
    o.name as organization_name,
    u.first_name || ' ' || u.last_name as assigned_user_name,
    (SELECT COUNT(*) FROM customer_activities ca WHERE ca.customer_id = c.id) as activity_count,
    (SELECT MAX(ca.created_at) FROM customer_activities ca WHERE ca.customer_id = c.id) as latest_activity_date
FROM customers c
JOIN organizations o ON c.organization_id = o.id
LEFT JOIN users u ON c.assigned_to = u.id
WHERE c.deleted_at IS NULL;

-- View for user overview with organization details
CREATE VIEW user_overview AS
SELECT 
    u.*,
    o.name as organization_name,
    o.subscription_plan,
    CONCAT(u.first_name, ' ', u.last_name) as full_name
FROM users u
LEFT JOIN organizations o ON u.organization_id = o.id
WHERE u.deleted_at IS NULL;

-- ===============================================
-- END OF SCHEMA
-- ===============================================

-- Grant permissions (adjust as needed)
-- GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
-- GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
-- GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
