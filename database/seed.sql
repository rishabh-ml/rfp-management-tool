-- Seed Data for RFP Management Tool
-- This script populates the database with sample data for testing

-- Insert sample users (these would normally be created via Clerk)
INSERT INTO users (id, clerk_id, email, first_name, last_name, role) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'clerk_admin_123', 'admin@company.com', 'Alice', 'Admin', 'admin'),
  ('550e8400-e29b-41d4-a716-446655440002', 'clerk_manager_456', 'manager@company.com', 'Bob', 'Manager', 'manager'),
  ('550e8400-e29b-41d4-a716-446655440003', 'clerk_member_789', 'john@company.com', 'John', 'Developer', 'member'),
  ('550e8400-e29b-41d4-a716-446655440004', 'clerk_member_101', 'sarah@company.com', 'Sarah', 'Designer', 'member');

-- Insert sample tags
INSERT INTO tags (id, name, color, created_by) VALUES
  ('650e8400-e29b-41d4-a716-446655440001', 'Web Development', '#3B82F6', '550e8400-e29b-41d4-a716-446655440001'),
  ('650e8400-e29b-41d4-a716-446655440002', 'Mobile App', '#10B981', '550e8400-e29b-41d4-a716-446655440001'),
  ('650e8400-e29b-41d4-a716-446655440003', 'E-commerce', '#F59E0B', '550e8400-e29b-41d4-a716-446655440002'),
  ('650e8400-e29b-41d4-a716-446655440004', 'Enterprise', '#8B5CF6', '550e8400-e29b-41d4-a716-446655440002'),
  ('650e8400-e29b-41d4-a716-446655440005', 'Urgent', '#EF4444', '550e8400-e29b-41d4-a716-446655440001'),
  ('650e8400-e29b-41d4-a716-446655440006', 'Government', '#6B7280', '550e8400-e29b-41d4-a716-446655440001');

-- Insert sample projects across all stages
INSERT INTO projects (id, title, description, stage, priority, due_date, owner_id, progress_percentage, status_notes) VALUES
  -- Unassigned projects
  ('750e8400-e29b-41d4-a716-446655440001', 
   'City Council Website Redesign', 
   'Complete redesign of the city council website with modern UI/UX and accessibility features.',
   'unassigned', 'high', '2024-03-15 17:00:00+00', NULL, 0, NULL),
  
  -- Assigned projects
  ('750e8400-e29b-41d4-a716-446655440002',
   'E-commerce Platform for Local Retailer',
   'Build a comprehensive e-commerce solution with inventory management, payment processing, and customer portal.',
   'assigned', 'medium', '2024-02-28 17:00:00+00', '550e8400-e29b-41d4-a716-446655440003', 35, 
   'Initial wireframes completed. Working on database schema and API design.'),
  
  ('750e8400-e29b-41d4-a716-446655440003',
   'Mobile Banking App MVP',
   'Develop a minimum viable product for a mobile banking application with core features.',
   'assigned', 'urgent', '2024-02-20 17:00:00+00', '550e8400-e29b-41d4-a716-446655440004', 60,
   'UI design finalized. Backend API 70% complete. Starting mobile app development.'),
  
  -- Submitted projects
  ('750e8400-e29b-41d4-a716-446655440004',
   'Healthcare Management System',
   'Comprehensive patient management system for a mid-size clinic with appointment scheduling and billing.',
   'submitted', 'high', '2024-01-30 17:00:00+00', '550e8400-e29b-41d4-a716-446655440002', 100, 
   'Proposal submitted on time. Awaiting client feedback.'),
  
  -- Skipped project
  ('750e8400-e29b-41d4-a716-446655440005',
   'Legacy System Migration',
   'Migration of legacy COBOL system to modern cloud infrastructure.',
   'skipped', 'low', '2024-04-01 17:00:00+00', NULL, 0,
   'Project scope too large for current team capacity. Recommended external consultant.'),
  
  -- Won project
  ('750e8400-e29b-41d4-a716-446655440006',
   'Restaurant Chain POS System',
   'Point-of-sale system for a growing restaurant chain with multi-location support.',
   'won', 'medium', '2024-01-15 17:00:00+00', '550e8400-e29b-41d4-a716-446655440003', 100,
   'Contract signed! Project kickoff scheduled for next week.'),
  
  -- Lost project
  ('750e8400-e29b-41d4-a716-446655440007',
   'University Student Portal',
   'Student information system with course registration, grades, and communication features.',
   'lost', 'medium', '2024-01-20 17:00:00+00', '550e8400-e29b-41d4-a716-446655440004', 100,
   'Client chose a different vendor due to budget constraints.');

