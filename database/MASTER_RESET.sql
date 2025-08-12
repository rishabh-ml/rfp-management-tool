-- Master Database Reset Script for RFP Management Tool
-- This script will completely reset and recreate the database with enhanced RFP functionality
-- 
-- DANGER: This will DELETE ALL EXISTING DATA
-- Only run this script if you want to completely reset the database
--
-- Execute this script in your Supabase SQL Editor

-- Step 1: Complete Schema Reset
\i 00_complete_reset_schema.sql

-- Step 2: Enhanced RLS Policies  
\i 01_enhanced_rls_policies.sql

-- Step 3: Enhanced Functions
\i 02_enhanced_functions.sql

-- Step 4: Data Integrity Triggers
\i 04_data_integrity_triggers.sql

-- Step 5: Sample Data (optional - comment out if you don't want sample data)
\i 03_sample_data.sql

-- Verification queries to check the setup
DO $$
BEGIN
    RAISE NOTICE 'Database reset completed successfully!';
    RAISE NOTICE 'Tables created: %', (
        SELECT COUNT(*) FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    );
    RAISE NOTICE 'Functions created: %', (
        SELECT COUNT(*) FROM information_schema.routines 
        WHERE routine_schema = 'public' AND routine_type = 'FUNCTION'
    );
END $$;

-- Show table summary
SELECT 
    schemaname,
    tablename,
    tableowner,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- Show enhanced project fields
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'projects' AND table_schema = 'public'
ORDER BY ordinal_position;
