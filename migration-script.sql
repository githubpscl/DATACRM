-- ===============================================
-- DATACRM - SAFE MIGRATION SCRIPT
-- This script safely migrates from existing schema to new schema
-- Version: 2.0
-- Date: 2025-07-31
-- ===============================================

-- Step 1: BACKUP existing data (if any tables exist)
-- Uncomment these lines if you want to backup existing data:

/*
-- Backup existing customers table (if exists)
CREATE TABLE customers_backup AS SELECT * FROM customers;

-- Backup existing users table (if exists) 
CREATE TABLE users_backup AS SELECT * FROM users;

-- Backup other tables as needed...
*/

-- Step 2: DROP existing tables (CAREFUL! This deletes data)
-- Uncomment ONLY if you want to completely replace existing tables:

/*
-- Drop existing tables in correct order (respecting foreign keys)
DROP TABLE IF EXISTS customer_activities CASCADE;
DROP TABLE IF EXISTS customer_contacts CASCADE; 
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS organizations CASCADE;

-- Drop existing views if they exist
DROP VIEW IF EXISTS customer_overview CASCADE;
DROP VIEW IF EXISTS user_overview CASCADE;

-- Drop existing functions
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS generate_customer_number(UUID) CASCADE;
DROP FUNCTION IF EXISTS set_customer_number() CASCADE;
*/

-- Step 3: ALTERNATIVE - Rename existing tables instead of dropping
-- This is SAFER as it preserves your data:

DO $$
BEGIN
    -- Rename existing tables to _old suffix
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'customers') THEN
        ALTER TABLE customers RENAME TO customers_old;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users') THEN
        ALTER TABLE users RENAME TO users_old;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'organizations') THEN
        ALTER TABLE organizations RENAME TO organizations_old;
    END IF;
    
    -- Add more tables as needed...
END $$;

-- Step 4: Now run the new schema
-- Copy and paste the entire database-schema-comprehensive.sql content here
-- OR run it as a separate script after this migration

-- ===============================================
-- MANUAL MIGRATION STEPS AFTER SCHEMA CREATION
-- ===============================================

/*
-- Step 5: Migrate existing data (run AFTER new schema is created)

-- Example: Migrate users from old table to new table
INSERT INTO users (
    id, 
    email, 
    first_name, 
    last_name,
    created_at,
    is_active
)
SELECT 
    id,
    email,
    COALESCE(first_name, split_part(email, '@', 1)), -- Use email prefix if no first_name
    last_name,
    created_at,
    COALESCE(is_active, true)
FROM users_old 
WHERE email IS NOT NULL
ON CONFLICT (id) DO NOTHING; -- Avoid duplicates

-- Example: Migrate customers from old table
INSERT INTO customers (
    id,
    organization_id, -- You'll need to set this manually or use a default
    customer_type,
    first_name,
    last_name,
    company_name,
    email,
    phone,
    created_at,
    is_active
)
SELECT 
    id,
    '00000000-0000-0000-0000-000000000000'::uuid, -- Default to system org
    CASE 
        WHEN company_name IS NOT NULL THEN 'company'
        ELSE 'person'
    END,
    first_name,
    last_name,
    company_name,
    email,
    phone,
    created_at,
    COALESCE(is_active, true)
FROM customers_old
WHERE id IS NOT NULL
ON CONFLICT (id) DO NOTHING;

-- Step 6: Verify migration
SELECT 'users_old' as table_name, count(*) as old_count FROM users_old
UNION ALL
SELECT 'users_new' as table_name, count(*) as new_count FROM users
UNION ALL  
SELECT 'customers_old' as table_name, count(*) as old_count FROM customers_old
UNION ALL
SELECT 'customers_new' as table_name, count(*) as new_count FROM customers;

-- Step 7: After successful verification, drop old tables
-- DROP TABLE users_old;
-- DROP TABLE customers_old;
-- etc.
*/

-- ===============================================
-- QUICK SETUP FOR FRESH DATABASE
-- ===============================================

-- If this is a completely fresh database, just run:
-- 1. This migration script (will do nothing if no existing tables)
-- 2. The main database-schema-comprehensive.sql script
-- 3. You're done!
