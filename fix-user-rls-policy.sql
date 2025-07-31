-- ===============================================
-- RLS POLICY FIX - Users INSERT Endlosschleife beheben
-- ===============================================

-- Zuerst die problematische Policy löschen
DROP POLICY IF EXISTS "Super admins and org admins can create users" ON users;
DROP POLICY IF EXISTS "Users can create users" ON users;

-- Neue, sichere INSERT Policy für users
-- Diese Policy erlaubt es jedem, sich selbst zu registrieren
-- Zusätzlich können Super Admins und Org Admins andere Benutzer erstellen
CREATE POLICY "Allow user registration and admin user creation" ON users
    FOR INSERT WITH CHECK (
        -- Erlaube Selbstregistrierung (wenn der einzufügende Benutzer der aktuelle auth.uid() ist)
        id = auth.uid() 
        OR 
        -- Oder erlaube es bestehenden Super Admins/Org Admins (aber ohne Rekursion)
        EXISTS (
            SELECT 1 FROM users existing_user
            WHERE existing_user.id = auth.uid() 
            AND existing_user.role IN ('super_admin', 'org_admin')
        )
    );

-- Zusätzlich: Policy für anonyme Registrierung (falls auth.uid() null ist während der Registrierung)
-- Dies ist ein Fallback für den Fall, dass Supabase auth.uid() während der Registrierung noch nicht verfügbar ist
CREATE POLICY "Allow anonymous registration" ON users
    FOR INSERT WITH CHECK (
        -- Erlaube INSERT wenn kein authentifizierter Benutzer vorhanden ist (Registrierung)
        auth.uid() IS NULL
        OR 
        -- Oder wenn es sich um eine Selbstregistrierung handelt
        id = auth.uid()
    );

-- Alternative: Einfache Policy die alle Registrierungen erlaubt
-- Wenn die obigen Policies nicht funktionieren, können Sie diese verwenden:
/*
DROP POLICY IF EXISTS "Allow user registration and admin user creation" ON users;
DROP POLICY IF EXISTS "Allow anonymous registration" ON users;

CREATE POLICY "Allow user creation" ON users
    FOR INSERT WITH CHECK (true);
*/

-- Überprüfung der aktuellen Policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'users' 
ORDER BY policyname;
