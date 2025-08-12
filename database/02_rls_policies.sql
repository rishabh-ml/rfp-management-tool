-- RFP Management System — Row Level Security (RLS) Policies
-- Assumes: users.id is TEXT = Clerk user id (JWT 'sub')
-- Uses auth.jwt() claims per Supabase TPA docs.

----------------------------
-- Enable RLS on all tables
----------------------------
ALTER TABLE public.users                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_attributes      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_attribute_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_tags           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subtasks               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_log           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitations            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences       ENABLE ROW LEVEL SECURITY;

--------------------------------------------------
-- Helper functions (stable, search_path pinned)
--------------------------------------------------

-- Current user id from JWT (TEXT)
CREATE OR REPLACE FUNCTION public.current_user_id()
RETURNS text
LANGUAGE sql
STABLE
AS $$
  select auth.jwt() ->> 'sub'
$$;

ALTER FUNCTION public.current_user_id() SET search_path = public;

-- Helper function to get current user id (for testing/debugging)
CREATE OR REPLACE FUNCTION public.get_current_user_id()
RETURNS text
LANGUAGE sql
STABLE
AS $$
  select public.current_user_id()
$$;

ALTER FUNCTION public.get_current_user_id() SET search_path = public;

-- Current role (from users table)
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS user_role
LANGUAGE plpgsql
SECURITY DEFINER
AS $fn$
DECLARE
  r user_role;
BEGIN
  SELECT role INTO r
  FROM public.users
  WHERE id = public.current_user_id(); -- TEXT id
  RETURN r;
END;
$fn$;

ALTER FUNCTION public.current_user_role() SET search_path = public;

-- Convenience predicates
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  select public.current_user_role() = 'admin'
$$;

CREATE OR REPLACE FUNCTION public.is_admin_or_manager()
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  select public.current_user_role() in ('admin','manager')
$$;

ALTER FUNCTION public.is_admin() SET search_path = public;
ALTER FUNCTION public.is_admin_or_manager() SET search_path = public;

--------------------------------------------------
-- USERS
--------------------------------------------------
-- Read own row; admins can read all
DROP POLICY IF EXISTS users_self_read ON public.users;
CREATE POLICY users_self_read
ON public.users
FOR SELECT
TO authenticated
USING (
  id = public.current_user_id() OR public.is_admin()
);

-- Update own row; admins manage all
DROP POLICY IF EXISTS users_self_update ON public.users;
CREATE POLICY users_self_update
ON public.users
FOR UPDATE
TO authenticated
USING (id = public.current_user_id())
WITH CHECK (id = public.current_user_id());

DROP POLICY IF EXISTS users_admin_all ON public.users;
CREATE POLICY users_admin_all
ON public.users
FOR ALL
TO authenticated
USING (public.is_admin());

--------------------------------------------------
-- CUSTOM ATTRIBUTES
--------------------------------------------------
-- Everyone can read active attributes
DROP POLICY IF EXISTS attr_read_active ON public.custom_attributes;
CREATE POLICY attr_read_active
ON public.custom_attributes
FOR SELECT
TO authenticated
USING (is_active = true);

-- Admin/manager manage all
DROP POLICY IF EXISTS attr_manage_admin_manager ON public.custom_attributes;
CREATE POLICY attr_manage_admin_manager
ON public.custom_attributes
FOR ALL
TO authenticated
USING (public.is_admin_or_manager());

--------------------------------------------------
-- TAGS
--------------------------------------------------
DROP POLICY IF EXISTS tags_read_active ON public.tags;
CREATE POLICY tags_read_active
ON public.tags
FOR SELECT
TO authenticated
USING (is_active = true);

DROP POLICY IF EXISTS tags_manage_admin_manager ON public.tags;
CREATE POLICY tags_manage_admin_manager
ON public.tags
FOR ALL
TO authenticated
USING (public.is_admin_or_manager());

--------------------------------------------------
-- PROJECTS
--------------------------------------------------
-- Read: owner or assigned via any subtask
DROP POLICY IF EXISTS projects_read_scoped ON public.projects;
CREATE POLICY projects_read_scoped
ON public.projects
FOR SELECT
TO authenticated
USING (
  owner_id = public.current_user_id()
  OR EXISTS (
    SELECT 1 FROM public.subtasks s
    WHERE s.project_id = public.projects.id
      AND s.assigned_to = public.current_user_id()
  )
);

-- Insert: owner must be current user
DROP POLICY IF EXISTS projects_insert_owner ON public.projects;
CREATE POLICY projects_insert_owner
ON public.projects
FOR INSERT
TO authenticated
WITH CHECK (owner_id = public.current_user_id());

-- Update: owner OR admin/manager
DROP POLICY IF EXISTS projects_update_scoped ON public.projects;
CREATE POLICY projects_update_scoped
ON public.projects
FOR UPDATE
TO authenticated
USING (
  owner_id = public.current_user_id()
  OR public.is_admin_or_manager()
)
WITH CHECK (
  owner_id = public.current_user_id()
  OR public.is_admin_or_manager()
);

