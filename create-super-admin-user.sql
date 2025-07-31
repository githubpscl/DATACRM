-- ===============================================
-- SUPER ADMIN SETUP - Benutzer als Super Admin setzen
-- ===============================================

-- 1. Zeige alle aktuellen Benutzer
SELECT id, email, name, role, organization_id, created_at 
FROM users 
ORDER BY created_at DESC;

-- 2. Setze einen spezifischen Benutzer als Super Admin
-- WICHTIG: Ersetzen Sie 'ihre-email@example.com' mit Ihrer tatsächlichen E-Mail-Adresse
UPDATE users 
SET role = 'super_admin', 
    organization_id = NULL
WHERE email = 'ihre-email@example.com';

-- 3. Bestätigung - zeige den aktualisierten Benutzer
SELECT id, email, name, role, organization_id 
FROM users 
WHERE role = 'super_admin';

-- 4. Alternative: Füge einen neuen Super Admin hinzu (falls Benutzer noch nicht existiert)
-- WICHTIG: Ersetzen Sie die E-Mail-Adresse mit Ihrer eigenen
/*
INSERT INTO users (email, name, role, organization_id) 
VALUES ('ihre-email@example.com', 'Super Administrator', 'super_admin', NULL);
*/

-- 5. Zeige alle Super Admins
SELECT 'Super Admins:' as info;
SELECT email, name, role, created_at 
FROM users 
WHERE role = 'super_admin' 
   OR email = 'testdatacrmpascal@gmail.com';

-- ANLEITUNG:
-- 1. Ersetzen Sie 'ihre-email@example.com' mit Ihrer tatsächlichen E-Mail
-- 2. Führen Sie das Script in Supabase SQL Editor aus
-- 3. Loggen Sie sich mit dieser E-Mail in die Anwendung ein
-- 4. Sie sollten nun Zugriff auf das Super Admin Dashboard haben
