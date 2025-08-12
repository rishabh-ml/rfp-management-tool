-- Fix infinite recursion in subtasks RLS policies
-- This script applies the corrected RLS policies for subtasks table

--------------------------------------------------
-- SUBTASKS RLS POLICY FIXES
--------------------------------------------------

-- Drop existing policies that cause infinite recursion
DROP POLICY IF EXISTS subtasks_read_scoped ON public.subtasks;
DROP POLICY IF EXISTS subtasks_insert_scoped ON public.subtasks;
DROP POLICY IF EXISTS subtasks_update_scoped ON public.subtasks;
DROP POLICY IF EXISTS subtasks_delete_scoped ON public.subtasks;

-- Read subtasks on visible projects or assigned to me
-- Fixed: Removed circular reference to subtasks table in project visibility check
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
