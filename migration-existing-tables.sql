-- ===============================================
-- DATACRM - SPECIFIC MIGRATION FOR EXISTING TABLES
-- All main tables exist and need safe migration
-- Version: 2.0
-- Date: 2025-07-31
-- ===============================================

-- STEP 1: Check current data counts before migration
SELECT 
    'Before Migration - Data Count Overview' as status,
    (SELECT count(*) FROM customers) as customers_count,
    (SELECT count(*) FROM users) as users_count,
    (SELECT count(*) FROM organizations) as organizations_count;

-- STEP 2: Create backup tables with current data
CREATE TABLE customers_backup_20250731 AS SELECT * FROM customers;
CREATE TABLE users_backup_20250731 AS SELECT * FROM users;
CREATE TABLE organizations_backup_20250731 AS SELECT * FROM organizations;

-- STEP 3: Show backup confirmation
SELECT 
    'Backup Created Successfully' as status,
    (SELECT count(*) FROM customers_backup_20250731) as customers_backup_count,
    (SELECT count(*) FROM users_backup_20250731) as users_backup_count,
    (SELECT count(*) FROM organizations_backup_20250731) as organizations_backup_count;

-- STEP 4: Disable Row Level Security temporarily (if enabled)
ALTER TABLE customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY; 
ALTER TABLE organizations DISABLE ROW LEVEL SECURITY;

-- STEP 5: Drop foreign key constraints and dependent objects
-- First, drop any views that depend on these tables
DROP VIEW IF EXISTS customer_overview CASCADE;
DROP VIEW IF EXISTS user_overview CASCADE;

-- Drop triggers (if they exist)
DROP TRIGGER IF EXISTS update_customers_updated_at ON customers;
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
DROP TRIGGER IF EXISTS update_organizations_updated_at ON organizations;
DROP TRIGGER IF EXISTS set_customer_number_trigger ON customers;

-- Drop functions (if they exist)
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS generate_customer_number(UUID) CASCADE;
DROP FUNCTION IF EXISTS set_customer_number() CASCADE;

-- STEP 6: Drop existing tables in correct order (foreign key dependencies)
DROP TABLE IF EXISTS customer_activities CASCADE;
DROP TABLE IF EXISTS customer_contacts CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS organizations CASCADE;

-- STEP 7: Confirmation that old tables are dropped
SELECT 'Old tables dropped successfully. Ready for new schema.' as migration_status;

-- ===============================================
-- STEP 8: NOW RUN THE NEW SCHEMA
-- Copy and paste the ENTIRE content of database-schema-comprehensive.sql
-- OR run it as a separate script after this migration
-- ===============================================

-- AFTER you've run the new schema, continue with STEP 9 below...

-- ===============================================
-- STEP 9: DATA MIGRATION (Run AFTER new schema is created)
-- ===============================================

