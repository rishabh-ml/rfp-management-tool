-- Enhanced Projects Schema - Step-by-Step Version (Safer)
-- Run each section separately in Supabase SQL Editor

-- === STEP 1: Add New Enum Types (Run this first) ===
-- Priority banding enum for reviewed projects
DO $$ BEGIN
  CREATE TYPE priority_banding AS ENUM ('P1', 'P2', 'P3', 'No bid');
EXCEPTION 
  WHEN duplicate_object THEN 
    RAISE NOTICE 'priority_banding enum already exists, skipping...';
END $$;

-- Company enum for assignment
DO $$ BEGIN
  CREATE TYPE company_type AS ENUM ('DatamanHealth', 'DatamanUSA', 'CCSI');
EXCEPTION 
  WHEN duplicate_object THEN 
    RAISE NOTICE 'company_type enum already exists, skipping...';
END $$;

-- === STEP 2: Add New Columns (Run this second) ===
-- Basic RFP Information Fields
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS rfp_added_date TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS rfp_title TEXT;

ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS state TEXT;

ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS portal_url TEXT;

ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS folder_url TEXT;

-- Post-Review Fields
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS priority_banding priority_banding;

ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS review_comment TEXT;

ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS assigned_to TEXT REFERENCES public.users(id) ON DELETE SET NULL;

ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS company_assignment company_type;

-- === STEP 3: Add Constraints (Run this third) ===
-- Add check constraint for review_comment length
DO $$ BEGIN
  ALTER TABLE public.projects 
  ADD CONSTRAINT check_review_comment_length 
  CHECK (LENGTH(review_comment) <= 1000);
EXCEPTION 
  WHEN duplicate_object THEN 
    RAISE NOTICE 'review_comment length constraint already exists, skipping...';
END $$;

-- === STEP 4: Update Project Stage Enum (Run this fourth - CAREFUL!) ===
-- This is the tricky part. Only run if you need the 'reviewed' stage
-- First, add the new value to the existing enum
ALTER TYPE project_stage ADD VALUE IF NOT EXISTS 'reviewed';

-- === STEP 5: Create Indexes (Run this fifth) ===
CREATE INDEX IF NOT EXISTS idx_projects_rfp_added_date ON public.projects(rfp_added_date);
CREATE INDEX IF NOT EXISTS idx_projects_state ON public.projects(state);
CREATE INDEX IF NOT EXISTS idx_projects_priority_banding ON public.projects(priority_banding);
CREATE INDEX IF NOT EXISTS idx_projects_assigned_to ON public.projects(assigned_to);
CREATE INDEX IF NOT EXISTS idx_projects_company_assignment ON public.projects(company_assignment);

-- === STEP 6: Update Trigger (Run this last) ===
CREATE OR REPLACE FUNCTION update_projects_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_projects_updated_at ON public.projects;
CREATE TRIGGER trigger_update_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION update_projects_updated_at();

-- === STEP 7: Add Comments (Optional) ===
COMMENT ON COLUMN public.projects.rfp_added_date IS 'Date when the first entry of the project is made';
COMMENT ON COLUMN public.projects.rfp_title IS 'RFP-specific title (can be different from project title)';
COMMENT ON COLUMN public.projects.state IS 'The state of the project (non-mandatory field)';
COMMENT ON COLUMN public.projects.portal_url IS 'URL from where the RFP is fetched';
COMMENT ON COLUMN public.projects.folder_url IS 'SharePoint folder URL';
COMMENT ON COLUMN public.projects.priority_banding IS 'Priority banding for reviewed projects (P1, P2, P3, No bid)';
COMMENT ON COLUMN public.projects.review_comment IS 'Review comment with max 1000 characters';
COMMENT ON COLUMN public.projects.assigned_to IS 'User assigned to the project';
COMMENT ON COLUMN public.projects.company_assignment IS 'Company assignment for the user';