-- Associate projects with tags
INSERT INTO project_tags (project_id, tag_id) VALUES
  ('750e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440001'), -- City Council - Web Development
  ('750e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440006'), -- City Council - Government
  ('750e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440001'), -- E-commerce - Web Development
  ('750e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440003'), -- E-commerce - E-commerce
  ('750e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440002'), -- Banking - Mobile App
  ('750e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440005'), -- Banking - Urgent
  ('750e8400-e29b-41d4-a716-446655440004', '650e8400-e29b-41d4-a716-446655440001'), -- Healthcare - Web Development
  ('750e8400-e29b-41d4-a716-446655440004', '650e8400-e29b-41d4-a716-446655440004'), -- Healthcare - Enterprise
  ('750e8400-e29b-41d4-a716-446655440005', '650e8400-e29b-41d4-a716-446655440004'), -- Legacy - Enterprise
  ('750e8400-e29b-41d4-a716-446655440006', '650e8400-e29b-41d4-a716-446655440001'), -- Restaurant - Web Development
  ('750e8400-e29b-41d4-a716-446655440007', '650e8400-e29b-41d4-a716-446655440001'), -- University - Web Development
  ('750e8400-e29b-41d4-a716-446655440007', '650e8400-e29b-41d4-a716-446655440004'); -- University - Enterprise

-- Insert sample comments
INSERT INTO comments (project_id, user_id, content) VALUES
  ('750e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440003', 
   'Started working on the database schema. Planning to use PostgreSQL with proper indexing for the product catalog.'),
  ('750e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002',
   'Great! Make sure to include full-text search capabilities for the product search feature.'),
  ('750e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440004',
   'UI mockups are ready for review. The client loved the modern, clean design approach.'),
  ('750e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001',
   'Excellent work on the design! Please ensure all security requirements are met for the banking features.'),
  ('750e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440002',
   'Proposal has been submitted. Included detailed timeline and cost breakdown as requested.');

-- Insert sample subtasks
INSERT INTO subtasks (project_id, title, description, assigned_to, completed, due_date, created_by) VALUES
  ('750e8400-e29b-41d4-a716-446655440002', 'Database Schema Design', 'Design and implement the product catalog database schema', '550e8400-e29b-41d4-a716-446655440003', true, '2024-02-10 17:00:00+00', '550e8400-e29b-41d4-a716-446655440002'),
  ('750e8400-e29b-41d4-a716-446655440002', 'Payment Gateway Integration', 'Integrate Stripe payment processing', '550e8400-e29b-41d4-a716-446655440003', false, '2024-02-25 17:00:00+00', '550e8400-e29b-41d4-a716-446655440002'),
  ('750e8400-e29b-41d4-a716-446655440002', 'Admin Dashboard', 'Build inventory management dashboard', '550e8400-e29b-41d4-a716-446655440003', false, '2024-02-28 17:00:00+00', '550e8400-e29b-41d4-a716-446655440002'),
  ('750e8400-e29b-41d4-a716-446655440003', 'Security Audit', 'Conduct comprehensive security review', '550e8400-e29b-41d4-a716-446655440001', false, '2024-02-18 17:00:00+00', '550e8400-e29b-41d4-a716-446655440004'),
  ('750e8400-e29b-41d4-a716-446655440003', 'iOS App Development', 'Develop native iOS application', '550e8400-e29b-41d4-a716-446655440004', false, '2024-02-20 17:00:00+00', '550e8400-e29b-41d4-a716-446655440004'),
  ('750e8400-e29b-41d4-a716-446655440003', 'Android App Development', 'Develop native Android application', '550e8400-e29b-41d4-a716-446655440004', false, '2024-02-20 17:00:00+00', '550e8400-e29b-41d4-a716-446655440004');

-- Insert sample activity log entries
INSERT INTO activity_log (project_id, user_id, action, details) VALUES
  ('750e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 'created', 
   '{"title": "E-commerce Platform for Local Retailer", "priority": "medium"}'),
  ('750e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 'assigned',
   '{"assignee_id": "550e8400-e29b-41d4-a716-446655440003", "project_title": "E-commerce Platform for Local Retailer"}'),
  ('750e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', 'created',
   '{"title": "Mobile Banking App MVP", "priority": "urgent"}'),
  ('750e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', 'assigned',
   '{"assignee_id": "550e8400-e29b-41d4-a716-446655440004", "project_title": "Mobile Banking App MVP"}'),
  ('750e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440002', 'stage_changed',
   '{"old_stage": "assigned", "new_stage": "submitted", "project_title": "Healthcare Management System"}');
