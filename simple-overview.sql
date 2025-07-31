-- ===============================================
-- EINFACHE TABELLEN ÜBERSICHT (ohne problematische Spalten)
-- ===============================================

-- Organizations - nur Grunddaten
SELECT '=== ORGANIZATIONS ===' as info;
SELECT id, name, email, subscription_plan, created_at FROM organizations;

-- Users - nur Grunddaten  
SELECT '=== USERS ===' as info;
SELECT id, email, first_name, last_name, role, organization_id, created_at FROM users;

-- Customers - nur sichere Spalten
SELECT '=== CUSTOMERS ===' as info;
SELECT 
    id, 
    customer_type, 
    email, 
    first_name, 
    last_name, 
    company_name,
    customer_status,
    created_at 
FROM customers;

-- Customer Contacts
SELECT '=== CUSTOMER CONTACTS ===' as info;
SELECT id, customer_id, first_name, last_name, email, is_primary, created_at 
FROM customer_contacts;

-- Customer Activities  
SELECT '=== CUSTOMER ACTIVITIES ===' as info;
SELECT id, customer_id, activity_type, title, status, created_at 
FROM customer_activities 
LIMIT 20;

-- Schnelle Statistik
SELECT '=== STATISTIK ===' as info;
SELECT 
    'Organizations' as table_name, COUNT(*) as count FROM organizations
UNION ALL
SELECT 'Users', COUNT(*) FROM users  
UNION ALL
SELECT 'Customers', COUNT(*) FROM customers
UNION ALL  
SELECT 'Contacts', COUNT(*) FROM customer_contacts
UNION ALL
SELECT 'Activities', COUNT(*) FROM customer_activities;
