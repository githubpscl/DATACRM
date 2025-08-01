-- ===============================================
-- MULTI-TENANT ORGANIZATION SYSTEM
-- Session-basierte Organisation mit RLS
-- Vollständige Multi-Tenant Datenabsicherung
-- ===============================================

-- 1. Organization Context Function
-- Diese Funktion gibt die aktuelle Organisation des angemeldeten Benutzers zurück
CREATE OR REPLACE FUNCTION get_current_user_organization_id()
RETURNS UUID AS $$
DECLARE
    user_org_id UUID;
BEGIN
    -- Hole die Organisation des aktuellen Benutzers aus der users Tabelle
    SELECT organization_id INTO user_org_id
    FROM users 
    WHERE id = auth.uid()
    AND is_active = true;
    
    RETURN user_org_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. RLS Policies für alle relevanten Tabellen aktivieren

-- Enable RLS on all tables
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_activities ENABLE ROW LEVEL SECURITY;

-- Check if these tables exist and enable RLS
DO $$ 
BEGIN
    -- Enable RLS for additional tables if they exist
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'campaigns') THEN
        ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'journeys') THEN
        ALTER TABLE journeys ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'segments') THEN
        ALTER TABLE segments ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'templates') THEN
        ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'data_imports') THEN
        ALTER TABLE data_imports ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'campaign_deliveries') THEN
        ALTER TABLE campaign_deliveries ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'customer_segments') THEN
        ALTER TABLE customer_segments ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'journey_steps') THEN
        ALTER TABLE journey_steps ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'api_keys') THEN
        ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'audit_logs') THEN
        ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Customers: Nur Kunden der eigenen Organisation sichtbar
DROP POLICY IF EXISTS "Users can only see customers in their organization" ON customers;
CREATE POLICY "Users can only see customers in their organization" ON customers
    FOR ALL USING (organization_id = get_current_user_organization_id());

-- Customer Contacts: Nur Kontakte der eigenen Organisation
DROP POLICY IF EXISTS "Users can only see contacts in their organization" ON customer_contacts;
CREATE POLICY "Users can only see contacts in their organization" ON customer_contacts
    FOR ALL USING (organization_id = get_current_user_organization_id());

-- Customer Activities: Nur Aktivitäten der eigenen Organisation
DROP POLICY IF EXISTS "Users can only see activities in their organization" ON customer_activities;
CREATE POLICY "Users can only see activities in their organization" ON customer_activities
    FOR ALL USING (organization_id = get_current_user_organization_id());