/*
-- Migrate organizations first (no dependencies)
INSERT INTO organizations (
    id,
    name,
    slug,
    legal_name,
    email,
    phone,
    website,
    subscription_plan,
    is_active,
    created_at,
    updated_at
)
SELECT 
    id,
    name,
    -- Generate slug from name if not exists
    LOWER(REGEXP_REPLACE(REGEXP_REPLACE(name, '[^a-zA-Z0-9\s]', '', 'g'), '\s+', '-', 'g')),
    COALESCE(legal_name, name), -- Use name if legal_name is null
    email,
    phone,
    website,
    COALESCE(subscription_plan, 'professional'), -- Default to professional
    COALESCE(is_active, true),
    COALESCE(created_at, NOW()),
    COALESCE(updated_at, NOW())
FROM organizations_backup_20250731
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    email = EXCLUDED.email,
    updated_at = NOW();

-- Migrate users (depends on organizations)
INSERT INTO users (
    id,
    organization_id,
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
    id,
    organization_id,
    email,
    first_name,
    last_name,
    COALESCE(display_name, CONCAT(COALESCE(first_name, ''), ' ', COALESCE(last_name, ''))),
    COALESCE(role, 'user'), -- Default role
    COALESCE(is_active, true),
    COALESCE(is_verified, false),
    COALESCE(created_at, NOW()),
    COALESCE(updated_at, NOW())
FROM users_backup_20250731
WHERE email IS NOT NULL
ON CONFLICT (id) DO UPDATE SET
    organization_id = EXCLUDED.organization_id,
    email = EXCLUDED.email,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    updated_at = NOW();

-- Migrate customers (depends on organizations and users)
INSERT INTO customers (
    id,
    organization_id,
    customer_type,
    first_name,
    last_name,
    company_name,
    email,
    phone,
    mobile,
    street,
    postal_code,
    city,
    country,
    customer_status,
    assigned_to,
    is_active,
    created_at,
    updated_at
)
SELECT 
    id,
    organization_id,
    -- Determine customer type based on available data
    CASE 
        WHEN company_name IS NOT NULL AND company_name != '' THEN 'company'
        ELSE 'person'
    END,
    first_name,
    last_name,
    company_name,
    email,
    phone,
    mobile,
    street,
    postal_code,
    city,
    COALESCE(country, 'Deutschland'),
    COALESCE(customer_status, 'prospect'),
    assigned_to,
    COALESCE(is_active, true),
    COALESCE(created_at, NOW()),
    COALESCE(updated_at, NOW())
FROM customers_backup_20250731
ON CONFLICT (id) DO UPDATE SET
    organization_id = EXCLUDED.organization_id,
    email = EXCLUDED.email,
    customer_status = EXCLUDED.customer_status,
    updated_at = NOW();

-- STEP 10: Verification - Compare data counts
SELECT 
    'Migration Verification' as check_type,
    'organizations' as table_name,
    (SELECT count(*) FROM organizations_backup_20250731) as original_count,
    (SELECT count(*) FROM organizations) as migrated_count,
    CASE 
        WHEN (SELECT count(*) FROM organizations) >= (SELECT count(*) FROM organizations_backup_20250731) 
        THEN '✅ Success' 
        ELSE '❌ Data loss detected' 
    END as status
UNION ALL
SELECT 
    'Migration Verification',
    'users',
    (SELECT count(*) FROM users_backup_20250731),
    (SELECT count(*) FROM users),
    CASE 
        WHEN (SELECT count(*) FROM users) >= (SELECT count(*) FROM users_backup_20250731) 
        THEN '✅ Success' 
        ELSE '❌ Data loss detected' 
    END
UNION ALL
SELECT 
    'Migration Verification',
    'customers',
    (SELECT count(*) FROM customers_backup_20250731),
    (SELECT count(*) FROM customers),
    CASE 
        WHEN (SELECT count(*) FROM customers) >= (SELECT count(*) FROM customers_backup_20250731) 
        THEN '✅ Success' 
        ELSE '❌ Data loss detected' 
    END;

-- STEP 11: Test the new schema functionality
-- Test customer number generation
INSERT INTO customers (
    organization_id,
    customer_type,
    first_name,
    last_name,
    email
) VALUES (
    (SELECT id FROM organizations LIMIT 1),
    'person',
    'Test',
    'Migration',
    'test@migration.com'
);

-- Check if customer number was generated
SELECT 
    'Customer Number Test' as test_type,
    customer_number,
    CASE 
        WHEN customer_number LIKE 'KD%' THEN '✅ Auto-generation works'
        ELSE '❌ Auto-generation failed'
    END as result
FROM customers 
WHERE email = 'test@migration.com';

-- Clean up test data
DELETE FROM customers WHERE email = 'test@migration.com';

-- STEP 12: Final cleanup (run only after successful verification)
-- Uncomment these lines only after confirming migration was successful:

-- DROP TABLE customers_backup_20250731;
-- DROP TABLE users_backup_20250731;
-- DROP TABLE organizations_backup_20250731;

SELECT '🎉 Migration completed! Check verification results above.' as final_status;
*/
