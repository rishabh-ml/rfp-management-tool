-- Additional triggers and constraints for data integrity
-- These supplement the RLS policies with proper data validation

-- === Trigger function to protect owner_id changes ===
CREATE OR REPLACE FUNCTION public.protect_project_owner()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only allow owner_id changes if user is admin
  IF OLD.owner_id != NEW.owner_id AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only administrators can change project ownership';
  END IF;
  
  -- Validate review fields when stage is 'reviewed'
  IF NEW.stage = 'reviewed'::project_stage THEN
    -- Ensure priority_banding is set
    IF NEW.priority_banding IS NULL THEN
      RAISE EXCEPTION 'Priority banding is required when project stage is reviewed';
    END IF;
    
    -- Only managers and admins can set stage to reviewed
    IF OLD.stage != 'reviewed'::project_stage AND NOT public.is_manager_or_admin() THEN
      RAISE EXCEPTION 'Only managers and administrators can move projects to reviewed stage';
    END IF;
  END IF;
  
  -- Log the change
  INSERT INTO public.activity_log (
    user_id, action, entity_type, entity_id, old_values, new_values, created_at
  ) VALUES (
    public.current_user_id(),
    'project_updated',
    'project',
    NEW.id,
    row_to_json(OLD),
    row_to_json(NEW),
    NOW()
  );
  
  RETURN NEW;
END;
$$;

-- Apply the trigger
DROP TRIGGER IF EXISTS protect_project_owner_trigger ON public.projects;
CREATE TRIGGER protect_project_owner_trigger
  BEFORE UPDATE ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_project_owner();

-- === Function to safely update project stage ===
CREATE OR REPLACE FUNCTION public.safe_update_project_stage(
  p_project_id UUID,
  p_new_stage project_stage,
  p_priority_banding priority_banding DEFAULT NULL,
  p_review_comment TEXT DEFAULT NULL,
  p_assigned_to TEXT DEFAULT NULL,
  p_company_assignment company_assignment DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_project public.projects%ROWTYPE;
  current_user_id TEXT;
  user_role user_role;
  result json;
BEGIN
  -- Get current user info
  current_user_id := public.current_user_id();
  user_role := public.current_user_role();
  
  -- Get current project
  SELECT * INTO current_project FROM public.projects WHERE id = p_project_id;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Project not found');
  END IF;
  
  -- Check permissions
  IF NOT public.can_manage_project(current_project) THEN
    RETURN json_build_object('success', false, 'error', 'Insufficient permissions to update project stage');
  END IF;
  
  -- Validate stage transition to 'reviewed'
  IF p_new_stage = 'reviewed' THEN
    -- Only managers+ can set to reviewed
    IF user_role NOT IN ('admin', 'manager') THEN
      RETURN json_build_object('success', false, 'error', 'Only managers and admins can move projects to reviewed stage');
    END IF;
    
    -- Require priority_banding
    IF p_priority_banding IS NULL THEN
      RETURN json_build_object('success', false, 'error', 'Priority banding is required when moving to reviewed stage');
    END IF;
    
    -- Update with review information
    UPDATE public.projects 
    SET 
      stage = p_new_stage,
      priority_banding = p_priority_banding,
      review_comment = p_review_comment,
      assigned_to = COALESCE(p_assigned_to, assigned_to),
      company_assignment = COALESCE(p_company_assignment, company_assignment),
      updated_at = NOW()
    WHERE id = p_project_id;
    
  ELSE
    -- Regular stage update
    UPDATE public.projects 
    SET 
      stage = p_new_stage,
      updated_at = NOW()
    WHERE id = p_project_id;
  END IF;
  
  -- Create notification if assigned to someone
  IF p_assigned_to IS NOT NULL AND p_assigned_to != current_project.assigned_to THEN
    INSERT INTO public.notifications (
      user_id, title, message, type, entity_type, entity_id, created_at
    ) VALUES (
      p_assigned_to,
      'Project Assignment',
      'You have been assigned to project: ' || current_project.title,
      'project_assigned',
      'project',
      p_project_id,
      NOW()
    );
  END IF;
  
  RETURN json_build_object(
    'success', true, 
    'message', 'Project stage updated successfully',
    'project_id', p_project_id,
    'new_stage', p_new_stage
  );
  
EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object(
    'success', false, 
    'error', SQLERRM
  );
END;
$$;

-- === Grant permissions ===
GRANT EXECUTE ON FUNCTION public.safe_update_project_stage TO authenticated;
GRANT EXECUTE ON FUNCTION public.protect_project_owner TO authenticated;
