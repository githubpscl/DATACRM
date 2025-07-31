-- ===============================================
-- NOTFALL-LÖSUNG: RLS für organizations temporär deaktivieren
-- (Für Testing der Organisationserstellung)
-- ===============================================

-- RLS für organizations Tabelle temporär deaktivieren
ALTER TABLE organizations DISABLE ROW LEVEL SECURITY;

-- Bestätigung
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'organizations';

-- WICHTIG: Nach erfolgreichem Test können Sie RLS wieder aktivieren mit:
-- ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- Und dann müssen die RLS-Richtlinien korrigiert werden, da sie auf 
-- die users Tabelle verweisen, für die RLS deaktiviert ist
