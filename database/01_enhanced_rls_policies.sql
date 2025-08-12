-- Enhanced RLS Policies for RFP Management System
-- Comprehensive security policies for the new schema with RFP-specific fields

-- === Enable RLS on all tables ===
ALTER TABLE public.users                      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_attributes          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags                       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_attribute_values   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_tags               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subtasks                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_log               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitations                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences           ENABLE ROW LEVEL SECURITY;

-- === Helper functions ===

-- Current user id from JWT (TEXT)
CREATE OR REPLACE FUNCTION public.current_user_id()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT COALESCE(auth.jwt() ->> 'sub', '')::text
$$;

-- Current user role
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS user_role
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT COALESCE(
    (SELECT role FROM public.users WHERE id = public.current_user_id()),
    'member'::user_role
  )
$$;

-- Check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT public.current_user_role() = 'admin'::user_role
$$;

-- Check if current user is manager or admin
CREATE OR REPLACE FUNCTION public.is_manager_or_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT public.current_user_role() IN ('admin'::user_role, 'manager'::user_role)
$$;

-- Check if user can manage project (owner, assignee, or manager+)
CREATE OR REPLACE FUNCTION public.can_manage_project(project_row public.projects)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT 
    project_row.owner_id = public.current_user_id() OR
    project_row.assigned_to = public.current_user_id() OR
    public.is_manager_or_admin()
$$;

-- Check if user can update project (with owner protection)
CREATE OR REPLACE FUNCTION public.can_update_project(project_row public.projects)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT public.can_manage_project(project_row)
$$;

-- === USERS Table Policies ===

-- Users can view their own profile and admins can view all
CREATE POLICY "Users can view own profile, admins view all"
ON public.users FOR SELECT
USING (
  id = public.current_user_id() OR 
  public.is_admin()
);

-- Users can update their own profile, admins can update all
CREATE POLICY "Users can update own profile, admins update all"
ON public.users FOR UPDATE
USING (
  id = public.current_user_id() OR 
  public.is_admin()
);

-- Only admins can insert new users (via webhook typically)
CREATE POLICY "Only admins can insert users"
ON public.users FOR INSERT
WITH CHECK (public.is_admin());

-- Only admins can delete users
CREATE POLICY "Only admins can delete users"
ON public.users FOR DELETE
USING (public.is_admin());

-- === PROJECTS Table Policies ===

-- All authenticated users can view non-archived projects they have access to
CREATE POLICY "Users can view accessible projects"
ON public.projects FOR SELECT
USING (
  NOT is_archived AND (
    -- Project owner
    owner_id = public.current_user_id() OR
    -- Assigned user
    assigned_to = public.current_user_id() OR
    -- Managers and admins can see all
    public.is_manager_or_admin() OR
    -- Members can see unassigned projects for potential assignment
    (stage = 'unassigned' AND public.current_user_role() = 'member'::user_role)
  )
);

-- Users can create projects if they are active
CREATE POLICY "Active users can create projects"
ON public.projects FOR INSERT
WITH CHECK (
  EXISTS (SELECT 1 FROM public.users WHERE id = public.current_user_id() AND is_active = true) AND
  owner_id = public.current_user_id()
);

-- Users can update projects they can manage
CREATE POLICY "Users can update manageable projects"
ON public.projects FOR UPDATE
USING (public.can_update_project(projects))
WITH CHECK (
  public.can_update_project(projects) AND
  -- Review fields can only be set when stage is 'reviewed' and user is manager+
  (
    stage != 'reviewed'::project_stage OR 
    (
      stage = 'reviewed'::project_stage AND
      public.is_manager_or_admin() AND
      priority_banding IS NOT NULL
    )
  ) AND
  -- Assigned_to can only be set by managers+ or if assigning to self
  (
    assigned_to IS NULL OR
    assigned_to = public.current_user_id() OR
    public.is_manager_or_admin()
  )
);

-- Only admins can delete projects (soft delete via is_archived preferred)
CREATE POLICY "Only admins can delete projects"
ON public.projects FOR DELETE
USING (public.is_admin());

