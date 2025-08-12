-- Enhanced Functions for RFP Management System
-- Comprehensive database functions for the new schema

-- === Project Management Functions ===

-- Function to get projects with comprehensive filtering
CREATE OR REPLACE FUNCTION public.get_projects_enhanced(
  p_stage project_stage[] DEFAULT NULL,
  p_priority project_priority[] DEFAULT NULL,
  p_priority_banding priority_banding[] DEFAULT NULL,
  p_company_assignment company_assignment[] DEFAULT NULL,
  p_assigned_to TEXT[] DEFAULT NULL,
  p_owner_id TEXT[] DEFAULT NULL,
  p_client_name TEXT DEFAULT NULL,
  p_search TEXT DEFAULT NULL,
  p_due_date_from TIMESTAMPTZ DEFAULT NULL,
  p_due_date_to TIMESTAMPTZ DEFAULT NULL,
  p_rfp_date_from TIMESTAMPTZ DEFAULT NULL,
  p_rfp_date_to TIMESTAMPTZ DEFAULT NULL,
  p_include_archived BOOLEAN DEFAULT FALSE,
  p_limit INTEGER DEFAULT 50,
  p_offset INTEGER DEFAULT 0,
  p_order_by TEXT DEFAULT 'updated_at',
  p_order_direction TEXT DEFAULT 'DESC'
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
  budget_amount DECIMAL(12,2),
  is_archived BOOLEAN,
  -- RFP fields
  rfp_added_date TIMESTAMPTZ,
  rfp_title TEXT,
  client_name TEXT,
  client_email TEXT,
  state TEXT,
  portal_url TEXT,
  folder_url TEXT,
  rfp_document_url TEXT,
  submission_url TEXT,
  -- Post-review fields
  priority_banding priority_banding,
  review_comment TEXT,
  assigned_to TEXT,
  company_assignment company_assignment,
  -- System fields
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  -- Additional fields
  owner_name TEXT,
  assigned_name TEXT,
  tags_count INTEGER,
  comments_count INTEGER,
  subtasks_count INTEGER,
  completed_subtasks_count INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  query_text TEXT;
  order_clause TEXT;
BEGIN
  -- Build the base query
  query_text := '
    SELECT 
      p.id, p.title, p.description, p.stage, p.priority, p.due_date, p.owner_id,
      p.progress_percentage, p.status_notes, p.estimated_hours, p.actual_hours,
      p.budget_amount, p.is_archived,
      p.rfp_added_date, p.rfp_title, p.client_name, p.client_email, p.state,
      p.portal_url, p.folder_url, p.rfp_document_url, p.submission_url,
      p.priority_banding, p.review_comment, p.assigned_to, p.company_assignment,
      p.created_at, p.updated_at,
      COALESCE(owner.first_name || '' '' || owner.last_name, owner.email, ''Unknown'') as owner_name,
      COALESCE(assignee.first_name || '' '' || assignee.last_name, assignee.email, ''Unassigned'') as assigned_name,
      COALESCE(tag_counts.tags_count, 0) as tags_count,
      COALESCE(comment_counts.comments_count, 0) as comments_count,
      COALESCE(subtask_counts.subtasks_count, 0) as subtasks_count,
      COALESCE(subtask_counts.completed_subtasks_count, 0) as completed_subtasks_count
    FROM public.projects p
    LEFT JOIN public.users owner ON p.owner_id = owner.id
    LEFT JOIN public.users assignee ON p.assigned_to = assignee.id
    LEFT JOIN (
      SELECT project_id, COUNT(*) as tags_count
      FROM public.project_tags
      GROUP BY project_id
    ) tag_counts ON p.id = tag_counts.project_id
    LEFT JOIN (
      SELECT project_id, COUNT(*) as comments_count
      FROM public.comments
      GROUP BY project_id
    ) comment_counts ON p.id = comment_counts.project_id
    LEFT JOIN (
      SELECT 
        project_id, 
        COUNT(*) as subtasks_count,
        COUNT(*) FILTER (WHERE completed = true) as completed_subtasks_count
      FROM public.subtasks
      GROUP BY project_id
    ) subtask_counts ON p.id = subtask_counts.project_id
    WHERE 1=1
  ';

  -- Add filters
  IF NOT p_include_archived THEN
    query_text := query_text || ' AND p.is_archived = false';
  END IF;

  IF p_stage IS NOT NULL THEN
    query_text := query_text || ' AND p.stage = ANY($1)';
  END IF;

  IF p_priority IS NOT NULL THEN
    query_text := query_text || ' AND p.priority = ANY($2)';
  END IF;

  IF p_priority_banding IS NOT NULL THEN
    query_text := query_text || ' AND p.priority_banding = ANY($3)';
  END IF;

  IF p_company_assignment IS NOT NULL THEN
    query_text := query_text || ' AND p.company_assignment = ANY($4)';
  END IF;

  IF p_assigned_to IS NOT NULL THEN
    query_text := query_text || ' AND p.assigned_to = ANY($5)';
  END IF;

  IF p_owner_id IS NOT NULL THEN
    query_text := query_text || ' AND p.owner_id = ANY($6)';
  END IF;

  IF p_client_name IS NOT NULL THEN
    query_text := query_text || ' AND p.client_name ILIKE ''%'' || $7 || ''%''';
  END IF;

  IF p_search IS NOT NULL THEN
    query_text := query_text || ' AND (
      p.title ILIKE ''%'' || $8 || ''%'' OR 
      p.description ILIKE ''%'' || $8 || ''%'' OR
      p.client_name ILIKE ''%'' || $8 || ''%'' OR
      p.rfp_title ILIKE ''%'' || $8 || ''%''
    )';
  END IF;

  IF p_due_date_from IS NOT NULL THEN
    query_text := query_text || ' AND p.due_date >= $9';
  END IF;

  IF p_due_date_to IS NOT NULL THEN
    query_text := query_text || ' AND p.due_date <= $10';
  END IF;

  IF p_rfp_date_from IS NOT NULL THEN
    query_text := query_text || ' AND p.rfp_added_date >= $11';
  END IF;

  IF p_rfp_date_to IS NOT NULL THEN
    query_text := query_text || ' AND p.rfp_added_date <= $12';
  END IF;

  -- Add ordering
  CASE p_order_by
    WHEN 'title' THEN order_clause := 'p.title';
    WHEN 'client_name' THEN order_clause := 'p.client_name';
    WHEN 'due_date' THEN order_clause := 'p.due_date';
    WHEN 'rfp_added_date' THEN order_clause := 'p.rfp_added_date';
    WHEN 'priority' THEN order_clause := 'p.priority';
    WHEN 'stage' THEN order_clause := 'p.stage';
    WHEN 'created_at' THEN order_clause := 'p.created_at';
    ELSE order_clause := 'p.updated_at';
  END CASE;

  IF UPPER(p_order_direction) = 'ASC' THEN
    order_clause := order_clause || ' ASC';
  ELSE
    order_clause := order_clause || ' DESC';
  END IF;

  query_text := query_text || ' ORDER BY ' || order_clause;

  -- Add pagination
  query_text := query_text || ' LIMIT $13 OFFSET $14';

  -- Execute the query
  RETURN QUERY EXECUTE query_text USING
    p_stage, p_priority, p_priority_banding, p_company_assignment,
    p_assigned_to, p_owner_id, p_client_name, p_search,
    p_due_date_from, p_due_date_to, p_rfp_date_from, p_rfp_date_to,
    p_limit, p_offset;
