-- ===============================================
-- MANUELL SUPER ADMIN ERSTELLEN
-- Für testdatacrmpascal@gmail.com
-- 
-- WICHTIG: Bei normaler Registrierung werden Benutzer als 'user' erstellt
-- Organisationen werden nur von Super Admins in den Einstellungen erstellt
-- ===============================================

-- Zuerst prüfen, ob der Benutzer in auth.users existiert
SELECT 
    'AUTH.USERS CHECK' as info,
    id,
    email,
    created_at
FROM auth.users 
WHERE email = 'testdatacrmpascal@gmail.com';

-- SCHRITT 1: Super Admin manuell in users Tabelle einfügen
-- Dies fügt den Benutzer mit super_admin Rolle hinzu

INSERT INTO users (
    id,
    email,
    first_name,
    last_name,
    display_name,
    role,
    is_active,
    is_verified,
    created_at,
    updated_at
) 
SELECT 
    au.id,
    au.email,
    'Pascal' as first_name,
    'Test' as last_name,
    'Pascal Test' as display_name,
    'super_admin' as role,  -- Super Admin kann Organisationen verwalten
    true as is_active,
    true as is_verified,
    NOW() as created_at,
    NOW() as updated_at
FROM auth.users au 
WHERE au.email = 'testdatacrmpascal@gmail.com'
AND NOT EXISTS (
    SELECT 1 FROM users u WHERE u.id = au.id
);

-- SCHRITT 2: Überprüfen, ob der Benutzer erfolgreich eingefügt wurde
SELECT 
    'USERS TABLE CHECK' as info,
    id,
    email,
    first_name,
    last_name,
    role,
    organization_id,
    is_active,
    created_at
FROM users 
WHERE email = 'testdatacrmpascal@gmail.com';

-- HINWEIS: Super Admins haben KEINE organization_id
-- Sie können alle Organisationen verwalten und neue erstellen