-- Additional RLS Policies for other tables
DO $$ 
BEGIN
    -- Campaigns
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'campaigns') THEN
        DROP POLICY IF EXISTS "Users can only see campaigns in their organization" ON campaigns;
        CREATE POLICY "Users can only see campaigns in their organization" ON campaigns
            FOR ALL USING (organization_id = get_current_user_organization_id() OR company_id = get_current_user_organization_id());
    END IF;
    
    -- Journeys
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'journeys') THEN
        DROP POLICY IF EXISTS "Users can only see journeys in their organization" ON journeys;
        CREATE POLICY "Users can only see journeys in their organization" ON journeys
            FOR ALL USING (organization_id = get_current_user_organization_id() OR company_id = get_current_user_organization_id());
    END IF;
    
    -- Segments
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'segments') THEN
        DROP POLICY IF EXISTS "Users can only see segments in their organization" ON segments;
        CREATE POLICY "Users can only see segments in their organization" ON segments
            FOR ALL USING (organization_id = get_current_user_organization_id() OR company_id = get_current_user_organization_id());
    END IF;
    
    -- Templates
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'templates') THEN
        DROP POLICY IF EXISTS "Users can only see templates in their organization" ON templates;
        CREATE POLICY "Users can only see templates in their organization" ON templates
            FOR ALL USING (organization_id = get_current_user_organization_id() OR company_id = get_current_user_organization_id());
    END IF;
    
    -- Data Imports
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'data_imports') THEN
        DROP POLICY IF EXISTS "Users can only see data_imports in their organization" ON data_imports;
        CREATE POLICY "Users can only see data_imports in their organization" ON data_imports
            FOR ALL USING (organization_id = get_current_user_organization_id() OR company_id = get_current_user_organization_id());
    END IF;
    
    -- Campaign Deliveries (indirectly via campaign organization)
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'campaign_deliveries') THEN
        DROP POLICY IF EXISTS "Users can only see campaign_deliveries in their organization" ON campaign_deliveries;
        CREATE POLICY "Users can only see campaign_deliveries in their organization" ON campaign_deliveries
            FOR ALL USING (
                EXISTS (
                    SELECT 1 FROM campaigns c 
                    WHERE c.id = campaign_id 
                    AND (c.organization_id = get_current_user_organization_id() OR c.company_id = get_current_user_organization_id())
                )
                OR
                EXISTS (
                    SELECT 1 FROM customers cu 
                    WHERE cu.id = customer_id 
                    AND cu.organization_id = get_current_user_organization_id()
                )
            );
    END IF;
    
    -- Customer Segments (indirectly via customer organization)
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'customer_segments') THEN
        DROP POLICY IF EXISTS "Users can only see customer_segments in their organization" ON customer_segments;
        CREATE POLICY "Users can only see customer_segments in their organization" ON customer_segments
            FOR ALL USING (
                EXISTS (
                    SELECT 1 FROM customers c 
                    WHERE c.id = customer_id 
                    AND c.organization_id = get_current_user_organization_id()
                )
            );
    END IF;
    
    -- Journey Steps (indirectly via customer organization)
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'journey_steps') THEN
        DROP POLICY IF EXISTS "Users can only see journey_steps in their organization" ON journey_steps;
        CREATE POLICY "Users can only see journey_steps in their organization" ON journey_steps
            FOR ALL USING (
                EXISTS (
                    SELECT 1 FROM customers c 
                    WHERE c.id = customer_id 
                    AND c.organization_id = get_current_user_organization_id()
                )
            );
    END IF;
    
    -- API Keys
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'api_keys') THEN
        DROP POLICY IF EXISTS "Users can only see api_keys in their organization" ON api_keys;
        CREATE POLICY "Users can only see api_keys in their organization" ON api_keys
            FOR ALL USING (organization_id = get_current_user_organization_id() OR company_id = get_current_user_organization_id());
    END IF;
    
    -- Audit Logs
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'audit_logs') THEN
        DROP POLICY IF EXISTS "Users can only see audit_logs in their organization" ON audit_logs;
        CREATE POLICY "Users can only see audit_logs in their organization" ON audit_logs
            FOR ALL USING (organization_id = get_current_user_organization_id() OR company_id = get_current_user_organization_id());
    END IF;
END $$;

-- 3. Automatisches Setzen der Organization ID bei INSERT
-- Universal function for setting organization_id or company_id
CREATE OR REPLACE FUNCTION set_current_organization_id()
RETURNS TRIGGER AS $$
BEGIN
    -- Try to set organization_id first, then company_id as fallback
    IF TG_TABLE_NAME = 'customers' OR TG_TABLE_NAME = 'customer_contacts' OR TG_TABLE_NAME = 'customer_activities' THEN
        NEW.organization_id = get_current_user_organization_id();
    ELSE
        -- For tables that might use company_id (backward compatibility)
        IF NEW.organization_id IS NULL AND NEW.company_id IS NULL THEN
            IF column_exists(TG_TABLE_NAME, 'organization_id') THEN
                NEW.organization_id = get_current_user_organization_id();
            ELSIF column_exists(TG_TABLE_NAME, 'company_id') THEN
                NEW.company_id = get_current_user_organization_id();
            END IF;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Helper function to check if column exists
