-- ===============================================
-- NOTFALL-LÖSUNG: RLS für users komplett deaktivieren
-- (Temporär für Testing der Registrierung)
-- ===============================================

-- RLS für users Tabelle komplett deaktivieren
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Bestätigung
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'users';

-- WICHTIG: Nach erfolgreichem Test können Sie RLS wieder aktivieren mit:
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
