-- RFP Management System — Schema (TPA-ready)
-- Uses Clerk `sub` (TEXT) as primary key for users.
-- UUIDs are generated with pgcrypto's gen_random_uuid().

-- === Extensions ===
CREATE EXTENSION IF NOT EXISTS "pgcrypto";  -- gen_random_uuid()

-- === Enums ===
DO $$ BEGIN
  CREATE TYPE user_role        AS ENUM ('admin','manager','member');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE project_stage    AS ENUM ('unassigned','assigned','submitted','skipped','won','lost');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE project_priority AS ENUM ('low','medium','high','urgent');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE attribute_type   AS ENUM (
    'text','long_text','number','date','checkbox','dropdown','label','checklist',
    'link','member','vote','progress','rating','created_at','updated_at','created_by','button','custom_id'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- === Core Tables ===

-- Users (PK = Clerk user id from JWT `sub`)
CREATE TABLE IF NOT EXISTS public.users (
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
CREATE TABLE IF NOT EXISTS public.custom_attributes (
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
CREATE TABLE IF NOT EXISTS public.tags (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT UNIQUE NOT NULL,
  color       TEXT NOT NULL DEFAULT '#3B82F6',
  description TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_by  TEXT REFERENCES public.users(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Projects
CREATE TABLE IF NOT EXISTS public.projects (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title               TEXT NOT NULL,
  description         TEXT,
  stage               project_stage NOT NULL DEFAULT 'unassigned',
  priority            project_priority NOT NULL DEFAULT 'medium',
  due_date            TIMESTAMPTZ,
  owner_id            TEXT NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  progress_percentage INTEGER NOT NULL DEFAULT 0 CHECK (progress_percentage BETWEEN 0 AND 100),
  status_notes        TEXT,
  estimated_hours     INTEGER CHECK (estimated_hours IS NULL OR estimated_hours > 0),
  actual_hours        INTEGER CHECK (actual_hours    IS NULL OR actual_hours    >= 0),
  budget_amount       DECIMAL(10,2) CHECK (budget_amount IS NULL OR budget_amount > 0),
  client_name         TEXT,
  client_email        TEXT,
  rfp_document_url    TEXT,
  submission_url      TEXT,
  is_archived         BOOLEAN NOT NULL DEFAULT FALSE,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Project custom attribute values
CREATE TABLE IF NOT EXISTS public.project_attribute_values (
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
CREATE TABLE IF NOT EXISTS public.project_tags (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  tag_id     UUID NOT NULL REFERENCES public.tags(id)     ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (project_id, tag_id)
);

-- Comments (threaded)
CREATE TABLE IF NOT EXISTS public.comments (
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
CREATE TABLE IF NOT EXISTS public.subtasks (
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
CREATE TABLE IF NOT EXISTS public.activity_log (
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
CREATE TABLE IF NOT EXISTS public.invitations (
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
CREATE TABLE IF NOT EXISTS public.notifications (
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
CREATE TABLE IF NOT EXISTS public.user_preferences (
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
  theme                  TEXT NOT NULL DEFAULT 'system',      -- 'light','dark','system'
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- === Indexes ===

-- Users
CREATE INDEX IF NOT EXISTS idx_users_email     ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role      ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_active    ON public.users(is_active);

-- Projects
CREATE INDEX IF NOT EXISTS idx_projects_stage        ON public.projects(stage);
CREATE INDEX IF NOT EXISTS idx_projects_priority     ON public.projects(priority);
CREATE INDEX IF NOT EXISTS idx_projects_owner        ON public.projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_projects_due_date     ON public.projects(due_date);
CREATE INDEX IF NOT EXISTS idx_projects_created_at   ON public.projects(created_at);
CREATE INDEX IF NOT EXISTS idx_projects_owner_stage  ON public.projects(owner_id, stage);

-- Comments
CREATE INDEX IF NOT EXISTS idx_comments_project   ON public.comments(project_id);
CREATE INDEX IF NOT EXISTS idx_comments_user      ON public.comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_created   ON public.comments(created_at);

-- Subtasks
CREATE INDEX IF NOT EXISTS idx_subtasks_project   ON public.subtasks(project_id);
CREATE INDEX IF NOT EXISTS idx_subtasks_assignee  ON public.subtasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_subtasks_completed ON public.subtasks(completed);
CREATE INDEX IF NOT EXISTS idx_subtasks_assignee_done ON public.subtasks(assigned_to, completed);

-- Activity
CREATE INDEX IF NOT EXISTS idx_activity_user      ON public.activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_entity    ON public.activity_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_activity_created   ON public.activity_log(created_at);

-- Notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user   ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_isread ON public.notifications(is_read);

-- M2M + attr values
CREATE INDEX IF NOT EXISTS idx_project_tags_project     ON public.project_tags(project_id);
CREATE INDEX IF NOT EXISTS idx_project_tags_tag         ON public.project_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_attr_values_project      ON public.project_attribute_values(project_id);
CREATE INDEX IF NOT EXISTS idx_attr_values_attribute    ON public.project_attribute_values(attribute_id);
