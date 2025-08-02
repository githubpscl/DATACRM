-- ===============================================
-- ALTERNATIVE LÖSUNG: Falls die organizations Tabelle andere Spalten hat
-- ===============================================

-- Zuerst prüfen, welche Spalten tatsächlich existieren
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'organizations' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Zeige auch users Tabelle
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Prüfe, ob der Benutzer orgkontroller@gmail.com eine organization_id hat
SELECT 
    id,
    email,
    first_name,
    last_name,
    role,
    organization_id,
    is_active
FROM users 
WHERE email = 'orgkontroller@gmail.com';

-- Erstelle eine einfachere Version der Funktion mit nur den garantiert existierenden Spalten
CREATE OR REPLACE FUNCTION get_current_user_organization()
RETURNS TABLE (
    id UUID,
    name TEXT
) AS $$
BEGIN
    -- Minimal funktionsfähige Version
    RETURN QUERY
    SELECT 
        o.id,
        o.name
    FROM organizations o
    INNER JOIN users u ON u.organization_id = o.id
    WHERE u.id = auth.uid()
      AND u.is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Alternative: Falls JOIN nicht funktioniert, nutze Subquery
CREATE OR REPLACE FUNCTION get_current_user_organization_alt()
RETURNS TABLE (
    id UUID,
    name TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        o.id,
        o.name
    FROM organizations o
    WHERE o.id = (
        SELECT organization_id 
        FROM users 
        WHERE id = auth.uid() 
          AND is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