-- === PROJECT TAGS Policies ===

-- Users can view project tags for projects they can access
CREATE POLICY "Users can view project tags for accessible projects"
ON public.project_tags FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.projects p 
    WHERE p.id = project_id AND public.can_manage_project(p)
  )
);

-- Users can manage tags for projects they can manage
CREATE POLICY "Users can manage tags for manageable projects"
ON public.project_tags FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.projects p 
    WHERE p.id = project_id AND public.can_manage_project(p)
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.projects p 
    WHERE p.id = project_id AND public.can_manage_project(p)
  )
);

-- === COMMENTS Policies ===

-- Users can view comments on accessible projects
CREATE POLICY "Users can view comments on accessible projects"
ON public.comments FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.projects p 
    WHERE p.id = project_id AND (
      p.owner_id = public.current_user_id() OR
      p.assigned_to = public.current_user_id() OR
      public.is_manager_or_admin()
    )
  )
);

-- Users can add comments to accessible projects
CREATE POLICY "Users can add comments to accessible projects"
ON public.comments FOR INSERT
WITH CHECK (
  user_id = public.current_user_id() AND
  EXISTS (
    SELECT 1 FROM public.projects p 
    WHERE p.id = project_id AND (
      p.owner_id = public.current_user_id() OR
      p.assigned_to = public.current_user_id() OR
      public.is_manager_or_admin()
    )
  )
);

-- Users can update their own comments
CREATE POLICY "Users can update own comments"
ON public.comments FOR UPDATE
USING (user_id = public.current_user_id())
WITH CHECK (user_id = public.current_user_id());

-- Users can delete their own comments, admins can delete any
CREATE POLICY "Users can delete own comments, admins delete any"
ON public.comments FOR DELETE
USING (
  user_id = public.current_user_id() OR 
  public.is_admin()
);

-- === SUBTASKS Policies ===

-- Users can view subtasks for accessible projects
CREATE POLICY "Users can view subtasks for accessible projects"
ON public.subtasks FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.projects p 
    WHERE p.id = project_id AND (
      p.owner_id = public.current_user_id() OR
      p.assigned_to = public.current_user_id() OR
      public.is_manager_or_admin()
    )
  ) OR
  assigned_to = public.current_user_id()
);

-- Users can create subtasks for manageable projects
CREATE POLICY "Users can create subtasks for manageable projects"
ON public.subtasks FOR INSERT
WITH CHECK (
  created_by = public.current_user_id() AND
  EXISTS (
    SELECT 1 FROM public.projects p 
    WHERE p.id = project_id AND public.can_manage_project(p)
  )
);

-- Users can update subtasks they created or are assigned to, managers can update all
CREATE POLICY "Users can update relevant subtasks"
ON public.subtasks FOR UPDATE
USING (
  created_by = public.current_user_id() OR
  assigned_to = public.current_user_id() OR
  EXISTS (
    SELECT 1 FROM public.projects p 
    WHERE p.id = project_id AND public.can_manage_project(p)
  )
);

-- Users can delete subtasks they created, managers can delete project subtasks
CREATE POLICY "Users can delete relevant subtasks"
ON public.subtasks FOR DELETE
USING (
  created_by = public.current_user_id() OR
  EXISTS (
    SELECT 1 FROM public.projects p 
    WHERE p.id = project_id AND public.can_manage_project(p)
  )
);

-- === TAGS Policies ===

-- All authenticated users can view active tags
CREATE POLICY "Users can view active tags"
ON public.tags FOR SELECT
USING (is_active = true);

-- Managers and admins can manage tags
CREATE POLICY "Managers can manage tags"
ON public.tags FOR ALL
USING (public.is_manager_or_admin())
WITH CHECK (public.is_manager_or_admin());

-- === CUSTOM ATTRIBUTES Policies ===

-- All users can view active custom attributes
CREATE POLICY "Users can view active custom attributes"
ON public.custom_attributes FOR SELECT
USING (is_active = true);

