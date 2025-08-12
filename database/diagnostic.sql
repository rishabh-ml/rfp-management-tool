-- Diagnostic Query - Run this to see what already exists
-- This will help us understand what's missing

-- Check what columns exist in projects table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'projects' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check what enums exist for project_stage
SELECT enumlabel
FROM pg_enum e
JOIN pg_type t ON e.enumtypid = t.oid
WHERE t.typname = 'project_stage'
ORDER BY enumlabel;

-- Check if priority_banding enum exists
SELECT enumlabel
FROM pg_enum e
JOIN pg_type t ON e.enumtypid = t.oid
WHERE t.typname = 'priority_banding'
ORDER BY enumlabel;

-- Check if company_type enum exists
SELECT enumlabel
FROM pg_enum e
JOIN pg_type t ON e.enumtypid = t.oid
WHERE t.typname = 'company_type'
ORDER BY enumlabel;

-- Check for constraints
SELECT constraint_name, constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'projects' AND table_schema = 'public';
