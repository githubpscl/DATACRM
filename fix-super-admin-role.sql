-- ===============================================
-- SOFORT-FIX: testdatacrmpascal@gmail.com als Super Admin setzen
-- ===============================================

-- 1. Aktuellen Status zeigen
SELECT 
    email, 
    role, 
    organization_id, 
    is_active,
    created_at
FROM users 
WHERE email = 'testdatacrmpascal@gmail.com';

-- 2. Benutzer als Super Admin setzen
UPDATE users 
SET 
    role = 'super_admin',
    organization_id = NULL,
    is_active = true
WHERE email = 'testdatacrmpascal@gmail.com';

-- 3. Bestätigung - zeige den aktualisierten Benutzer
SELECT 
    email, 
    role, 
    organization_id, 
    is_active,
    updated_at
FROM users 
WHERE email = 'testdatacrmpascal@gmail.com';

-- 4. Zeige alle Super Admins
SELECT 'Alle Super Admins:' as info;
SELECT 
    email, 
    role, 
    organization_id,
    is_active
FROM users 
WHERE role = 'super_admin'
ORDER BY created_at;
