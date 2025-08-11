-- RFP Management System — Database Functions (TPA/Clerk-ready)
-- Assumes: users.id is TEXT (Clerk JWT 'sub'); entities use UUIDs.

--------------------------------------------------------------------------------
-- 1) Generic updated_at trigger
--------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$;

-- Attach to every table that has "updated_at"
DROP TRIGGER IF EXISTS trg_users_updated_at                       ON public.users;
CREATE TRIGGER trg_users_updated_at
BEFORE UPDATE ON public.users
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_custom_attributes_updated_at           ON public.custom_attributes;
CREATE TRIGGER trg_custom_attributes_updated_at
BEFORE UPDATE ON public.custom_attributes
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_tags_updated_at                        ON public.tags;
CREATE TRIGGER trg_tags_updated_at
BEFORE UPDATE ON public.tags
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_projects_updated_at                    ON public.projects;
CREATE TRIGGER trg_projects_updated_at
BEFORE UPDATE ON public.projects
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_project_attribute_values_updated_at    ON public.project_attribute_values;
CREATE TRIGGER trg_project_attribute_values_updated_at
BEFORE UPDATE ON public.project_attribute_values
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_comments_updated_at                    ON public.comments;
CREATE TRIGGER trg_comments_updated_at
BEFORE UPDATE ON public.comments
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_subtasks_updated_at                    ON public.subtasks;
CREATE TRIGGER trg_subtasks_updated_at
BEFORE UPDATE ON public.subtasks
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_user_preferences_updated_at            ON public.user_preferences;
CREATE TRIGGER trg_user_preferences_updated_at
BEFORE UPDATE ON public.user_preferences
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

