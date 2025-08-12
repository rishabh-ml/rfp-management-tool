-- Sample Data for RFP Management System
-- This creates some initial data for testing and demonstration

-- === Sample Users ===
-- Note: In production, users are created via Clerk webhooks
-- These are sample entries for testing

INSERT INTO public.users (id, email, first_name, last_name, role, is_active) VALUES 
  ('user_admin_001', 'admin@dataman.com', 'Admin', 'User', 'admin', true),
  ('user_manager_001', 'manager@dataman.com', 'Project', 'Manager', 'manager', true),
  ('user_member_001', 'member1@dataman.com', 'John', 'Doe', 'member', true),
  ('user_member_002', 'member2@dataman.com', 'Jane', 'Smith', 'member', true),
  ('user_member_003', 'member3@dataman.com', 'Mike', 'Johnson', 'member', true)
ON CONFLICT (id) DO NOTHING;

-- === Sample Tags ===
INSERT INTO public.tags (name, color, description, created_by) VALUES 
  ('Healthcare', '#10B981', 'Healthcare related projects', 'user_admin_001'),
  ('Government', '#3B82F6', 'Government contracts', 'user_admin_001'),
  ('Data Analytics', '#8B5CF6', 'Data analytics and BI projects', 'user_admin_001'),
  ('Software Development', '#F59E0B', 'Software development projects', 'user_admin_001'),
  ('Consulting', '#EF4444', 'Consulting services', 'user_admin_001'),
  ('Research', '#06B6D4', 'Research and development', 'user_admin_001')
ON CONFLICT (name) DO NOTHING;

-- === Sample Custom Attributes ===
INSERT INTO public.custom_attributes (name, label, type, description, is_required, created_by) VALUES 
  ('contract_type', 'Contract Type', 'dropdown', 'Type of contract', true, 'user_admin_001'),
  ('technical_lead', 'Technical Lead', 'text', 'Technical lead for the project', false, 'user_admin_001'),
  ('compliance_required', 'Compliance Required', 'checkbox', 'Is compliance certification required?', false, 'user_admin_001'),
  ('expected_team_size', 'Expected Team Size', 'number', 'Expected number of team members', false, 'user_admin_001')
ON CONFLICT (name) DO NOTHING;

-- === Sample Projects ===
INSERT INTO public.projects (
  title, description, stage, priority, due_date, owner_id, client_name, client_email,
  rfp_added_date, rfp_title, state, portal_url, folder_url,
  estimated_hours, budget_amount, progress_percentage
) VALUES 
  (
    'Electronic Health Records Modernization',
    'Comprehensive EHR system upgrade for regional healthcare network. Includes data migration, user training, and system integration with existing infrastructure.',
    'unassigned',
    'high',
    '2025-09-15'::timestamptz,
    'user_manager_001',
    'Regional Health Network',
    'procurement@regionalhealth.com',
    '2025-08-01'::timestamptz,
    'RFP-2025-EHR-001: Electronic Health Records System Modernization',
    'California',
    'https://procurement.regionalhealth.com/rfp/ehr-2025',
    'https://sharepoint.dataman.com/projects/ehr-modernization',
    2000,
    850000.00,
    0
  ),
  (
    'State Tax System Upgrade',
    'Legacy tax processing system modernization for state government. Requirements include real-time processing, audit trails, and citizen portal integration.',
    'assigned',
    'urgent',
    '2025-08-30'::timestamptz,
    'user_manager_001',
    'State Department of Revenue',
    'it.procurement@state.gov',
    '2025-07-15'::timestamptz,
    'RFP-2025-TAX-047: Tax Processing System Modernization',
    'Texas',
    'https://procurement.state.gov/opportunities/tax-system',
    'https://sharepoint.dataman.com/projects/state-tax-upgrade',
    3500,
    1250000.00,
    25
  ),
  (
    'Healthcare Data Analytics Platform',
    'Development of advanced analytics platform for population health management. Includes predictive modeling, reporting dashboards, and API integrations.',
    'reviewed',
    'medium',
    '2025-10-01'::timestamptz,
    'user_manager_001',
    'Metro Health Authority',
    'analytics@metrohealth.org',
    '2025-07-20'::timestamptz,
    'RFP-2025-ANALYTICS-012: Population Health Analytics Platform',
    'New York',
    'https://metrohealth.org/procurement/analytics-platform',
    'https://sharepoint.dataman.com/projects/metro-analytics',
    1800,
    720000.00,
    60
  ),
  (
    'Financial Services Compliance System',
    'Regulatory compliance management system for financial institution. Features include automated reporting, document management, and audit preparation.',
    'submitted',
    'medium',
    '2025-11-15'::timestamptz,
    'user_member_001',
    'First National Bank',
    'compliance@firstnational.com',
    '2025-06-30'::timestamptz,
    'RFP-2025-COMP-089: Regulatory Compliance Management System',
    'Illinois',
    'https://firstnational.com/vendor-portal/compliance-rfp',
    'https://sharepoint.dataman.com/projects/fnb-compliance',
    2200,
    920000.00,
    95
  ),
  (
    'Smart City IoT Infrastructure',
    'Internet of Things infrastructure for smart city initiative. Includes sensor networks, data collection, and citizen-facing applications.',
    'won',
    'high',
    '2025-12-01'::timestamptz,
    'user_member_002',
    'City of Innovation',
    'smartcity@cityofinnovation.gov',
    '2025-05-10'::timestamptz,
    'RFP-2025-IOT-156: Smart City Infrastructure Development',
    'Colorado',
    'https://cityofinnovation.gov/procurement/smart-city',
    'https://sharepoint.dataman.com/projects/smart-city-iot',
    4000,
    1800000.00,
    100
  )
