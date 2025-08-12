-- Enhanced Projects Schema - Additional Fields for RFP Management
-- This script adds new columns and updates enums for the enhanced RFP workflow

-- === Update Enums ===

-- Add 'reviewed' stage to project_stage enum
DO $$ BEGIN
  -- Drop and recreate the enum with new values
  ALTER TYPE project_stage RENAME TO project_stage_old;
  CREATE TYPE project_stage AS ENUM ('unassigned','assigned','reviewed','submitted','skipped','won','lost');
  
  -- Update the table to use the new enum
  ALTER TABLE public.projects ALTER COLUMN stage TYPE project_stage 
  USING stage::text::project_stage;
  
  -- Drop the old enum
  DROP TYPE project_stage_old;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Add priority banding enum for reviewed projects
DO $$ BEGIN
  CREATE TYPE priority_banding AS ENUM ('P1', 'P2', 'P3', 'No bid');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Add company enum for assignment
DO $$ BEGIN
  CREATE TYPE company_type AS ENUM ('DatamanHealth', 'DatamanUSA', 'CCSI');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- === Add New Columns to Projects Table ===

-- Basic RFP Information Fields
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS rfp_added_date TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS rfp_title TEXT, -- Alternative to title for RFP-specific naming
ADD COLUMN IF NOT EXISTS state TEXT, -- Project state (non-mandatory)
ADD COLUMN IF NOT EXISTS portal_url TEXT, -- URL from where RFP is fetched
ADD COLUMN IF NOT EXISTS folder_url TEXT, -- SharePoint folder URL

-- Post-Review Fields (visible when stage = 'reviewed')
ADD COLUMN IF NOT EXISTS priority_banding priority_banding,
ADD COLUMN IF NOT EXISTS review_comment TEXT CHECK (LENGTH(review_comment) <= 1000),
ADD COLUMN IF NOT EXISTS assigned_to TEXT REFERENCES public.users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS company_assignment company_type;

-- === Update existing columns ===
-- Remove character limit from description
ALTER TABLE public.projects ALTER COLUMN description TYPE TEXT;

-- === Add Indexes for New Fields ===
CREATE INDEX IF NOT EXISTS idx_projects_rfp_added_date ON public.projects(rfp_added_date);
CREATE INDEX IF NOT EXISTS idx_projects_state ON public.projects(state);
CREATE INDEX IF NOT EXISTS idx_projects_priority_banding ON public.projects(priority_banding);
CREATE INDEX IF NOT EXISTS idx_projects_assigned_to ON public.projects(assigned_to);
CREATE INDEX IF NOT EXISTS idx_projects_company_assignment ON public.projects(company_assignment);

-- === Create Trigger for Updated At ===
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

-- === Comments ===
COMMENT ON COLUMN public.projects.rfp_added_date IS 'Date when the first entry of the project is made';
COMMENT ON COLUMN public.projects.rfp_title IS 'RFP-specific title (can be different from project title)';
COMMENT ON COLUMN public.projects.state IS 'The state of the project (non-mandatory field)';
COMMENT ON COLUMN public.projects.portal_url IS 'URL from where the RFP is fetched';
COMMENT ON COLUMN public.projects.folder_url IS 'SharePoint folder URL';
COMMENT ON COLUMN public.projects.priority_banding IS 'Priority banding for reviewed projects (P1, P2, P3, No bid)';
COMMENT ON COLUMN public.projects.review_comment IS 'Review comment with max 1000 characters';
COMMENT ON COLUMN public.projects.assigned_to IS 'User assigned to the project';
COMMENT ON COLUMN public.projects.company_assignment IS 'Company assignment for the user';
