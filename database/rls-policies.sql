-- Row Level Security (RLS) Policies for RFP Management Tool
-- These policies ensure users can only access data they're authorized to see

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE subtasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user ID from JWT
CREATE OR REPLACE FUNCTION get_current_user_id()
RETURNS UUID AS $$
BEGIN
  RETURN (auth.jwt() ->> 'user_id')::UUID;
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users 
    WHERE id = get_current_user_id() 
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Users table policies
CREATE POLICY "Users can view all users" ON users
  FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (id = get_current_user_id());

CREATE POLICY "Admins can manage all users" ON users
  FOR ALL USING (is_admin());

-- Projects table policies
CREATE POLICY "Users can view all projects" ON projects
  FOR SELECT USING (true);

CREATE POLICY "Users can create projects" ON projects
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Project owners and admins can update projects" ON projects
  FOR UPDATE USING (
    owner_id = get_current_user_id() OR is_admin()
  );

CREATE POLICY "Admins can delete projects" ON projects
  FOR DELETE USING (is_admin());

-- Tags table policies
CREATE POLICY "Users can view all tags" ON tags
  FOR SELECT USING (true);

CREATE POLICY "Users can create tags" ON tags
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Tag creators and admins can update tags" ON tags
  FOR UPDATE USING (
    created_by = get_current_user_id() OR is_admin()
  );

CREATE POLICY "Tag creators and admins can delete tags" ON tags
  FOR DELETE USING (
    created_by = get_current_user_id() OR is_admin()
  );

-- Project-Tags junction table policies
CREATE POLICY "Users can view all project-tag associations" ON project_tags
  FOR SELECT USING (true);

CREATE POLICY "Users can manage project-tag associations" ON project_tags
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE id = project_id 
      AND (owner_id = get_current_user_id() OR is_admin())
    )
  );

-- Comments table policies
CREATE POLICY "Users can view all comments" ON comments
  FOR SELECT USING (true);

CREATE POLICY "Users can create comments" ON comments
  FOR INSERT WITH CHECK (user_id = get_current_user_id());

CREATE POLICY "Comment authors and admins can update comments" ON comments
  FOR UPDATE USING (
    user_id = get_current_user_id() OR is_admin()
  );

CREATE POLICY "Comment authors and admins can delete comments" ON comments
  FOR DELETE USING (
    user_id = get_current_user_id() OR is_admin()
  );

-- Subtasks table policies
CREATE POLICY "Users can view all subtasks" ON subtasks
  FOR SELECT USING (true);

CREATE POLICY "Users can create subtasks" ON subtasks
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Subtask assignees, creators, project owners, and admins can update subtasks" ON subtasks
  FOR UPDATE USING (
    assigned_to = get_current_user_id() OR 
    created_by = get_current_user_id() OR
    EXISTS (
      SELECT 1 FROM projects 
      WHERE id = project_id 
      AND owner_id = get_current_user_id()
    ) OR
    is_admin()
  );

CREATE POLICY "Subtask creators, project owners, and admins can delete subtasks" ON subtasks
  FOR DELETE USING (
    created_by = get_current_user_id() OR
    EXISTS (
      SELECT 1 FROM projects 
      WHERE id = project_id 
      AND owner_id = get_current_user_id()
    ) OR
    is_admin()
  );

-- Activity log policies (read-only for users, admins can manage)
CREATE POLICY "Users can view activity logs" ON activity_log
  FOR SELECT USING (true);

CREATE POLICY "System can insert activity logs" ON activity_log
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can manage activity logs" ON activity_log
  FOR ALL USING (is_admin());

-- Grant necessary permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
