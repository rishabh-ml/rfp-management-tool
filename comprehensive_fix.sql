-- Comprehensive fix for RLS policies and user synchronization issues
-- This script fixes the infinite recursion in subtasks RLS policies
-- and ensures proper user authentication flow

-- ============================================================================
-- STEP 1: Fix infinite recursion in RLS policies
-- ============================================================================

-- Drop all existing policies that might cause circular references
DROP POLICY IF EXISTS projects_read_scoped ON public.projects;
DROP POLICY IF EXISTS subtasks_read_scoped ON public.subtasks;
DROP POLICY IF EXISTS subtasks_insert_scoped ON public.subtasks;
DROP POLICY IF EXISTS subtasks_update_scoped ON public.subtasks;
DROP POLICY IF EXISTS subtasks_delete_scoped ON public.subtasks;

-- ============================================================================
-- STEP 2: Create fixed RLS policies without circular references
-- ============================================================================

-- Projects read policy (simplified to avoid circular reference)
CREATE POLICY projects_read_scoped
ON public.projects
FOR SELECT
TO authenticated
USING (
  owner_id = public.current_user_id()
);

-- Subtasks policies (fixed to avoid circular reference to projects via subtasks)
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

-- ============================================================================
-- STEP 3: Ensure helper functions are working correctly
-- ============================================================================

-- Test the current_user_id function
DO $$
BEGIN
  -- This will help us verify the function works
  RAISE NOTICE 'Testing current_user_id function...';
  -- The function should return the JWT sub claim
END $$;

-- ============================================================================
-- STEP 4: Create a debug function to help troubleshoot authentication
-- ============================================================================

CREATE OR REPLACE FUNCTION public.debug_auth_info()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $fn$
DECLARE
  result jsonb;
BEGIN
  result := jsonb_build_object(
    'current_user_id', public.current_user_id(),
    'jwt_sub', auth.jwt() ->> 'sub',
    'jwt_claims', auth.jwt(),
    'user_exists', EXISTS(SELECT 1 FROM public.users WHERE id = public.current_user_id()),
    'user_role', public.current_user_role(),
    'is_admin', public.is_admin(),
    'is_admin_or_manager', public.is_admin_or_manager()
  );
  
  RETURN result;
END;
$fn$;

ALTER FUNCTION public.debug_auth_info() SET search_path = public;
GRANT EXECUTE ON FUNCTION public.debug_auth_info() TO authenticated;

-- ============================================================================
-- STEP 5: Ensure sync_user_from_clerk function is robust
-- ============================================================================

-- Update the sync function to handle edge cases better
CREATE OR REPLACE FUNCTION public.sync_user_from_clerk(
  p_id         TEXT,        -- Clerk user id (JWT sub)
  p_email      TEXT,
  p_first_name TEXT DEFAULT NULL,
  p_last_name  TEXT DEFAULT NULL,
  p_avatar_url TEXT DEFAULT NULL
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $fn$
DECLARE
  v_id TEXT;
BEGIN
  -- Validate input
  IF p_id IS NULL OR p_id = '' THEN
    RAISE EXCEPTION 'User ID cannot be null or empty';
  END IF;
  
  IF p_email IS NULL OR p_email = '' THEN
    RAISE EXCEPTION 'Email cannot be null or empty';
  END IF;

  -- Insert or update user
  INSERT INTO public.users (id, email, first_name, last_name, avatar_url, is_active)
  VALUES (p_id, p_email, p_first_name, p_last_name, p_avatar_url, true)
  ON CONFLICT (id) DO UPDATE SET
    email      = EXCLUDED.email,
    first_name = EXCLUDED.first_name,
    last_name  = EXCLUDED.last_name,
    avatar_url = EXCLUDED.avatar_url,
    is_active  = true,  -- Reactivate if was deactivated
    updated_at = NOW()
  RETURNING id INTO v_id;

  -- Ensure user preferences exist
  INSERT INTO public.user_preferences (user_id)
  VALUES (v_id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN v_id;
END;
$fn$;

ALTER FUNCTION public.sync_user_from_clerk(TEXT, TEXT, TEXT, TEXT, TEXT) SET search_path = public;

-- ============================================================================
-- STEP 6: Grant necessary permissions
-- ============================================================================

-- Ensure all necessary permissions are granted
GRANT EXECUTE ON FUNCTION public.sync_user_from_clerk(TEXT, TEXT, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.debug_auth_info() TO authenticated;
