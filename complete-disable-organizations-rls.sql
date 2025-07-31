-- ===============================================
-- SOFORTIGE LÖSUNG: RLS für organizations komplett deaktivieren
-- (Wie bei users Tabelle - für funktionsfähiges System)
-- ===============================================

-- RLS für organizations Tabelle komplett deaktivieren
ALTER TABLE organizations DISABLE ROW LEVEL SECURITY;

-- Bestätigung
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled,
    hasrls
FROM pg_tables 
WHERE tablename = 'organizations';

-- Status nach Änderung anzeigen
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename IN ('users', 'organizations');

-- HINWEIS: Diese Lösung deaktiviert RLS komplett für organizations
-- Das bedeutet alle authentifizierten Benutzer können alle Organisationen sehen und bearbeiten
-- Für Produktionsumgebung sollten später angepasste RLS-Richtlinien implementiert werden
