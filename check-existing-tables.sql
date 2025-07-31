-- ===============================================
-- CHECK EXISTING TABLES IN SUPABASE
-- Run this first to see what tables already exist
-- ===============================================

-- Check all existing tables
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- Check specific tables that might conflict
SELECT 
    CASE 
        WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'customers') 
        THEN 'customers table EXISTS - needs migration'
        ELSE 'customers table does NOT exist - safe to create'
    END as customers_status,
    
    CASE 
        WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users') 
        THEN 'users table EXISTS - needs migration'
        ELSE 'users table does NOT exist - safe to create'
    END as users_status,
    
    CASE 
        WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'organizations') 
        THEN 'organizations table EXISTS - needs migration'
        ELSE 'organizations table does NOT exist - safe to create'
    END as organizations_status;

-- Count existing data in tables (if they exist)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'customers') THEN
        RAISE NOTICE 'customers table has % rows', (SELECT count(*) FROM customers);
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users') THEN
        RAISE NOTICE 'users table has % rows', (SELECT count(*) FROM users);
    END IF;
END $$;
