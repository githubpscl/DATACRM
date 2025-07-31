-- ===============================================
-- DEBUG: Super Admin Zugriff analysieren
-- ===============================================

-- 1. Zeige alle Benutzer mit Super Admin Rolle
SELECT 
    'Super Admins in der Datenbank:' as info,
    email, 
    role, 
    organization_id,
    is_active,
    email_verified_at,
    created_at
FROM users 
WHERE role = 'super_admin'
ORDER BY created_at;

-- 2. Zeige den spezifischen testdatacrmpascal Benutzer
SELECT 
    'testdatacrmpascal@gmail.com Status:' as info,
    email, 
    role, 
    organization_id,
    is_active,
    is_verified,
    email_verified_at,
    created_at,
    updated_at
FROM users 
WHERE email = 'testdatacrmpascal@gmail.com';

-- 3. Prüfe auth.users Tabelle (Supabase Auth)
SELECT 
    'Supabase Auth Benutzer:' as info,
    email,
    email_confirmed_at,
    created_at,
    last_sign_in_at
FROM auth.users 
WHERE email = 'testdatacrmpascal@gmail.com';

-- 4. Erstelle einen funktionsfähigen Super Admin
-- Falls der Benutzer existiert, aktualisiere ihn
UPDATE users 
SET 
    role = 'super_admin',
    organization_id = NULL,
    is_active = true,
    is_verified = true,
    email_verified_at = NOW()
WHERE email = 'testdatacrmpascal@gmail.com';

-- 5. Falls der Benutzer nicht in auth.users existiert, zeige Anleitung
SELECT 
    'WICHTIG: Falls Sie sich nicht anmelden können:' as hinweis,
    'Registrieren Sie sich zuerst normal über die Anmeldung' as schritt1,
    'Dann führen Sie das UPDATE aus um Super Admin zu werden' as schritt2;

-- 6. Zeige finale Bestätigung
SELECT 
    'Nach Update - testdatacrmpascal Status:' as info,
    email, 
    role, 
    organization_id,
    is_active,
    is_verified
FROM users 
WHERE email = 'testdatacrmpascal@gmail.com';