ON CONFLICT DO NOTHING;

-- Get project IDs for further data insertion
DO $$
DECLARE
  ehr_project_id UUID;
  tax_project_id UUID;
  analytics_project_id UUID;
  compliance_project_id UUID;
  iot_project_id UUID;
  healthcare_tag_id UUID;
  govt_tag_id UUID;
  analytics_tag_id UUID;
  software_tag_id UUID;
BEGIN
  -- Get project IDs
  SELECT id INTO ehr_project_id FROM public.projects WHERE title = 'Electronic Health Records Modernization';
  SELECT id INTO tax_project_id FROM public.projects WHERE title = 'State Tax System Upgrade';
  SELECT id INTO analytics_project_id FROM public.projects WHERE title = 'Healthcare Data Analytics Platform';
  SELECT id INTO compliance_project_id FROM public.projects WHERE title = 'Financial Services Compliance System';
  SELECT id INTO iot_project_id FROM public.projects WHERE title = 'Smart City IoT Infrastructure';
  
  -- Get tag IDs
  SELECT id INTO healthcare_tag_id FROM public.tags WHERE name = 'Healthcare';
  SELECT id INTO govt_tag_id FROM public.tags WHERE name = 'Government';
  SELECT id INTO analytics_tag_id FROM public.tags WHERE name = 'Data Analytics';
  SELECT id INTO software_tag_id FROM public.tags WHERE name = 'Software Development';

  -- Add project tags
  INSERT INTO public.project_tags (project_id, tag_id) VALUES 
    (ehr_project_id, healthcare_tag_id),
    (ehr_project_id, software_tag_id),
    (tax_project_id, govt_tag_id),
    (tax_project_id, software_tag_id),
    (analytics_project_id, healthcare_tag_id),
    (analytics_project_id, analytics_tag_id),
    (compliance_project_id, software_tag_id),
    (iot_project_id, govt_tag_id),
    (iot_project_id, software_tag_id)
  ON CONFLICT DO NOTHING;

  -- Update reviewed project with review information
  UPDATE public.projects 
  SET 
    priority_banding = 'P1',
    review_comment = 'High-value opportunity with strong technical fit. Recommend proceeding with full proposal team.',
    assigned_to = 'user_member_001',
    company_assignment = 'DatamanHealth'
  WHERE id = analytics_project_id;

  -- Update assigned project 
  UPDATE public.projects
  SET assigned_to = 'user_member_002'
  WHERE id = tax_project_id;

  -- Add some sample comments
  INSERT INTO public.comments (project_id, user_id, content) VALUES 
    (ehr_project_id, 'user_manager_001', 'Initial assessment shows this is a good fit for our healthcare expertise.'),
    (tax_project_id, 'user_member_002', 'Working on technical requirements analysis. Timeline is aggressive but achievable.'),
    (analytics_project_id, 'user_member_001', 'Proposal submitted successfully. Client feedback has been positive.'),
    (compliance_project_id, 'user_member_001', 'Final review scheduled for next week. All deliverables on track.');

  -- Add some sample subtasks
  INSERT INTO public.subtasks (project_id, title, description, assigned_to, completed, created_by, priority) VALUES 
    (tax_project_id, 'Requirements Analysis', 'Complete detailed analysis of technical requirements', 'user_member_002', true, 'user_manager_001', 'high'),
    (tax_project_id, 'Architecture Design', 'Design system architecture and data flow', 'user_member_002', false, 'user_manager_001', 'high'),
    (analytics_project_id, 'Proposal Review', 'Internal review of technical proposal', 'user_member_001', true, 'user_manager_001', 'medium'),
    (compliance_project_id, 'Final Testing', 'Complete final round of testing', 'user_member_001', false, 'user_manager_001', 'urgent');

  -- Add sample notifications
  INSERT INTO public.notifications (user_id, title, message, type, entity_type, entity_id) VALUES 
    ('user_member_002', 'Project Assigned', 'You have been assigned to State Tax System Upgrade', 'project_assigned', 'project', tax_project_id),
    ('user_member_001', 'Review Complete', 'Healthcare Data Analytics Platform has been reviewed and approved', 'project_reviewed', 'project', analytics_project_id),
    ('user_member_001', 'Deadline Approaching', 'Final Testing subtask is due soon', 'due_date_reminder', 'subtask', NULL);

END $$;

-- === Create user preferences for sample users ===
INSERT INTO public.user_preferences (user_id, email_notifications, project_assignments, due_date_reminders) VALUES 
  ('user_admin_001', true, true, true),
  ('user_manager_001', true, true, true),
  ('user_member_001', true, true, true),
  ('user_member_002', true, true, false),
  ('user_member_003', false, true, true)
ON CONFLICT (user_id) DO NOTHING;
