-- Database Functions for RFP Management Tool
-- These functions provide common operations and business logic

-- Function to update project stage and log the activity
CREATE OR REPLACE FUNCTION update_project_stage(
  project_uuid UUID,
  new_stage project_stage,
  user_uuid UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  old_stage project_stage;
  project_title TEXT;
BEGIN
  -- Get current stage and title
  SELECT stage, title INTO old_stage, project_title
  FROM projects 
  WHERE id = project_uuid;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Project not found';
  END IF;
  
  -- Update the project stage
  UPDATE projects 
  SET stage = new_stage, updated_at = NOW()
  WHERE id = project_uuid;
  
  -- Log the activity
  INSERT INTO activity_log (project_id, user_id, action, details)
  VALUES (
    project_uuid,
    user_uuid,
    'stage_changed',
    jsonb_build_object(
      'old_stage', old_stage,
      'new_stage', new_stage,
      'project_title', project_title
    )
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to assign project to user
CREATE OR REPLACE FUNCTION assign_project(
  project_uuid UUID,
  assignee_uuid UUID,
  assigner_uuid UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  project_title TEXT;
  old_owner_id UUID;
BEGIN
  -- Get current owner and title
  SELECT owner_id, title INTO old_owner_id, project_title
  FROM projects 
  WHERE id = project_uuid;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Project not found';
  END IF;
  
  -- Update the project owner
  UPDATE projects 
  SET owner_id = assignee_uuid, updated_at = NOW()
  WHERE id = project_uuid;
  
  -- If moving from unassigned to assigned, update stage
  IF (SELECT stage FROM projects WHERE id = project_uuid) = 'unassigned' THEN
    UPDATE projects 
    SET stage = 'assigned'
    WHERE id = project_uuid;
  END IF;
  
  -- Log the activity
  INSERT INTO activity_log (project_id, user_id, action, details)
  VALUES (
    project_uuid,
    assigner_uuid,
    'assigned',
    jsonb_build_object(
      'assignee_id', assignee_uuid,
      'old_owner_id', old_owner_id,
      'project_title', project_title
    )
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get project statistics
CREATE OR REPLACE FUNCTION get_project_stats()
RETURNS TABLE (
  stage project_stage,
  count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT p.stage, COUNT(*)
  FROM projects p
  GROUP BY p.stage
  ORDER BY p.stage;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user workload
CREATE OR REPLACE FUNCTION get_user_workload(user_uuid UUID)
RETURNS TABLE (
  stage project_stage,
  count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT p.stage, COUNT(*)
  FROM projects p
  WHERE p.owner_id = user_uuid
  GROUP BY p.stage
  ORDER BY p.stage;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create project with activity log
CREATE OR REPLACE FUNCTION create_project_with_log(
  project_title TEXT,
  project_description TEXT DEFAULT NULL,
  project_priority project_priority DEFAULT 'medium',
  project_due_date TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  creator_uuid UUID
)
RETURNS UUID AS $$
DECLARE
  new_project_id UUID;
BEGIN
  -- Insert the project
  INSERT INTO projects (title, description, priority, due_date, owner_id)
  VALUES (project_title, project_description, project_priority, project_due_date, creator_uuid)
  RETURNING id INTO new_project_id;
  
  -- Log the activity
  INSERT INTO activity_log (project_id, user_id, action, details)
  VALUES (
    new_project_id,
    creator_uuid,
    'created',
    jsonb_build_object(
      'title', project_title,
      'priority', project_priority
    )
  );
  
  RETURN new_project_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update project progress
CREATE OR REPLACE FUNCTION update_project_progress(
  project_uuid UUID,
  new_progress INTEGER,
  status_text TEXT DEFAULT NULL,
  user_uuid UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  old_progress INTEGER;
  project_title TEXT;
BEGIN
  -- Validate progress percentage
  IF new_progress < 0 OR new_progress > 100 THEN
    RAISE EXCEPTION 'Progress must be between 0 and 100';
  END IF;
  
  -- Get current progress and title
  SELECT progress_percentage, title INTO old_progress, project_title
  FROM projects 
  WHERE id = project_uuid;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Project not found';
  END IF;
  
  -- Update the project
  UPDATE projects 
  SET 
    progress_percentage = new_progress,
    status_notes = COALESCE(status_text, status_notes),
    updated_at = NOW()
  WHERE id = project_uuid;
  
  -- Log the activity if progress changed significantly (>5% change)
  IF ABS(new_progress - old_progress) >= 5 THEN
    INSERT INTO activity_log (project_id, user_id, action, details)
    VALUES (
      project_uuid,
      user_uuid,
      'progress_updated',
      jsonb_build_object(
        'old_progress', old_progress,
        'new_progress', new_progress,
        'project_title', project_title
      )
    );
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