--------------------------------------------------------------------------------
-- 2) Activity logging
--------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.log_activity(
  p_user_id    TEXT,         -- Clerk user id (can be NULL for system events)
  p_action     TEXT,
  p_entity_type TEXT,
  p_entity_id  UUID,
  p_old_values JSONB DEFAULT NULL,
  p_new_values JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $fn$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO public.activity_log (user_id, action, entity_type, entity_id, old_values, new_values)
  VALUES (p_user_id, p_action, p_entity_type, p_entity_id, p_old_values, p_new_values)
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$fn$;

ALTER FUNCTION public.log_activity(TEXT, TEXT, TEXT, UUID, JSONB, JSONB) SET search_path = public;

--------------------------------------------------------------------------------
-- 3) Notifications helper
--------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.create_notification(
  p_user_id    TEXT,
  p_title      TEXT,
  p_message    TEXT,
  p_type       TEXT,
  p_entity_type TEXT DEFAULT NULL,
  p_entity_id  UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $fn$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO public.notifications (user_id, title, message, type, entity_type, entity_id)
  VALUES (p_user_id, p_title, p_message, p_type, p_entity_type, p_entity_id)
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$fn$;

ALTER FUNCTION public.create_notification(TEXT, TEXT, TEXT, TEXT, TEXT, UUID) SET search_path = public;

--------------------------------------------------------------------------------
-- 4) Project ops (stage / assign / progress)
--------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.update_project_stage(
  p_project_id UUID,
  p_new_stage  project_stage,
  p_actor_id   TEXT          -- Clerk id performing the change
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $fn$
DECLARE
  v_old_stage project_stage;
  v_title     TEXT;
  v_owner     TEXT;
BEGIN
  SELECT stage, title, owner_id INTO v_old_stage, v_title, v_owner
  FROM public.projects WHERE id = p_project_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Project not found';
  END IF;

  UPDATE public.projects
  SET stage = p_new_stage
  WHERE id = p_project_id;

  PERFORM public.log_activity(
    p_actor_id,
    'stage_updated',
    'project',
    p_project_id,
    jsonb_build_object('stage', v_old_stage),
    jsonb_build_object('stage', p_new_stage)
  );

  IF v_owner IS NOT NULL AND v_owner <> p_actor_id THEN
    PERFORM public.create_notification(
      v_owner,
      'Project Stage Updated',
      format('Project "%s" moved to %s', coalesce(v_title,'Project'), p_new_stage),
      'project_stage_updated',
      'project',
      p_project_id
    );
  END IF;

  RETURN TRUE;
END;
$fn$;

ALTER FUNCTION public.update_project_stage(UUID, project_stage, TEXT) SET search_path = public;

CREATE OR REPLACE FUNCTION public.assign_project(
  p_project_id UUID,
  p_assignee   TEXT,
  p_assigner   TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $fn$
DECLARE
  v_old_owner TEXT;
  v_title     TEXT;
BEGIN
  SELECT owner_id, title INTO v_old_owner, v_title
  FROM public.projects WHERE id = p_project_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Project not found';
  END IF;

  UPDATE public.projects
  SET owner_id = p_assignee
  WHERE id = p_project_id;

  PERFORM public.log_activity(
    p_assigner,
    'project_assigned',
    'project',
    p_project_id,
    jsonb_build_object('owner_id', v_old_owner),
    jsonb_build_object('owner_id', p_assignee)
  );

  PERFORM public.create_notification(
    p_assignee,
    'Project Assigned',
    coalesce(v_title,'Project') || ' has been assigned to you',
    'project_assigned',
    'project',
    p_project_id
  );

  RETURN TRUE;
END;
$fn$;

ALTER FUNCTION public.assign_project(UUID, TEXT, TEXT) SET search_path = public;

CREATE OR REPLACE FUNCTION public.update_project_progress(
  p_project_id UUID,
  p_new_progress INTEGER,
  p_status_text  TEXT,
  p_actor_id     TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $fn$
DECLARE
  v_old_progress INTEGER;
BEGIN
  SELECT progress_percentage INTO v_old_progress
  FROM public.projects WHERE id = p_project_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Project not found';
  END IF;

  UPDATE public.projects
  SET progress_percentage = p_new_progress,
      status_notes = p_status_text
  WHERE id = p_project_id;

  PERFORM public.log_activity(
    p_actor_id,
    'progress_updated',
    'project',
    p_project_id,
    jsonb_build_object('progress_percentage', v_old_progress),
    jsonb_build_object('progress_percentage', p_new_progress, 'status_notes', p_status_text)
  );

  RETURN TRUE;
END;
$fn$;

ALTER FUNCTION public.update_project_progress(UUID, INTEGER, TEXT, TEXT) SET search_path = public;

--------------------------------------------------------------------------------
-- 5) Clerk webhook sync (upsert user + default prefs)
--------------------------------------------------------------------------------
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
  INSERT INTO public.users (id, email, first_name, last_name, avatar_url)
  VALUES (p_id, p_email, p_first_name, p_last_name, p_avatar_url)
  ON CONFLICT (id) DO UPDATE SET
    email      = EXCLUDED.email,
    first_name = EXCLUDED.first_name,
    last_name  = EXCLUDED.last_name,
    avatar_url = EXCLUDED.avatar_url,
    updated_at = NOW()
  RETURNING id INTO v_id;

  INSERT INTO public.user_preferences (user_id)
  VALUES (v_id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN v_id;
END;
$fn$;

ALTER FUNCTION public.sync_user_from_clerk(TEXT, TEXT, TEXT, TEXT, TEXT) SET search_path = public;

--------------------------------------------------------------------------------
-- 6) Invitations (issue & accept)
--------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.create_invitation(
  p_email      TEXT,
  p_role       user_role,
  p_invited_by TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $fn$
DECLARE
  v_id    UUID;
  v_token TEXT;
BEGIN
  v_token := encode(gen_random_bytes(32), 'hex');

  INSERT INTO public.invitations (email, role, invited_by, token, expires_at)
  VALUES (p_email, p_role, p_invited_by, v_token, NOW() + INTERVAL '7 days')
  RETURNING id INTO v_id;

  PERFORM public.log_activity(
    p_invited_by,
    'invitation_created',
    'invitation',
    v_id,
    NULL,
    jsonb_build_object('email', p_email, 'role', p_role)
  );

  RETURN v_id;
END;
$fn$;

ALTER FUNCTION public.create_invitation(TEXT, user_role, TEXT) SET search_path = public;

CREATE OR REPLACE FUNCTION public.accept_invitation(
  p_token   TEXT,
  p_user_id TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $fn$
DECLARE
  inv RECORD;
BEGIN
  SELECT *
  INTO inv
  FROM public.invitations
  WHERE token = p_token
    AND expires_at > NOW()
    AND accepted_at IS NULL;

  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  UPDATE public.users
  SET role = inv.role
  WHERE id = p_user_id;

  UPDATE public.invitations
  SET accepted_at = NOW(),
      accepted_by = p_user_id
  WHERE id = inv.id;

  PERFORM public.log_activity(
    p_user_id,
    'invitation_accepted',
    'invitation',
    inv.id,
    NULL,
    jsonb_build_object('role', inv.role)
  );

  RETURN TRUE;
END;
$fn$;

ALTER FUNCTION public.accept_invitation(TEXT, TEXT) SET search_path = public;

--------------------------------------------------------------------------------
-- 7) Dashboard stats
--------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_user_dashboard_data(p_user_id TEXT)
RETURNS TABLE (
  my_projects        BIGINT,
  assigned_to_me     BIGINT,
  overdue_tasks      BIGINT,
  completed_this_week BIGINT,
  recent_activity    JSONB
)
LANGUAGE plpgsql
STABLE
AS $fn$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM public.projects  WHERE owner_id = p_user_id AND NOT is_archived) AS my_projects,
    (SELECT COUNT(*) FROM public.subtasks  WHERE assigned_to = p_user_id AND NOT completed) AS assigned_to_me,
    (SELECT COUNT(*) FROM public.subtasks  WHERE assigned_to = p_user_id AND due_date < NOW() AND NOT completed) AS overdue_tasks,
    (SELECT COUNT(*) FROM public.subtasks  WHERE assigned_to = p_user_id AND completed AND completed_at >= date_trunc('week', NOW())) AS completed_this_week,
    (
      SELECT coalesce(jsonb_agg(
        jsonb_build_object(
          'id', al.id,
          'action', al.action,
          'entity_type', al.entity_type,
          'entity_id', al.entity_id,
          'created_at', al.created_at
        ) ORDER BY al.created_at DESC), '[]'::jsonb)
      FROM public.activity_log al
      WHERE al.user_id = p_user_id
      LIMIT 10
    ) AS recent_activity;
END;
$fn$;

--------------------------------------------------------------------------------
-- 8) Execute grants for app role
--------------------------------------------------------------------------------
GRANT EXECUTE ON FUNCTION
  public.update_updated_at_column(),
  public.log_activity(TEXT, TEXT, TEXT, UUID, JSONB, JSONB),
  public.create_notification(TEXT, TEXT, TEXT, TEXT, TEXT, UUID),
  public.update_project_stage(UUID, project_stage, TEXT),
  public.assign_project(UUID, TEXT, TEXT),
  public.update_project_progress(UUID, INTEGER, TEXT, TEXT),
  public.sync_user_from_clerk(TEXT, TEXT, TEXT, TEXT, TEXT),
  public.create_invitation(TEXT, user_role, TEXT),
  public.accept_invitation(TEXT, TEXT),
  public.get_user_dashboard_data(TEXT)
TO authenticated;
