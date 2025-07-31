-- ===============================================
-- SUPABASE TABLE CONTENT OVERVIEW
-- Vollständige Ausgabe aller Tabelleninhalte
-- ===============================================

-- 1. Organizations Table
SELECT '=== ORGANIZATIONS TABLE ===' as section;
SELECT 
    id,
    name,
    slug,
    legal_name,
    business_type,
    email,
    phone,
    website,
    street,
    house_number,
    postal_code,
    city,
    country,
    industry,
    employee_count,
    subscription_plan,
    subscription_status,
    is_active,
    is_verified,
    created_at,
    updated_at
FROM organizations
ORDER BY created_at DESC;

-- Organizations Statistiken
SELECT 
    COUNT(*) as total_organizations,
    COUNT(CASE WHEN is_active = true THEN 1 END) as active_organizations,
    COUNT(CASE WHEN subscription_plan = 'free' THEN 1 END) as free_plans,
    COUNT(CASE WHEN subscription_plan = 'professional' THEN 1 END) as pro_plans
FROM organizations;

-- ===============================================

-- 2. Users Table
SELECT '=== USERS TABLE ===' as section;
SELECT 
    id,
    organization_id,
    email,
    first_name,
    last_name,
    display_name,
    phone,
    mobile,
    job_title,
    department,
    role,
    is_active,
    is_verified,
    email_verified_at,
    two_factor_enabled,
    last_login_at,
    last_activity_at,
    created_at,
    updated_at
FROM users
ORDER BY created_at DESC;

-- Users Statistiken
SELECT 
    role,
    COUNT(*) as count,
    COUNT(CASE WHEN is_active = true THEN 1 END) as active_count,
    COUNT(CASE WHEN is_verified = true THEN 1 END) as verified_count
FROM users
GROUP BY role
ORDER BY count DESC;

-- ===============================================

-- 3. Customers Table  
SELECT '=== CUSTOMERS TABLE ===' as section;
SELECT 
    id,
    organization_id,
    customer_number,
    customer_type,
    email,
    first_name,
    last_name,
    company_name,
    phone,
    mobile,
    salutation,
    website,
    street,
    house_number,
    postal_code,
    city,
    country,
    industry,
    customer_status,
    priority,
    assigned_to,
    tags,
    notes,
    internal_notes,
    total_orders,
    total_revenue,
    average_order_value,
    last_order_date,
    last_contact_date,
    created_at,
    updated_at
FROM customers
ORDER BY created_at DESC;

-- Customers Statistiken
SELECT 
    'Customer Status' as category,
    customer_status as value,
    COUNT(*) as count
FROM customers 
GROUP BY customer_status

UNION ALL

SELECT 
    'Customer Type' as category,
    customer_type as value,
    COUNT(*) as count
FROM customers 
GROUP BY customer_type

UNION ALL

SELECT 
    'Priority' as category,
    priority as value,
    COUNT(*) as count
FROM customers 
GROUP BY priority

ORDER BY category, count DESC;

-- ===============================================

-- 4. Customer Contacts Table
SELECT '=== CUSTOMER_CONTACTS TABLE ===' as section;
SELECT 
    id,
    customer_id,
    contact_type,
    first_name,
    last_name,
    email,
    phone,
    mobile,
    position,
    department,
    is_primary,
    is_active,
    notes,
    created_at,
    updated_at
FROM customer_contacts
ORDER BY created_at DESC;

-- Contacts Statistiken
SELECT 
    contact_type,
    COUNT(*) as count,
    COUNT(CASE WHEN is_primary = true THEN 1 END) as primary_contacts,
    COUNT(CASE WHEN is_active = true THEN 1 END) as active_contacts
FROM customer_contacts
GROUP BY contact_type
ORDER BY count DESC;

-- ===============================================

-- 5. Customer Activities Table
SELECT '=== CUSTOMER_ACTIVITIES TABLE ===' as section;
SELECT 
    id,
    customer_id,
    activity_type,
    title,
    description,
    outcome,
    scheduled_at,
    completed_at,
    duration_minutes,
    status,
    priority,
    metadata,
    attachments,
    created_by,
    created_at,
    updated_at