-- Managers and admins can manage custom attributes
CREATE POLICY "Managers can manage custom attributes"
ON public.custom_attributes FOR ALL
USING (public.is_manager_or_admin())
WITH CHECK (public.is_manager_or_admin());

-- === PROJECT ATTRIBUTE VALUES Policies ===

-- Users can view attribute values for accessible projects
CREATE POLICY "Users can view attribute values for accessible projects"
ON public.project_attribute_values FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.projects p 
    WHERE p.id = project_id AND public.can_manage_project(p)
  )
);

-- Users can manage attribute values for manageable projects
CREATE POLICY "Users can manage attribute values for manageable projects"
ON public.project_attribute_values FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.projects p 
    WHERE p.id = project_id AND public.can_manage_project(p)
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.projects p 
    WHERE p.id = project_id AND public.can_manage_project(p)
  )
);

-- === NOTIFICATIONS Policies ===

-- Users can only see their own notifications
CREATE POLICY "Users can view own notifications"
ON public.notifications FOR SELECT
USING (user_id = public.current_user_id());

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
ON public.notifications FOR UPDATE
USING (user_id = public.current_user_id())
WITH CHECK (user_id = public.current_user_id());

-- System can insert notifications, managers can insert for team members
CREATE POLICY "System and managers can create notifications"
ON public.notifications FOR INSERT
WITH CHECK (
  public.is_manager_or_admin() OR
  user_id = public.current_user_id()
);

-- Users can delete their own notifications
CREATE POLICY "Users can delete own notifications"
ON public.notifications FOR DELETE
USING (user_id = public.current_user_id());

-- === USER PREFERENCES Policies ===

-- Users can only access their own preferences
CREATE POLICY "Users can manage own preferences"
ON public.user_preferences FOR ALL
USING (user_id = public.current_user_id())
WITH CHECK (user_id = public.current_user_id());

-- === INVITATIONS Policies ===

-- Managers and admins can manage invitations
CREATE POLICY "Managers can manage invitations"
ON public.invitations FOR ALL
USING (public.is_manager_or_admin())
WITH CHECK (public.is_manager_or_admin());

-- Users can view invitations sent to their email
CREATE POLICY "Users can view invitations to their email"
ON public.invitations FOR SELECT
USING (
  email = (SELECT email FROM public.users WHERE id = public.current_user_id()) OR
  public.is_manager_or_admin()
);

-- === ACTIVITY LOG Policies ===

-- Managers and admins can view activity logs
CREATE POLICY "Managers can view activity logs"
ON public.activity_log FOR SELECT
USING (public.is_manager_or_admin());

-- System can insert activity logs
CREATE POLICY "System can insert activity logs"
ON public.activity_log FOR INSERT
WITH CHECK (true); -- This will typically be inserted by triggers or system functions

-- Admins can delete old activity logs
CREATE POLICY "Admins can delete activity logs"
ON public.activity_log FOR DELETE
USING (public.is_admin());

-- === Grant permissions to authenticated users ===

-- Grant usage on schemas
GRANT USAGE ON SCHEMA public TO authenticated;

-- Grant permissions on tables
GRANT ALL ON public.users TO authenticated;
GRANT ALL ON public.projects TO authenticated;
GRANT ALL ON public.tags TO authenticated;
GRANT ALL ON public.custom_attributes TO authenticated;
GRANT ALL ON public.project_attribute_values TO authenticated;
GRANT ALL ON public.project_tags TO authenticated;
GRANT ALL ON public.comments TO authenticated;
GRANT ALL ON public.subtasks TO authenticated;
GRANT ALL ON public.notifications TO authenticated;
GRANT ALL ON public.user_preferences TO authenticated;
GRANT ALL ON public.invitations TO authenticated;
GRANT ALL ON public.activity_log TO authenticated;

-- Grant usage on sequences (for UUID generation)
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- === Security Functions Available to Authenticated Users ===

GRANT EXECUTE ON FUNCTION public.current_user_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.current_user_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_manager_or_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_manage_project(public.projects) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_update_project(public.projects) TO authenticated;