CREATE OR REPLACE FUNCTION column_exists(table_name text, column_name text)
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = $1 AND column_name = $2
    );
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to all relevant tables
DO $$ 
BEGIN
    -- Core customer tables
    DROP TRIGGER IF EXISTS set_org_id_customers ON customers;
    CREATE TRIGGER set_org_id_customers
        BEFORE INSERT ON customers
        FOR EACH ROW
        EXECUTE FUNCTION set_current_organization_id();

    DROP TRIGGER IF EXISTS set_org_id_contacts ON customer_contacts;
    CREATE TRIGGER set_org_id_contacts
        BEFORE INSERT ON customer_contacts
        FOR EACH ROW
        EXECUTE FUNCTION set_current_organization_id();

    DROP TRIGGER IF EXISTS set_org_id_activities ON customer_activities;
    CREATE TRIGGER set_org_id_activities
        BEFORE INSERT ON customer_activities
        FOR EACH ROW
        EXECUTE FUNCTION set_current_organization_id();

    -- Additional tables (if they exist)
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'campaigns') THEN
        DROP TRIGGER IF EXISTS set_org_id_campaigns ON campaigns;
        CREATE TRIGGER set_org_id_campaigns
            BEFORE INSERT ON campaigns
            FOR EACH ROW
            EXECUTE FUNCTION set_current_organization_id();
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'journeys') THEN
        DROP TRIGGER IF EXISTS set_org_id_journeys ON journeys;
        CREATE TRIGGER set_org_id_journeys
            BEFORE INSERT ON journeys
            FOR EACH ROW
            EXECUTE FUNCTION set_current_organization_id();
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'segments') THEN
        DROP TRIGGER IF EXISTS set_org_id_segments ON segments;
        CREATE TRIGGER set_org_id_segments
            BEFORE INSERT ON segments
            FOR EACH ROW
            EXECUTE FUNCTION set_current_organization_id();
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'templates') THEN
        DROP TRIGGER IF EXISTS set_org_id_templates ON templates;
        CREATE TRIGGER set_org_id_templates
            BEFORE INSERT ON templates
            FOR EACH ROW
            EXECUTE FUNCTION set_current_organization_id();
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'data_imports') THEN
        DROP TRIGGER IF EXISTS set_org_id_data_imports ON data_imports;
        CREATE TRIGGER set_org_id_data_imports
            BEFORE INSERT ON data_imports
            FOR EACH ROW
            EXECUTE FUNCTION set_current_organization_id();
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'api_keys') THEN
        DROP TRIGGER IF EXISTS set_org_id_api_keys ON api_keys;
        CREATE TRIGGER set_org_id_api_keys
            BEFORE INSERT ON api_keys
            FOR EACH ROW
            EXECUTE FUNCTION set_current_organization_id();
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'audit_logs') THEN
        DROP TRIGGER IF EXISTS set_org_id_audit_logs ON audit_logs;
        CREATE TRIGGER set_org_id_audit_logs
            BEFORE INSERT ON audit_logs
            FOR EACH ROW
            EXECUTE FUNCTION set_current_organization_id();
    END IF;
END $$;

-- 4. Benutzer ohne Organisation - Spezielle Behandlung
-- Funktion um zu prüfen ob Benutzer einer Organisation angehört
CREATE OR REPLACE FUNCTION user_has_organization()
RETURNS BOOLEAN AS $$
DECLARE
    has_org BOOLEAN;
BEGIN
    SELECT (organization_id IS NOT NULL) INTO has_org
    FROM users 
    WHERE id = auth.uid()
    AND is_active = true;
    
    RETURN COALESCE(has_org, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Organization Join Requests Tabelle
CREATE TABLE IF NOT EXISTS organization_join_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    organization_id UUID REFERENCES organizations(id) NOT NULL,
    requested_by_email TEXT NOT NULL,
    message TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewed_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, organization_id)
);

-- RLS für Join Requests
ALTER TABLE organization_join_requests ENABLE ROW LEVEL SECURITY;

-- Benutzer können ihre eigenen Anfragen sehen
CREATE POLICY "Users can see their own join requests" ON organization_join_requests
    FOR SELECT USING (user_id = auth.uid());

-- Benutzer können Anfragen stellen
CREATE POLICY "Users can create join requests" ON organization_join_requests
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Org-Admins können Anfragen für ihre Organisation sehen und bearbeiten
CREATE POLICY "Org admins can manage join requests" ON organization_join_requests
    FOR ALL USING (
        organization_id IN (
            SELECT organization_id 
            FROM users 
            WHERE id = auth.uid() 
            AND role IN ('org_admin', 'super_admin')
        )
    );

