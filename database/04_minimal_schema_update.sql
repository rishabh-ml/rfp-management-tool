-- Minimal Schema Update - Just Add Columns
-- This is the safest approach - add columns first, worry about enums later

-- Add new columns to projects table
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS rfp_added_date TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS rfp_title TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS state TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS portal_url TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS folder_url TEXT;

-- Add post-review fields as TEXT first (we can change to enums later)
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS priority_banding TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS review_comment TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS assigned_to TEXT REFERENCES public.users(id) ON DELETE SET NULL;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS company_assignment TEXT;

-- Add constraint for review comment length
ALTER TABLE public.projects ADD CONSTRAINT IF NOT EXISTS check_review_comment_length CHECK (LENGTH(review_comment) <= 1000);

-- Create basic indexes
CREATE INDEX IF NOT EXISTS idx_projects_rfp_added_date ON public.projects(rfp_added_date);
CREATE INDEX IF NOT EXISTS idx_projects_assigned_to ON public.projects(assigned_to);