FROM customer_activities
ORDER BY created_at DESC
LIMIT 50; -- Begrenzt auf 50 neueste Aktivitäten

-- Activities Statistiken
SELECT 
    'Activity Type' as category,
    activity_type as value,
    COUNT(*) as count
FROM customer_activities
GROUP BY activity_type

UNION ALL

SELECT 
    'Status' as category,
    status as value,
    COUNT(*) as count
FROM customer_activities
GROUP BY status

UNION ALL

SELECT 
    'Priority' as category,
    priority as value,
    COUNT(*) as count
FROM customer_activities
GROUP BY priority

ORDER BY category, count DESC;

-- ===============================================
-- ZUSAMMENFASSUNG ALLER TABELLEN
-- ===============================================

SELECT '=== TABELLEN ÜBERSICHT ===' as section;

SELECT 
    'Organizations' as table_name,
    COUNT(*) as record_count,
    MIN(created_at) as oldest_record,
    MAX(created_at) as newest_record
FROM organizations

UNION ALL

SELECT 
    'Users' as table_name,
    COUNT(*) as record_count,
    MIN(created_at) as oldest_record,
    MAX(created_at) as newest_record
FROM users

UNION ALL

SELECT 
    'Customers' as table_name,
    COUNT(*) as record_count,
    MIN(created_at) as oldest_record,
    MAX(created_at) as newest_record
FROM customers

UNION ALL

SELECT 
    'Customer Contacts' as table_name,
    COUNT(*) as record_count,
    MIN(created_at) as oldest_record,
    MAX(created_at) as newest_record
FROM customer_contacts

UNION ALL

SELECT 
    'Customer Activities' as table_name,
    COUNT(*) as record_count,
    MIN(created_at) as oldest_record,
    MAX(created_at) as newest_record
FROM customer_activities

ORDER BY record_count DESC;

-- ===============================================
-- BEZIEHUNGEN ZWISCHEN TABELLEN
-- ===============================================

SELECT '=== TABELLEN BEZIEHUNGEN ===' as section;

-- Organizations mit ihren Benutzern und Kunden
SELECT 
    o.name as organization_name,
    o.subscription_plan,
    o.is_active as org_active,
    COUNT(DISTINCT u.id) as user_count,
    COUNT(DISTINCT c.id) as customer_count,
    COUNT(DISTINCT ca.id) as activity_count,
    COALESCE(SUM(c.total_revenue), 0) as total_revenue
FROM organizations o
LEFT JOIN users u ON o.id = u.organization_id
LEFT JOIN customers c ON o.id = c.organization_id  
LEFT JOIN customer_activities ca ON c.id = ca.customer_id
GROUP BY o.id, o.name, o.subscription_plan, o.is_active
ORDER BY customer_count DESC, user_count DESC;

-- ===============================================
-- NEUESTE AKTIVITÄTEN
-- ===============================================

SELECT '=== NEUESTE AKTIVITÄTEN ===' as section;

-- Letzte 10 Aktivitäten aus allen Tabellen
(
    SELECT 
        'Organization' as type,
        name as description,
        created_at as timestamp,
        'created' as action
    FROM organizations
    ORDER BY created_at DESC
    LIMIT 3
)
UNION ALL
(
    SELECT 
        'User' as type,
        CONCAT(first_name, ' ', last_name, ' (', email, ')') as description,
        created_at as timestamp,
        'registered' as action
    FROM users
    ORDER BY created_at DESC
    LIMIT 3
)
UNION ALL
(
    SELECT 
        'Customer' as type,
        CASE 
            WHEN customer_type = 'person' THEN CONCAT(first_name, ' ', last_name)
            ELSE company_name
        END as description,
        created_at as timestamp,
        'added' as action
    FROM customers
    ORDER BY created_at DESC
    LIMIT 4
)
ORDER BY timestamp DESC;
