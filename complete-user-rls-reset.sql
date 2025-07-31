-- ===============================================
-- VOLLSTÄNDIGE RLS RESET FÜR USERS TABELLE
-- ===============================================

-- SCHRITT 1: Alle bestehenden Policies für users tabelle anzeigen
SELECT 
    'AKTUELLE POLICIES' as info,
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'users';

-- SCHRITT 2: RLS temporär deaktivieren für users
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- SCHRITT 3: Alle Policies löschen
DROP POLICY IF EXISTS "Users can view users in their organization" ON users;
DROP POLICY IF EXISTS "Super admins and org admins can create users" ON users;
DROP POLICY IF EXISTS "Users can create users" ON users;
DROP POLICY IF EXISTS "Allow user registration and admin user creation" ON users;
DROP POLICY IF EXISTS "Allow anonymous registration" ON users;
DROP POLICY IF EXISTS "Allow all user creation" ON users;
DROP POLICY IF EXISTS "Users can update themselves and admins can update org users" ON users;

-- SCHRITT 4: RLS wieder aktivieren
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- SCHRITT 5: Nur die absolut notwendigen Policies erstellen
-- Policy für SELECT (Benutzer anzeigen)
CREATE POLICY "users_select_policy" ON users
    FOR SELECT USING (
        -- Benutzer können sich selbst sehen
        id = auth.uid()
        OR
        -- Super Admins können alle sehen
        auth.uid() IN (
            SELECT id FROM users WHERE role = 'super_admin'
        )
    );

-- Policy für INSERT (neue Benutzer erstellen) - OHNE Rekursion
CREATE POLICY "users_insert_policy" ON users
    FOR INSERT WITH CHECK (
        -- Erlaube INSERT für neue Registrierungen (wenn auth.uid() = id)
        id = auth.uid()
    );

-- Policy für UPDATE (Benutzer aktualisieren)
CREATE POLICY "users_update_policy" ON users
    FOR UPDATE USING (
        -- Benutzer können sich selbst aktualisieren
        id = auth.uid()
    );

-- SCHRITT 6: Überprüfung der neuen Policies
SELECT 
    'NEUE POLICIES' as info,
    policyname,
    cmd,
    with_check
FROM pg_policies 
WHERE tablename = 'users'
ORDER BY cmd, policyname;