-- Delete: admins only
DROP POLICY IF EXISTS projects_delete_admin ON public.projects;
CREATE POLICY projects_delete_admin
ON public.projects
FOR DELETE
TO authenticated
USING (public.is_admin());

--------------------------------------------------
-- PROJECT ATTRIBUTE VALUES
--------------------------------------------------
-- Read: project visible (owner or assignee)
DROP POLICY IF EXISTS pav_read_scoped ON public.project_attribute_values;
CREATE POLICY pav_read_scoped
ON public.project_attribute_values
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = project_id
      AND (
        p.owner_id = public.current_user_id()
        OR EXISTS (
          SELECT 1 FROM public.subtasks s
          WHERE s.project_id = p.id
            AND s.assigned_to = public.current_user_id()
        )
      )
  )
);

-- Manage: admin/manager OR project owner
DROP POLICY IF EXISTS pav_manage_scoped ON public.project_attribute_values;
CREATE POLICY pav_manage_scoped
ON public.project_attribute_values
FOR ALL
TO authenticated
USING (
  public.is_admin_or_manager()
  OR EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = project_id
      AND p.owner_id = public.current_user_id()
  )
)
WITH CHECK (
  public.is_admin_or_manager()
  OR EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = project_id
      AND p.owner_id = public.current_user_id()
  )
);

--------------------------------------------------
-- PROJECT TAGS
--------------------------------------------------
DROP POLICY IF EXISTS pt_read_scoped ON public.project_tags;
CREATE POLICY pt_read_scoped
ON public.project_tags
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = project_id
      AND (
        p.owner_id = public.current_user_id()
        OR EXISTS (
          SELECT 1 FROM public.subtasks s
          WHERE s.project_id = p.id
            AND s.assigned_to = public.current_user_id()
        )
      )
  )
);

DROP POLICY IF EXISTS pt_manage_scoped ON public.project_tags;
CREATE POLICY pt_manage_scoped
ON public.project_tags
FOR ALL
TO authenticated
USING (
  public.is_admin_or_manager()
  OR EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = project_id
      AND p.owner_id = public.current_user_id()
  )
)
WITH CHECK (
  public.is_admin_or_manager()
  OR EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = project_id
      AND p.owner_id = public.current_user_id()
  )
);

--------------------------------------------------
-- COMMENTS
--------------------------------------------------
-- Read comments on visible projects
DROP POLICY IF EXISTS comments_read_scoped ON public.comments;
CREATE POLICY comments_read_scoped
ON public.comments
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = project_id
      AND (
        p.owner_id = public.current_user_id()
        OR EXISTS (
          SELECT 1 FROM public.subtasks s
          WHERE s.project_id = p.id
            AND s.assigned_to = public.current_user_id()
        )
      )
  )
);

-- Insert: author = current user and project visible
DROP POLICY IF EXISTS comments_insert_scoped ON public.comments;
CREATE POLICY comments_insert_scoped
ON public.comments
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = public.current_user_id()
  AND EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = project_id
      AND (
        p.owner_id = public.current_user_id()
        OR EXISTS (
          SELECT 1 FROM public.subtasks s
          WHERE s.project_id = p.id
            AND s.assigned_to = public.current_user_id()
        )
      )
  )
);

-- Update: author only
DROP POLICY IF EXISTS comments_update_own ON public.comments;
CREATE POLICY comments_update_own
ON public.comments
FOR UPDATE
TO authenticated
USING (user_id = public.current_user_id())
WITH CHECK (user_id = public.current_user_id());

-- Delete: author or admin/manager
DROP POLICY IF EXISTS comments_delete_scoped ON public.comments;
CREATE POLICY comments_delete_scoped
ON public.comments
FOR DELETE
TO authenticated
USING (
  user_id = public.current_user_id()
  OR public.is_admin_or_manager()
);

--------------------------------------------------
-- SUBTASKS
--------------------------------------------------
-- Read subtasks on visible projects or assigned to me
-- Fixed: Removed circular reference to subtasks table in project visibility check
DROP POLICY IF EXISTS subtasks_read_scoped ON public.subtasks;
CREATE POLICY subtasks_read_scoped
ON public.subtasks
FOR SELECT
TO authenticated
USING (
  assigned_to = public.current_user_id()
  OR EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = project_id
      AND p.owner_id = public.current_user_id()
  )
);

-- Insert: project owner or admin/manager
DROP POLICY IF EXISTS subtasks_insert_scoped ON public.subtasks;
CREATE POLICY subtasks_insert_scoped
ON public.subtasks
FOR INSERT
TO authenticated
WITH CHECK (
  public.is_admin_or_manager()
  OR EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = project_id
      AND p.owner_id = public.current_user_id()
  )
);

