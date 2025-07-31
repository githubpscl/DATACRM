-- ===============================================
-- NOTFALL: Super Admin für testdatacrmpascal@gmail.com garantieren
-- ===============================================

-- Schritt 1: Benutzer komplett neu aufsetzen
DELETE FROM users WHERE email = 'testdatacrmpascal@gmail.com';

-- Schritt 2: Neuen Super Admin erstellen
INSERT INTO users (
    email, 
    first_name, 
    last_name, 
    role, 
    organization_id,
    is_active,
    is_verified,
    email_verified_at,
    created_at,
    updated_at
) VALUES (
    'testdatacrmpascal@gmail.com',
    'Pascal',
    'Super Admin',
    'super_admin',
    NULL,
    true,
    true,
    NOW(),
    NOW(),
    NOW()
);

-- Schritt 3: Bestätigung
SELECT 
    'Neuer Super Admin erstellt:' as status,
    email, 
    role, 
    is_active,
    is_verified
FROM users 
WHERE email = 'testdatacrmpascal@gmail.com';
