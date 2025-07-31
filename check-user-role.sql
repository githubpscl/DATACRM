-- Check your user role in Supabase
SELECT 
    id,
    email,
    first_name,
    last_name,
    role,
    organization_id
FROM users 
WHERE id = auth.uid();

-- If you're not a super_admin yet, update your role:
-- UPDATE users SET role = 'super_admin' WHERE email = 'your-email@example.com';
