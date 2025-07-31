-- ===============================================
-- MISSING RLS POLICIES - RUN THIS IN SUPABASE
-- ===============================================

-- Organizations INSERT policy - Only super admins can create organizations
CREATE POLICY "Super admins can create organizations" ON organizations
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role = 'super_admin'
        )
    );

-- Organizations UPDATE policy - Super admins and org admins can update
CREATE POLICY "Super admins and org admins can update organizations" ON organizations
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND (
                role = 'super_admin' OR 
                (role = 'org_admin' AND organization_id = organizations.id)
            )
        )
    );

-- Users INSERT policy - Super admins and org admins can create users
CREATE POLICY "Super admins and org admins can create users" ON users
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users existing_user
            WHERE existing_user.id = auth.uid() 
            AND (
                existing_user.role = 'super_admin' OR 
                existing_user.role = 'org_admin'
            )
        )
    );

-- Users UPDATE policy - Users can update themselves, admins can update their org users
CREATE POLICY "Users can update themselves and admins can update org users" ON users
    FOR UPDATE USING (
        id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM users admin_user
            WHERE admin_user.id = auth.uid() 
            AND (
                admin_user.role = 'super_admin' OR 
                (admin_user.role = 'org_admin' AND admin_user.organization_id = users.organization_id)
            )
        )
    );

-- Customers INSERT policy - Users can create customers in their organization
CREATE POLICY "Users can create customers in their organization" ON customers
    FOR INSERT WITH CHECK (
        organization_id IN (
            SELECT organization_id 
            FROM users 
            WHERE id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role = 'super_admin'
        )
    );

-- Customers UPDATE policy - Users can update customers in their organization
CREATE POLICY "Users can update customers in their organization" ON customers
    FOR UPDATE USING (
        organization_id IN (
            SELECT organization_id 
            FROM users 
            WHERE id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role = 'super_admin'
        )
    );

-- Customer contacts INSERT policy
CREATE POLICY "Users can create customer contacts in their organization" ON customer_contacts
    FOR INSERT WITH CHECK (
        customer_id IN (
            SELECT c.id FROM customers c
            JOIN users u ON u.organization_id = c.organization_id
            WHERE u.id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role = 'super_admin'
        )
    );

-- Customer contacts UPDATE policy
CREATE POLICY "Users can update customer contacts in their organization" ON customer_contacts
    FOR UPDATE USING (
        customer_id IN (
            SELECT c.id FROM customers c
            JOIN users u ON u.organization_id = c.organization_id
            WHERE u.id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role = 'super_admin'
        )
    );

-- Customer activities INSERT policy
CREATE POLICY "Users can create customer activities in their organization" ON customer_activities
    FOR INSERT WITH CHECK (
        customer_id IN (
            SELECT c.id FROM customers c
            JOIN users u ON u.organization_id = c.organization_id
            WHERE u.id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role = 'super_admin'
        )
    );

-- Customer activities UPDATE policy
CREATE POLICY "Users can update customer activities in their organization" ON customer_activities
    FOR UPDATE USING (
        customer_id IN (
            SELECT c.id FROM customers c
            JOIN users u ON u.organization_id = c.organization_id
            WHERE u.id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role = 'super_admin'
        )
    );
