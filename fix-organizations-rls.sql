-- ===============================================
-- ALTERNATIVE LÖSUNG: RLS-Richtlinien für organizations anpassen
-- (Funktioniert auch wenn users RLS deaktiviert ist)
-- ===============================================

-- Zuerst alle bestehenden RLS-Richtlinien für organizations entfernen
DROP POLICY IF EXISTS "Super admins can create organizations" ON organizations;
DROP POLICY IF EXISTS "Super admins and org admins can update organizations" ON organizations;
DROP POLICY IF EXISTS "Users can view their organization" ON organizations;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON organizations;

-- Neue, einfachere RLS-Richtlinien erstellen, die nicht auf users-Tabelle angewiesen sind
-- Erlaubt allen authentifizierten Benutzern das Erstellen von Organisationen
CREATE POLICY "Authenticated users can create organizations" ON organizations
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Erlaubt allen authentifizierten Benutzern das Lesen aller Organisationen
CREATE POLICY "Authenticated users can view all organizations" ON organizations
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- Erlaubt allen authentifizierten Benutzern das Aktualisieren aller Organisationen
CREATE POLICY "Authenticated users can update all organizations" ON organizations
    FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Erlaubt allen authentifizierten Benutzern das Löschen aller Organisationen
CREATE POLICY "Authenticated users can delete all organizations" ON organizations
    FOR DELETE USING (auth.uid() IS NOT NULL);

-- Bestätigung der RLS-Richtlinien
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive, 
    roles, 
    cmd 
FROM pg_policies 
WHERE tablename = 'organizations'
ORDER BY cmd, policyname;