-- Update: assignee OR project owner OR admin/manager
DROP POLICY IF EXISTS subtasks_update_scoped ON public.subtasks;
CREATE POLICY subtasks_update_scoped
ON public.subtasks
FOR UPDATE
TO authenticated
USING (
  assigned_to = public.current_user_id()
  OR public.is_admin_or_manager()
  OR EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = project_id
      AND p.owner_id = public.current_user_id()
  )
)
WITH CHECK (
  assigned_to = public.current_user_id()
  OR public.is_admin_or_manager()
  OR EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = project_id
      AND p.owner_id = public.current_user_id()
  )
);

-- Delete: project owner or admin/manager
DROP POLICY IF EXISTS subtasks_delete_scoped ON public.subtasks;
CREATE POLICY subtasks_delete_scoped
ON public.subtasks
FOR DELETE
TO authenticated
USING (
  public.is_admin_or_manager()
  OR EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = project_id
      AND p.owner_id = public.current_user_id()
  )
);

--------------------------------------------------
-- ACTIVITY LOG
--------------------------------------------------
-- Read: admin sees all; user sees own
DROP POLICY IF EXISTS al_read_scoped ON public.activity_log;
CREATE POLICY al_read_scoped
ON public.activity_log
FOR SELECT
TO authenticated
USING (
  public.is_admin_or_manager()
  OR user_id = public.current_user_id()
);

-- Insert: allow user to write own entries (server functions can pass NULL or the user id)
DROP POLICY IF EXISTS al_insert_own ON public.activity_log;
CREATE POLICY al_insert_own
ON public.activity_log
FOR INSERT
TO authenticated
WITH CHECK (
  user_id IS NULL OR user_id = public.current_user_id()
);

--------------------------------------------------
-- INVITATIONS
--------------------------------------------------
-- Admin manage all
DROP POLICY IF EXISTS inv_admin_all ON public.invitations;
CREATE POLICY inv_admin_all
ON public.invitations
FOR ALL
TO authenticated
USING (public.is_admin());

-- Read invitations sent to my email
DROP POLICY IF EXISTS inv_read_mine ON public.invitations;
CREATE POLICY inv_read_mine
ON public.invitations
FOR SELECT
TO authenticated
USING (
  email = (SELECT email FROM public.users WHERE id = public.current_user_id())
);

--------------------------------------------------
-- NOTIFICATIONS
--------------------------------------------------
-- Read & update own
DROP POLICY IF EXISTS notif_read_own ON public.notifications;
CREATE POLICY notif_read_own
ON public.notifications
FOR SELECT
TO authenticated
USING (user_id = public.current_user_id());

DROP POLICY IF EXISTS notif_update_own ON public.notifications;
CREATE POLICY notif_update_own
ON public.notifications
FOR UPDATE
TO authenticated
USING (user_id = public.current_user_id())
WITH CHECK (user_id = public.current_user_id());

-- Insert: allow client to create its own notifications; server (service role) bypasses RLS
DROP POLICY IF EXISTS notif_insert_own ON public.notifications;
CREATE POLICY notif_insert_own
ON public.notifications
FOR INSERT
TO authenticated
WITH CHECK (user_id = public.current_user_id());

--------------------------------------------------
-- USER PREFERENCES
--------------------------------------------------
DROP POLICY IF EXISTS prefs_self_all ON public.user_preferences;
CREATE POLICY prefs_self_all
ON public.user_preferences
FOR ALL
TO authenticated
USING (user_id = public.current_user_id())
WITH CHECK (user_id = public.current_user_id());

--------------------------------------------------
-- Minimal grants (RLS still applies)
--------------------------------------------------
GRANT USAGE ON SCHEMA public TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.projects                TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.subtasks                TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.comments                TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.project_tags            TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.project_attribute_values TO authenticated;
GRANT SELECT, UPDATE               ON public.users                     TO authenticated;
GRANT SELECT                       ON public.tags, public.custom_attributes TO authenticated;
GRANT SELECT, INSERT, UPDATE       ON public.user_preferences          TO authenticated;
GRANT SELECT, INSERT, UPDATE       ON public.notifications             TO authenticated;
GRANT SELECT                       ON public.activity_log, public.invitations TO authenticated;

-- Function exec grants
GRANT EXECUTE ON FUNCTION public.current_user_id()      TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_current_user_id()  TO authenticated;
GRANT EXECUTE ON FUNCTION public.current_user_role()    TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin()             TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin_or_manager()  TO authenticated;

-- Notes:
-- * With third-party auth, prefer auth.jwt()->>'sub' in policies. auth.uid() expects a UUID sub. :contentReference[oaicite:1]{index=1}
-- * Avoid relying on mutable JWT fields like user_metadata in RLS. Use stable claims (sub, role) or DB lookups. :contentReference[oaicite:2]{index=2}
