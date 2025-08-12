-- RFP Management Tool - Enhanced Fields for RFP Requirements
-- Adding new fields to projects table for comprehensive RFP management

-- === Add new fields to projects table ===

-- First, add the basic RFP fields
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS rfp_added_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS rfp_title TEXT,
ADD COLUMN IF NOT EXISTS state TEXT,
ADD COLUMN IF NOT EXISTS portal_url TEXT,
ADD COLUMN IF NOT EXISTS folder_url TEXT;

-- Add post-review fields (for stage = 'reviewed')
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS priority_banding TEXT CHECK (priority_banding IN ('P1', 'P2', 'P3', 'No bid') OR priority_banding IS NULL),
ADD COLUMN IF NOT EXISTS review_comment TEXT CHECK (length(review_comment) <= 1000 OR review_comment IS NULL),
ADD COLUMN IF NOT EXISTS assigned_to TEXT REFERENCES public.users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS company_assignment TEXT CHECK (company_assignment IN ('DatamanHealth', 'DatamanUSA', 'CCSI') OR company_assignment IS NULL);

-- Update the project_stage enum to include 'reviewed'
-- First check if 'reviewed' already exists
DO $$ 
BEGIN
    -- Add 'reviewed' to the enum if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'reviewed' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'project_stage')
    ) THEN
        ALTER TYPE project_stage ADD VALUE 'reviewed';
    END IF;
END $$;

-- === Add indexes for better performance ===

-- Index on rfp_added_date for date-based queries
CREATE INDEX IF NOT EXISTS idx_projects_rfp_added_date ON public.projects(rfp_added_date);

-- Index on assigned_to for user-based queries
CREATE INDEX IF NOT EXISTS idx_projects_assigned_to ON public.projects(assigned_to);

-- Index on priority_banding for filtering
CREATE INDEX IF NOT EXISTS idx_projects_priority_banding ON public.projects(priority_banding);

-- Index on company_assignment for company-based queries
CREATE INDEX IF NOT EXISTS idx_projects_company_assignment ON public.projects(company_assignment);

-- Composite index on stage and priority_banding for dashboard queries
CREATE INDEX IF NOT EXISTS idx_projects_stage_priority_banding ON public.projects(stage, priority_banding);

-- === Update existing projects ===

-- Set rfp_added_date to created_at for existing projects where it's null
UPDATE public.projects 
SET rfp_added_date = created_at 
WHERE rfp_added_date IS NULL;

-- Set rfp_title to title for existing projects where it's null
UPDATE public.projects 
SET rfp_title = title 
WHERE rfp_title IS NULL;

-- === Add comments for documentation ===

COMMENT ON COLUMN public.projects.rfp_added_date IS 'Date when the RFP entry was first created in the system';
COMMENT ON COLUMN public.projects.rfp_title IS 'Original title of the RFP document';
COMMENT ON COLUMN public.projects.state IS 'Geographic state or region for the project (optional)';
COMMENT ON COLUMN public.projects.portal_url IS 'URL from where the RFP was originally fetched';
COMMENT ON COLUMN public.projects.folder_url IS 'SharePoint or document folder URL for project resources';
COMMENT ON COLUMN public.projects.priority_banding IS 'Post-review priority classification (P1, P2, P3, No bid)';
COMMENT ON COLUMN public.projects.review_comment IS 'Review comments with maximum 1000 characters';
COMMENT ON COLUMN public.projects.assigned_to IS 'User assigned to work on this project after review';
COMMENT ON COLUMN public.projects.company_assignment IS 'Company entity assigned for this project (DatamanHealth, DatamanUSA, CCSI)';

-- === Update RLS policies ===

-- Ensure users can see assigned projects
DROP POLICY IF EXISTS "Users can view projects assigned to them" ON public.projects;

CREATE POLICY "Users can view projects assigned to them" 
ON public.projects FOR SELECT 
USING (
  owner_id = auth.jwt() ->> 'sub' OR 
  assigned_to = auth.jwt() ->> 'sub'
);

-- === Create helper functions ===

-- Function to get projects with enhanced filtering
CREATE OR REPLACE FUNCTION get_projects_with_filters(
  p_stage TEXT[] DEFAULT NULL,
  p_priority TEXT[] DEFAULT NULL,
  p_priority_banding TEXT[] DEFAULT NULL,
  p_company TEXT[] DEFAULT NULL,
  p_assigned_to TEXT[] DEFAULT NULL,
  p_owner_id TEXT[] DEFAULT NULL,
  p_search TEXT DEFAULT NULL,
  p_limit INTEGER DEFAULT 50,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  stage project_stage,
  priority project_priority,
  due_date TIMESTAMPTZ,
  owner_id TEXT,
  progress_percentage INTEGER,
  status_notes TEXT,
  estimated_hours INTEGER,
  actual_hours INTEGER,
  budget_amount DECIMAL(10,2),
  client_name TEXT,
  client_email TEXT,
  rfp_document_url TEXT,
  submission_url TEXT,
  is_archived BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  -- New RFP fields
  rfp_added_date TIMESTAMPTZ,
  rfp_title TEXT,
  state TEXT,
  portal_url TEXT,
  folder_url TEXT,
  -- Post-review fields
  priority_banding TEXT,
  review_comment TEXT,
  assigned_to TEXT,
  company_assignment TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id, p.title, p.description, p.stage, p.priority, p.due_date, p.owner_id,
    p.progress_percentage, p.status_notes, p.estimated_hours, p.actual_hours,
    p.budget_amount, p.client_name, p.client_email, p.rfp_document_url,
    p.submission_url, p.is_archived, p.created_at, p.updated_at,
    p.rfp_added_date, p.rfp_title, p.state, p.portal_url, p.folder_url,
    p.priority_banding, p.review_comment, p.assigned_to, p.company_assignment
  FROM public.projects p
  WHERE 
    (p_stage IS NULL OR p.stage = ANY(p_stage::project_stage[])) AND
    (p_priority IS NULL OR p.priority = ANY(p_priority::project_priority[])) AND
    (p_priority_banding IS NULL OR p.priority_banding = ANY(p_priority_banding)) AND
    (p_company IS NULL OR p.company_assignment = ANY(p_company)) AND
    (p_assigned_to IS NULL OR p.assigned_to = ANY(p_assigned_to)) AND
    (p_owner_id IS NULL OR p.owner_id = ANY(p_owner_id)) AND
    (p_search IS NULL OR 
     p.title ILIKE '%' || p_search || '%' OR 
     p.description ILIKE '%' || p_search || '%' OR
     p.client_name ILIKE '%' || p_search || '%') AND
    p.is_archived = FALSE
  ORDER BY p.updated_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION get_projects_with_filters TO authenticated;