-- 6. Hilfsfunktionen für Frontend
-- Funktion um verfügbare Organisationen für Join-Requests zu laden
CREATE OR REPLACE FUNCTION get_available_organizations_for_join()
RETURNS TABLE (
    id UUID,
    name TEXT,
    description TEXT,
    industry TEXT,
    website TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        o.id,
        o.name,
        o.description,
        o.industry,
        o.website
    FROM organizations o
    WHERE o.is_active = true
    AND o.id NOT IN (
        -- Bereits Mitglied
        SELECT organization_id 
        FROM users 
        WHERE id = auth.uid() 
        AND organization_id IS NOT NULL
        UNION
        -- Bereits beantragt
        SELECT organization_id 
        FROM organization_join_requests 
        WHERE user_id = auth.uid() 
        AND status = 'pending'
    )
    ORDER BY o.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Funktion um aktuelle Organisation des Benutzers mit Details zu holen
CREATE OR REPLACE FUNCTION get_current_user_organization()
RETURNS TABLE (
    id UUID,
    name TEXT,
    description TEXT,
    industry TEXT,
    website TEXT,
    logo_url TEXT,
    subscription_plan TEXT,
    is_active BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        o.id,
        o.name,
        o.description,
        o.industry,
        o.website,
        o.logo_url,
        o.subscription_plan,
        o.is_active
    FROM organizations o
    INNER JOIN users u ON u.organization_id = o.id
    WHERE u.id = auth.uid()
    AND u.is_active = true
    AND o.is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Funktion um zu prüfen ob der aktuelle Benutzer Super-Admin ist
CREATE OR REPLACE FUNCTION is_current_user_super_admin()
RETURNS BOOLEAN AS $$
DECLARE
    user_role TEXT;
BEGIN
    SELECT role INTO user_role
    FROM users 
    WHERE id = auth.uid()
    AND is_active = true;
    
    RETURN (user_role = 'super_admin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Funktion um verfügbare Organisationen für Join-Requests zu laden (für die Navigation)
CREATE OR REPLACE FUNCTION get_available_organizations_for_join()
RETURNS TABLE (
    id UUID,
    name TEXT,
    description TEXT,
    industry TEXT,
    website TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        o.id,
        o.name,
        o.description,
        o.industry,
        o.website
    FROM organizations o
    WHERE o.is_active = true
    AND o.id NOT IN (
        -- Bereits Mitglied
        SELECT organization_id 
        FROM users 
        WHERE id = auth.uid() 
        AND organization_id IS NOT NULL
        UNION
        -- Bereits beantragt
        SELECT organization_id 
        FROM organization_join_requests 
        WHERE user_id = auth.uid() 
        AND status = 'pending'
    )
    ORDER BY o.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Funktion um Join-Requests des aktuellen Benutzers zu holen
CREATE OR REPLACE FUNCTION get_user_join_requests()
RETURNS TABLE (
    id UUID,
    organization_id UUID,
    status TEXT,
    message TEXT,
    requested_at TIMESTAMP WITH TIME ZONE,
    organization_name TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        r.id,
        r.organization_id,
        r.status,
        r.message,
        r.requested_at,
        o.name as organization_name
    FROM organization_join_requests r
    LEFT JOIN organizations o ON o.id = r.organization_id
    WHERE r.user_id = auth.uid()
    ORDER BY r.requested_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Funktion um Join-Request zu erstellen
CREATE OR REPLACE FUNCTION create_join_request(
    org_id UUID,
    req_message TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    request_id UUID;
    user_email TEXT;
BEGIN
    -- Get user email
    SELECT email INTO user_email FROM auth.users WHERE id = auth.uid();
    
    -- Create join request
    INSERT INTO organization_join_requests (
        user_id,
        organization_id,
        requested_by_email,
        message,
        status
    ) VALUES (
        auth.uid(),
        org_id,
        user_email,
        req_message,
        'pending'
    ) RETURNING id INTO request_id;
    
    RETURN request_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Test der RLS Policies
SELECT 'Multi-Tenant Setup completed successfully!' as status;