END;
$$;

-- Function to get project statistics
CREATE OR REPLACE FUNCTION public.get_project_statistics(
  p_user_id TEXT DEFAULT NULL,
  p_company_assignment company_assignment DEFAULT NULL
)
RETURNS TABLE (
  total_projects BIGINT,
  unassigned_projects BIGINT,
  assigned_projects BIGINT,
  reviewed_projects BIGINT,
  submitted_projects BIGINT,
  won_projects BIGINT,
  lost_projects BIGINT,
  skipped_projects BIGINT,
  overdue_projects BIGINT,
  high_priority_projects BIGINT,
  p1_projects BIGINT,
  p2_projects BIGINT,
  p3_projects BIGINT,
  no_bid_projects BIGINT,
  avg_completion_percentage NUMERIC,
  total_budget NUMERIC,
  this_month_projects BIGINT,
  my_assigned_projects BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::BIGINT as total_projects,
    COUNT(*) FILTER (WHERE stage = 'unassigned')::BIGINT as unassigned_projects,
    COUNT(*) FILTER (WHERE stage = 'assigned')::BIGINT as assigned_projects,
    COUNT(*) FILTER (WHERE stage = 'reviewed')::BIGINT as reviewed_projects,
    COUNT(*) FILTER (WHERE stage = 'submitted')::BIGINT as submitted_projects,
    COUNT(*) FILTER (WHERE stage = 'won')::BIGINT as won_projects,
    COUNT(*) FILTER (WHERE stage = 'lost')::BIGINT as lost_projects,
    COUNT(*) FILTER (WHERE stage = 'skipped')::BIGINT as skipped_projects,
    COUNT(*) FILTER (WHERE due_date < NOW() AND stage NOT IN ('won', 'lost', 'skipped'))::BIGINT as overdue_projects,
    COUNT(*) FILTER (WHERE priority IN ('high', 'urgent'))::BIGINT as high_priority_projects,
    COUNT(*) FILTER (WHERE priority_banding = 'P1')::BIGINT as p1_projects,
    COUNT(*) FILTER (WHERE priority_banding = 'P2')::BIGINT as p2_projects,
    COUNT(*) FILTER (WHERE priority_banding = 'P3')::BIGINT as p3_projects,
    COUNT(*) FILTER (WHERE priority_banding = 'No bid')::BIGINT as no_bid_projects,
    ROUND(AVG(progress_percentage), 2) as avg_completion_percentage,
    COALESCE(SUM(budget_amount), 0) as total_budget,
    COUNT(*) FILTER (WHERE rfp_added_date >= date_trunc('month', CURRENT_DATE))::BIGINT as this_month_projects,
    COUNT(*) FILTER (WHERE assigned_to = COALESCE(p_user_id, public.current_user_id()))::BIGINT as my_assigned_projects
  FROM public.projects
  WHERE 
    is_archived = false AND
    (p_user_id IS NULL OR 
     owner_id = p_user_id OR 
     assigned_to = p_user_id OR
     public.is_manager_or_admin()) AND
    (p_company_assignment IS NULL OR company_assignment = p_company_assignment);
END;
$$;

-- Function to update project stage with validation
CREATE OR REPLACE FUNCTION public.update_project_stage(
  p_project_id UUID,
  p_new_stage project_stage,
  p_priority_banding priority_banding DEFAULT NULL,
  p_review_comment TEXT DEFAULT NULL,
  p_assigned_to TEXT DEFAULT NULL,
  p_company_assignment company_assignment DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_project public.projects%ROWTYPE;
  current_user_id TEXT;
  user_role user_role;
BEGIN
  -- Get current user info
  current_user_id := public.current_user_id();
  user_role := public.current_user_role();
  
  -- Get current project
  SELECT * INTO current_project FROM public.projects WHERE id = p_project_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Project not found';
  END IF;
  
  -- Check permissions
  IF NOT public.can_manage_project(current_project) THEN
    RAISE EXCEPTION 'Insufficient permissions to update project stage';
  END IF;
  
  -- Validate stage transition
  IF p_new_stage = 'reviewed' THEN
    -- Only managers+ can set to reviewed and must provide priority_banding
    IF user_role NOT IN ('admin', 'manager') THEN
      RAISE EXCEPTION 'Only managers and admins can move projects to reviewed stage';
    END IF;
    
    IF p_priority_banding IS NULL THEN
      RAISE EXCEPTION 'Priority banding is required when moving to reviewed stage';
    END IF;
    
    -- Update project with review information
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
  
  -- Log the activity
  INSERT INTO public.activity_log (
    user_id, action, entity_type, entity_id, 
    old_values, new_values, created_at
  ) VALUES (
    current_user_id, 'stage_updated', 'project', p_project_id,
    jsonb_build_object('stage', current_project.stage),
    jsonb_build_object(
      'stage', p_new_stage,
      'priority_banding', p_priority_banding,
      'assigned_to', p_assigned_to,
      'company_assignment', p_company_assignment
    ),
    NOW()
  );
  
  RETURN true;
END;
$$;

-- Function to assign project to user
CREATE OR REPLACE FUNCTION public.assign_project_to_user(
  p_project_id UUID,
  p_assigned_to TEXT,
  p_company_assignment company_assignment DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_project public.projects%ROWTYPE;
  target_user public.users%ROWTYPE;
BEGIN
  -- Get current project
  SELECT * INTO current_project FROM public.projects WHERE id = p_project_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Project not found';
  END IF;
  
  -- Check permissions
  IF NOT public.can_manage_project(current_project) THEN
    RAISE EXCEPTION 'Insufficient permissions to assign project';
  END IF;
  
  -- Validate target user
  SELECT * INTO target_user FROM public.users WHERE id = p_assigned_to AND is_active = true;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Target user not found or inactive';
  END IF;
  
  -- Update project
  UPDATE public.projects 
  SET 
    assigned_to = p_assigned_to,
    company_assignment = COALESCE(p_company_assignment, company_assignment),
    stage = CASE 
      WHEN stage = 'unassigned' THEN 'assigned'::project_stage 
      ELSE stage 
    END,
    updated_at = NOW()
  WHERE id = p_project_id;
  
  -- Create notification for assigned user
  INSERT INTO public.notifications (
    user_id, title, message, type, entity_type, entity_id, created_at
  ) VALUES (
    p_assigned_to,
    'Project Assigned',
    'You have been assigned to project: ' || current_project.title,
    'project_assigned',
    'project',
    p_project_id,
    NOW()
  );
  
  -- Log the activity
  INSERT INTO public.activity_log (
    user_id, action, entity_type, entity_id,
    new_values, created_at
  ) VALUES (
    public.current_user_id(),
    'project_assigned',
    'project',
    p_project_id,
    jsonb_build_object(
      'assigned_to', p_assigned_to,
      'company_assignment', p_company_assignment
    ),
    NOW()
  );
  
  RETURN true;
END;
$$;

-- Function to get project dashboard data
CREATE OR REPLACE FUNCTION public.get_project_dashboard()
RETURNS TABLE (
  stage project_stage,
  priority_banding priority_banding,
  company_assignment company_assignment,
  project_count BIGINT,
  total_budget NUMERIC,
  avg_progress NUMERIC,
  overdue_count BIGINT
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    p.stage,
    p.priority_banding,
    p.company_assignment,
    COUNT(*) as project_count,
    COALESCE(SUM(p.budget_amount), 0) as total_budget,
    ROUND(AVG(p.progress_percentage), 2) as avg_progress,
    COUNT(*) FILTER (WHERE p.due_date < NOW()) as overdue_count
  FROM public.projects p
  WHERE 
    p.is_archived = false AND
    (p.owner_id = public.current_user_id() OR
     p.assigned_to = public.current_user_id() OR
     public.is_manager_or_admin())
  GROUP BY p.stage, p.priority_banding, p.company_assignment
  ORDER BY p.stage, p.priority_banding, p.company_assignment;
$$;

-- Function to search projects with full-text search
CREATE OR REPLACE FUNCTION public.search_projects(
  p_search_term TEXT,
  p_limit INTEGER DEFAULT 20
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  client_name TEXT,
  stage project_stage,
  rfp_added_date TIMESTAMPTZ,
  match_rank REAL
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    p.id,
    p.title,
    p.client_name,
    p.stage,
    p.rfp_added_date,
    ts_rank(
      to_tsvector('english', p.title || ' ' || COALESCE(p.description, '') || ' ' || p.client_name),
      plainto_tsquery('english', p_search_term)
    ) as match_rank
  FROM public.projects p
  WHERE 
    p.is_archived = false AND
    (p.owner_id = public.current_user_id() OR
     p.assigned_to = public.current_user_id() OR
     public.is_manager_or_admin()) AND
    to_tsvector('english', p.title || ' ' || COALESCE(p.description, '') || ' ' || p.client_name) @@ plainto_tsquery('english', p_search_term)
  ORDER BY match_rank DESC, p.updated_at DESC
  LIMIT p_limit;
$$;

-- === Grant permissions ===

GRANT EXECUTE ON FUNCTION public.get_projects_enhanced TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_project_statistics TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_project_stage TO authenticated;
GRANT EXECUTE ON FUNCTION public.assign_project_to_user TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_project_dashboard TO authenticated;
GRANT EXECUTE ON FUNCTION public.search_projects TO authenticated;
