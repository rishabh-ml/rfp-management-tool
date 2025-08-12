-- RFP Management System — Complete Schema Reset with Enhanced RFP Fields
-- This script will drop and recreate all tables with the new RFP requirements
-- WARNING: This will DELETE ALL EXISTING DATA

-- === Drop existing tables (in reverse dependency order) ===
DROP TABLE IF EXISTS public.user_preferences CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.invitations CASCADE;
DROP TABLE IF EXISTS public.activity_log CASCADE;
DROP TABLE IF EXISTS public.subtasks CASCADE;
DROP TABLE IF EXISTS public.comments CASCADE;
DROP TABLE IF EXISTS public.project_tags CASCADE;
DROP TABLE IF EXISTS public.project_attribute_values CASCADE;
DROP TABLE IF EXISTS public.projects CASCADE;
DROP TABLE IF EXISTS public.tags CASCADE;
DROP TABLE IF EXISTS public.custom_attributes CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- === Drop existing types ===
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS project_stage CASCADE;
DROP TYPE IF EXISTS project_priority CASCADE;
DROP TYPE IF EXISTS priority_banding CASCADE;
DROP TYPE IF EXISTS company_assignment CASCADE;
DROP TYPE IF EXISTS attribute_type CASCADE;

-- === Drop existing functions ===
DROP FUNCTION IF EXISTS public.current_user_id() CASCADE;
DROP FUNCTION IF EXISTS public.get_current_user_id() CASCADE;
DROP FUNCTION IF EXISTS public.current_user_role() CASCADE;
DROP FUNCTION IF EXISTS public.is_admin() CASCADE;
DROP FUNCTION IF EXISTS public.is_manager_or_admin() CASCADE;
DROP FUNCTION IF EXISTS get_projects_with_filters(TEXT[], TEXT[], TEXT[], TEXT[], TEXT[], TEXT[], TEXT, INTEGER, INTEGER) CASCADE;

-- === Extensions ===
CREATE EXTENSION IF NOT EXISTS "pgcrypto";  -- gen_random_uuid()

-- === Enhanced Enums for RFP Management ===
CREATE TYPE user_role AS ENUM ('admin','manager','member');

CREATE TYPE project_stage AS ENUM ('unassigned','assigned','reviewed','submitted','skipped','won','lost');

CREATE TYPE project_priority AS ENUM ('low','medium','high','urgent');

CREATE TYPE priority_banding AS ENUM ('P1','P2','P3','No bid');

CREATE TYPE company_assignment AS ENUM ('DatamanHealth','DatamanUSA','CCSI');

CREATE TYPE attribute_type AS ENUM (
  'text','long_text','number','date','checkbox','dropdown','label','checklist',
  'link','member','vote','progress','rating','created_at','updated_at','created_by','button','custom_id'
);

-- === Core Tables ===

