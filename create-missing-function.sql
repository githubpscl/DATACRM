-- ===============================================
-- FEHLENDE FUNKTION: get_current_user_organization
-- Diese Funktion fehlt in der Datenbank und wird von der Anwendung benötigt
-- ===============================================

-- Die Anwendung ruft get_current_user_organization() auf, aber nur get_current_user_organization_id() existiert
-- Erstelle die fehlende Funktion, die die vollständigen Organisationsdaten zurückgibt

CREATE OR REPLACE FUNCTION get_current_user_organization()
RETURNS TABLE (
    id UUID,
    name TEXT,
    slug TEXT,
    email TEXT,
    domain TEXT,
    subscription_plan TEXT,
    is_active BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    -- Hole die Organisation des aktuellen Benutzers
    RETURN QUERY
    SELECT 
        o.id,
        o.name,
        o.slug,
        o.email,
        o.domain,
        o.subscription_plan,
        o.is_active,
        o.created_at,
        o.updated_at
    FROM organizations o
    INNER JOIN users u ON u.organization_id = o.id
    WHERE u.id = auth.uid()
      AND u.is_active = true
      AND o.is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Teste die Funktion
-- SELECT * FROM get_current_user_organization();

-- Zeige alle verfügbaren Funktionen zur Bestätigung
SELECT 
    routine_name,
    routine_type,
    data_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name LIKE '%organization%'
ORDER BY routine_name;
