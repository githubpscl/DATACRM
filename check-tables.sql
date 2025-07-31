-- Query to check if all required tables exist
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_name IN (
        'organizations',
        'users', 
        'customers',
        'customer_contacts',
        'customer_activities'
    )
ORDER BY table_name;

-- Count rows in organizations table (should be empty initially)
SELECT COUNT(*) as organization_count FROM organizations;