-- Users (PK = Clerk user id from JWT `sub`)
CREATE TABLE public.users (
  id            TEXT PRIMARY KEY,            -- Clerk user id (jwt.sub)
  email         TEXT UNIQUE NOT NULL,
  first_name    TEXT,
  last_name     TEXT,
  avatar_url    TEXT,
  role          user_role NOT NULL DEFAULT 'member',
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  last_login_at TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Custom attributes (for dynamic fields)
CREATE TABLE public.custom_attributes (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name             TEXT NOT NULL,
  label            TEXT NOT NULL,
  type             attribute_type NOT NULL,
  description      TEXT,
  is_required      BOOLEAN NOT NULL DEFAULT FALSE,
  is_active        BOOLEAN NOT NULL DEFAULT TRUE,
  options          JSONB,            -- dropdown/checklist options
  default_value    TEXT,
  validation_rules JSONB,            -- validation constraints
  display_order    INTEGER NOT NULL DEFAULT 0,
  created_by       TEXT REFERENCES public.users(id) ON DELETE SET NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tags
CREATE TABLE public.tags (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT UNIQUE NOT NULL,
  color       TEXT NOT NULL DEFAULT '#3B82F6',
  description TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_by  TEXT REFERENCES public.users(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enhanced Projects table with comprehensive RFP fields
CREATE TABLE public.projects (
  -- Core project fields
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title               TEXT NOT NULL,
  description         TEXT,                    -- No character limit for description
  stage               project_stage NOT NULL DEFAULT 'unassigned',
  priority            project_priority NOT NULL DEFAULT 'medium',
  due_date            TIMESTAMPTZ,
  owner_id            TEXT NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  progress_percentage INTEGER NOT NULL DEFAULT 0 CHECK (progress_percentage BETWEEN 0 AND 100),
  status_notes        TEXT,
  estimated_hours     INTEGER CHECK (estimated_hours IS NULL OR estimated_hours > 0),
  actual_hours        INTEGER CHECK (actual_hours IS NULL OR actual_hours >= 0),
  budget_amount       DECIMAL(12,2) CHECK (budget_amount IS NULL OR budget_amount > 0),
  is_archived         BOOLEAN NOT NULL DEFAULT FALSE,
  
  -- Basic RFP Information Fields
  rfp_added_date      TIMESTAMPTZ NOT NULL DEFAULT NOW(),  -- Date when RFP entry was first created
  rfp_title           TEXT,                                -- Original RFP title (can be different from project title)
  client_name         TEXT NOT NULL,                       -- Name of the client who released the RFP
  client_email        TEXT,
  state               TEXT,                                 -- Geographic state/region (optional)
  
  -- RFP URLs and Resources
  portal_url          TEXT,                                 -- URL from where RFP is fetched
  folder_url          TEXT,                                 -- SharePoint folder URL
  rfp_document_url    TEXT,                                 -- Direct link to RFP document
  submission_url      TEXT,                                 -- URL for proposal submission
  
  -- Post-Review Fields (only filled when stage = 'reviewed')
  priority_banding    priority_banding,                     -- P1, P2, P3, No bid
  review_comment      TEXT CHECK (length(review_comment) <= 1000 OR review_comment IS NULL), -- 1000 char limit
  assigned_to         TEXT REFERENCES public.users(id) ON DELETE SET NULL,  -- User assigned to work on project
  company_assignment  company_assignment,                   -- Company for which user will work
  
  -- System fields
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_review_fields CHECK (
    (stage != 'reviewed') OR 
    (stage = 'reviewed' AND priority_banding IS NOT NULL)
  )
);

-- Project custom attribute values
CREATE TABLE public.project_attribute_values (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id   UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  attribute_id UUID NOT NULL REFERENCES public.custom_attributes(id) ON DELETE CASCADE,
  value        TEXT,
  value_json   JSONB,          -- arrays/objects if needed
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (project_id, attribute_id)
);

-- Project tags (M2M)
CREATE TABLE public.project_tags (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  tag_id     UUID NOT NULL REFERENCES public.tags(id)     ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (project_id, tag_id)
);

-- Comments (threaded)
CREATE TABLE public.comments (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id    TEXT NOT NULL REFERENCES public.users(id)    ON DELETE CASCADE,
  content    TEXT NOT NULL,
  parent_id  UUID REFERENCES public.comments(id) ON DELETE SET NULL,
  is_edited  BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Subtasks
CREATE TABLE public.subtasks (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id      UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  description     TEXT,
  assigned_to     TEXT REFERENCES public.users(id) ON DELETE SET NULL,
  completed       BOOLEAN NOT NULL DEFAULT FALSE,
  due_date        TIMESTAMPTZ,
  estimated_hours INTEGER CHECK (estimated_hours IS NULL OR estimated_hours > 0),
  actual_hours    INTEGER CHECK (actual_hours    IS NULL OR actual_hours    >= 0),
  priority        project_priority NOT NULL DEFAULT 'medium',
  created_by      TEXT REFERENCES public.users(id) ON DELETE SET NULL,
  completed_at    TIMESTAMPTZ,
  completed_by    TEXT REFERENCES public.users(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Activity log
CREATE TABLE public.activity_log (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    TEXT REFERENCES public.users(id) ON DELETE SET NULL,
  action     TEXT NOT NULL,
  entity_type TEXT NOT NULL,            -- 'project','comment','subtask', etc.
  entity_id  UUID NOT NULL,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Invitations
CREATE TABLE public.invitations (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email       TEXT NOT NULL,
  role        user_role NOT NULL DEFAULT 'member',
  invited_by  TEXT REFERENCES public.users(id) ON DELETE SET NULL,
  token       TEXT UNIQUE NOT NULL,
  expires_at  TIMESTAMPTZ NOT NULL,
  accepted_at TIMESTAMPTZ,
  accepted_by TEXT REFERENCES public.users(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Notifications
CREATE TABLE public.notifications (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title      TEXT NOT NULL,
  message    TEXT NOT NULL,
  type       TEXT NOT NULL,     -- 'project_assigned','comment_mention','due_date_reminder', etc.
  entity_type TEXT,
  entity_id  UUID,
  is_read    BOOLEAN NOT NULL DEFAULT FALSE,
  read_at    TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User preferences (1:1)
CREATE TABLE public.user_preferences (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                TEXT NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  email_notifications    BOOLEAN NOT NULL DEFAULT TRUE,
  project_assignments    BOOLEAN NOT NULL DEFAULT TRUE,
  due_date_reminders     BOOLEAN NOT NULL DEFAULT TRUE,
  comment_mentions       BOOLEAN NOT NULL DEFAULT TRUE,
  weekly_summary         BOOLEAN NOT NULL DEFAULT FALSE,
  notification_frequency TEXT NOT NULL DEFAULT 'immediate',  -- 'immediate','hourly','daily','weekly'
  quiet_hours_start      TIME,
  quiet_hours_end        TIME,
  timezone               TEXT NOT NULL DEFAULT 'UTC',
  theme                  TEXT NOT NULL DEFAULT 'system',     -- 'light','dark','system'
  language               TEXT NOT NULL DEFAULT 'en',
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- === Indexes for Performance ===

-- Users
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_users_is_active ON public.users(is_active);

-- Projects - Core indexes
CREATE INDEX idx_projects_owner_id ON public.projects(owner_id);
CREATE INDEX idx_projects_stage ON public.projects(stage);
CREATE INDEX idx_projects_priority ON public.projects(priority);
CREATE INDEX idx_projects_due_date ON public.projects(due_date);
CREATE INDEX idx_projects_created_at ON public.projects(created_at);
CREATE INDEX idx_projects_updated_at ON public.projects(updated_at);
CREATE INDEX idx_projects_is_archived ON public.projects(is_archived);

-- Projects - RFP specific indexes
CREATE INDEX idx_projects_rfp_added_date ON public.projects(rfp_added_date);
CREATE INDEX idx_projects_client_name ON public.projects(client_name);
CREATE INDEX idx_projects_assigned_to ON public.projects(assigned_to);
CREATE INDEX idx_projects_priority_banding ON public.projects(priority_banding);
CREATE INDEX idx_projects_company_assignment ON public.projects(company_assignment);

-- Composite indexes for common queries
CREATE INDEX idx_projects_stage_priority ON public.projects(stage, priority);
CREATE INDEX idx_projects_stage_priority_banding ON public.projects(stage, priority_banding);
CREATE INDEX idx_projects_company_assigned ON public.projects(company_assignment, assigned_to);
CREATE INDEX idx_projects_owner_stage ON public.projects(owner_id, stage);

-- Full-text search indexes
CREATE INDEX idx_projects_title_search ON public.projects USING gin(to_tsvector('english', title));
CREATE INDEX idx_projects_description_search ON public.projects USING gin(to_tsvector('english', description));
CREATE INDEX idx_projects_client_search ON public.projects USING gin(to_tsvector('english', client_name));

-- Other tables
CREATE INDEX idx_comments_project_id ON public.comments(project_id);
CREATE INDEX idx_comments_user_id ON public.comments(user_id);
CREATE INDEX idx_comments_created_at ON public.comments(created_at);

CREATE INDEX idx_subtasks_project_id ON public.subtasks(project_id);
CREATE INDEX idx_subtasks_assigned_to ON public.subtasks(assigned_to);
CREATE INDEX idx_subtasks_completed ON public.subtasks(completed);
CREATE INDEX idx_subtasks_due_date ON public.subtasks(due_date);

CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at);

-- === Comments and Documentation ===

COMMENT ON TABLE public.projects IS 'Enhanced projects table for comprehensive RFP management';
COMMENT ON COLUMN public.projects.rfp_added_date IS 'Date when the RFP entry was first created in the system';
COMMENT ON COLUMN public.projects.rfp_title IS 'Original title of the RFP document (may differ from project title)';
COMMENT ON COLUMN public.projects.client_name IS 'Name of the client who released the RFP';
COMMENT ON COLUMN public.projects.state IS 'Geographic state or region for the project (optional)';
COMMENT ON COLUMN public.projects.portal_url IS 'URL from where the RFP was originally fetched';
COMMENT ON COLUMN public.projects.folder_url IS 'SharePoint or document folder URL for project resources';
COMMENT ON COLUMN public.projects.priority_banding IS 'Post-review priority classification (P1, P2, P3, No bid)';
COMMENT ON COLUMN public.projects.review_comment IS 'Review comments with maximum 1000 characters';
COMMENT ON COLUMN public.projects.assigned_to IS 'User assigned to work on this project after review';
COMMENT ON COLUMN public.projects.company_assignment IS 'Company entity assigned for this project';

-- === Triggers for updated_at ===

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Apply trigger to all relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_tags_updated_at BEFORE UPDATE ON public.tags FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_custom_attributes_updated_at BEFORE UPDATE ON public.custom_attributes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_project_attribute_values_updated_at BEFORE UPDATE ON public.project_attribute_values FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON public.comments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_subtasks_updated_at BEFORE UPDATE ON public.subtasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON public.user_preferences FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
