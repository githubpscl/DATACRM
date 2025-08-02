-- ===============================================
-- EINFACHE ORGANISATION ABFRAGE - DEBUGGING
-- Teste manuell die vorhandenen Tabellen und Daten
-- ===============================================

-- 1. Prüfe, welche Tabellen existieren
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('users', 'organizations')
ORDER BY table_name;

-- 2. Prüfe Spalten der users Tabelle
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Prüfe Spalten der organizations Tabelle
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'organizations' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4. Prüfe den spezifischen Benutzer orgkontroller@gmail.com
SELECT 
    id,
    email,
    organization_id,
    role,
    is_active,
    created_at
FROM users 
WHERE email = 'orgkontroller@gmail.com';

-- 5. Falls organization_id vorhanden ist, zeige die Organisation
SELECT 
    o.id,
    o.name,
    o.email as org_email,
    o.is_active,
    u.email as user_email
FROM organizations o
JOIN users u ON u.organization_id = o.id
WHERE u.email = 'orgkontroller@gmail.com';

-- 6. Alle Organisationen anzeigen
SELECT 
    id,
    name,
    email,
    is_active,
    created_at
FROM organizations
ORDER BY created_at;

-- 7. Teste eine einfache RPC-Funktion
-- Falls diese Funktion nicht existiert, erstelle sie:
/*
CREATE OR REPLACE FUNCTION test_user_org(user_email TEXT)
RETURNS TABLE (
    user_id UUID,
    user_email_result TEXT,
    org_id UUID,
    org_name TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id,
        u.email,
        o.id,
        o.name
    FROM users u
    LEFT JOIN organizations o ON u.organization_id = o.id
    WHERE u.email = user_email
      AND u.is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
*/

-- Teste die Funktion:
-- SELECT * FROM test_user_org('orgkontroller@gmail.com');
