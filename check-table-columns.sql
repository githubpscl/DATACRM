-- ===============================================
-- SPALTEN ÜBERPRÜFUNG - Welche Spalten existieren?
-- ===============================================

-- Alle Spalten der customers Tabelle anzeigen
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'customers' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- Alle Spalten der organizations Tabelle
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'organizations' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- Alle Spalten der users Tabelle
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'users' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- Alle Spalten der customer_contacts Tabelle
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'customer_contacts' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- Alle Spalten der customer_activities Tabelle
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'customer_activities' 
    AND table_schema = 'public'
ORDER BY ordinal_position;
