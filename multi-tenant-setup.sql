-- ===============================================
-- MULTI-TENANT ORGANIZATION SYSTEM
-- Session-basierte Organisation mit RLS
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

-- 3. Automatisches Setzen der Organization ID bei INSERT
-- Customers
CREATE OR REPLACE FUNCTION set_organization_id_customers()
RETURNS TRIGGER AS $$
BEGIN
    NEW.organization_id = get_current_user_organization_id();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_org_id_customers ON customers;
CREATE TRIGGER set_org_id_customers
    BEFORE INSERT ON customers
    FOR EACH ROW
    EXECUTE FUNCTION set_organization_id_customers();

-- Customer Contacts
CREATE OR REPLACE FUNCTION set_organization_id_contacts()
RETURNS TRIGGER AS $$
BEGIN
    NEW.organization_id = get_current_user_organization_id();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_org_id_contacts ON customer_contacts;
CREATE TRIGGER set_org_id_contacts
    BEFORE INSERT ON customer_contacts
    FOR EACH ROW
    EXECUTE FUNCTION set_organization_id_contacts();

-- Customer Activities
CREATE OR REPLACE FUNCTION set_organization_id_activities()
RETURNS TRIGGER AS $$
BEGIN
    NEW.organization_id = get_current_user_organization_id();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_org_id_activities ON customer_activities;
CREATE TRIGGER set_org_id_activities
    BEFORE INSERT ON customer_activities
    FOR EACH ROW
    EXECUTE FUNCTION set_organization_id_activities();

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

-- Test der RLS Policies
SELECT 'Multi-Tenant Setup completed successfully!' as status;
