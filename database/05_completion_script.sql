-- Completion Script - Add Missing Columns and Constraints
-- Based on diagnostic results showing some columns already exist

-- Add missing columns that might not exist yet
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS rfp_added_date TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS rfp_title TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS state TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS portal_url TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS folder_url TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS priority_banding TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS company_assignment TEXT;

-- Add missing indexes
CREATE INDEX IF NOT EXISTS idx_projects_rfp_added_date ON public.projects(rfp_added_date);
CREATE INDEX IF NOT EXISTS idx_projects_state ON public.projects(state);
CREATE INDEX IF NOT EXISTS idx_projects_priority_banding ON public.projects(priority_banding);
CREATE INDEX IF NOT EXISTS idx_projects_company_assignment ON public.projects(company_assignment);

-- Add column comments
COMMENT ON COLUMN public.projects.rfp_added_date IS 'Date when the first entry of the project is made';
COMMENT ON COLUMN public.projects.rfp_title IS 'RFP-specific title (can be different from project title)';
COMMENT ON COLUMN public.projects.state IS 'The state of the project (non-mandatory field)';
COMMENT ON COLUMN public.projects.portal_url IS 'URL from where RFP is fetched';
COMMENT ON COLUMN public.projects.folder_url IS 'SharePoint folder URL';
COMMENT ON COLUMN public.projects.priority_banding IS 'Priority banding for reviewed projects (P1, P2, P3, No bid)';
COMMENT ON COLUMN public.projects.company_assignment IS 'Company assignment for the user';
