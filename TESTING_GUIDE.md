# RFP Management System - Testing Guide

This guide provides comprehensive testing procedures to verify all functionality works correctly with real database integration.

## 🧪 Pre-Testing Setup

### Prerequisites
- Complete the [SETUP_GUIDE.md](./SETUP_GUIDE.md) first
- Supabase database configured and running
- Clerk authentication set up
- Application running locally or deployed

### Test Data Preparation

1. **Create Test Users**
   - Admin user: `admin@test.com`
   - Manager user: `manager@test.com`
   - Member user: `member@test.com`

2. **Run Seed Data** (Optional)
   ```sql
   -- In Supabase SQL Editor
   SELECT create_sample_projects();
   SELECT create_sample_content();
   ```

## 🔐 Authentication Testing

### Test 1: User Registration
1. Go to `/sign-up`
2. Register with a new email
3. **Verify**: User appears in Supabase `users` table
4. **Verify**: Default role is `member`
5. **Verify**: User preferences created automatically

### Test 2: User Login
1. Go to `/sign-in`
2. Login with registered credentials
3. **Verify**: Redirected to `/dashboard`
4. **Verify**: User session active in Clerk
5. **Verify**: Can access protected routes

### Test 3: Invitation System
1. Login as admin
2. Go to `/dashboard/members`
3. Click "Invite Members"
4. Send invitation to new email
5. **Verify**: Invitation created in database
6. Register with invited email
7. **Verify**: User gets correct role from invitation
8. **Verify**: Invitation marked as accepted

### Test 4: Role-Based Access
1. **As Member**: Try to access `/dashboard/members`
   - **Expected**: Access denied or limited view
2. **As Manager**: Access project management features
   - **Expected**: Can create/edit projects
3. **As Admin**: Access all features
   - **Expected**: Full system access

## 📊 Dashboard Testing

### Test 5: Dashboard Statistics
1. Login and go to `/dashboard`
2. **Verify**: Statistics cards show real data
3. **Verify**: Charts and graphs display correctly
4. **Verify**: Recent activity shows actual events
5. **Verify**: Upcoming deadlines are accurate

### Test 6: Navigation
1. Test all sidebar navigation links
2. **Verify**: All pages load without errors
3. **Verify**: Active states work correctly
4. **Verify**: Responsive design on mobile

## 📁 Project Management Testing

### Test 7: Project Creation
1. Go to `/dashboard/projects/new`
2. Fill out project form with all fields
3. Add tags and custom attributes
4. Submit form
5. **Verify**: Project created in database
6. **Verify**: Tags associated correctly
7. **Verify**: Custom attributes saved
8. **Verify**: Activity logged

### Test 8: Project Views
1. Go to `/dashboard/projects`
2. Test List View:
   - **Verify**: Projects display correctly
   - **Verify**: Filtering works
   - **Verify**: Sorting functions
3. Test Calendar View:
   - **Verify**: Projects show on correct dates
   - **Verify**: Color coding works
4. Test Gantt View:
   - **Verify**: Timeline displays correctly
   - **Verify**: Dependencies shown

### Test 9: Project Details
1. Click on a project
2. **Verify**: All project information displays
3. **Verify**: Comments section works
4. **Verify**: Subtasks can be added/edited
5. **Verify**: Status changes work
6. **Verify**: File attachments (if implemented)

### Test 10: Project Editing
1. Edit an existing project
2. Change various fields
3. **Verify**: Changes saved to database
4. **Verify**: Activity logged
5. **Verify**: Notifications sent (if applicable)

## 🏷️ Custom Attributes Testing

### Test 11: Attribute Creation
1. Go to `/dashboard/custom-attributes`
2. Create attributes of different types:
   - Text field
   - Dropdown with options
   - Date field
   - Checkbox
   - Rating field
3. **Verify**: All types save correctly
4. **Verify**: Validation rules work

### Test 12: Attribute Usage
1. Create/edit a project
2. **Verify**: Custom attributes appear in form
3. **Verify**: Required fields enforced
4. **Verify**: Data saves correctly
5. **Verify**: Values display in project details

### Test 13: Attribute Management
1. Edit existing attributes
2. Deactivate attributes
3. **Verify**: Changes don't break existing data
4. **Verify**: Inactive attributes hidden from forms
5. **Verify**: Usage statistics accurate

## 👥 User Management Testing

### Test 14: Member Management
1. Go to `/dashboard/members`
2. **Verify**: All users display correctly
3. **Verify**: Role badges show correctly
4. **Verify**: Search and filtering work
5. **Verify**: User actions (edit, deactivate) work

### Test 15: Role Changes
1. Change a user's role
2. **Verify**: Database updated
3. **Verify**: User permissions change immediately
4. **Verify**: Activity logged

### Test 16: Permission Matrix
1. View role permissions matrix
2. **Verify**: Permissions display correctly
3. **Verify**: Matrix matches actual access control

## ⚠️ Open Items Testing

### Test 17: Open Items Dashboard
1. Go to `/dashboard/open-items`
2. **Verify**: Overdue projects show correctly
3. **Verify**: Unassigned RFPs listed
4. **Verify**: Statistics accurate
5. **Verify**: Quick actions work

## 🔧 Advanced Features Testing

### Test 18: Search and Filtering
1. Test global search functionality
2. Test project filtering by:
   - Stage
   - Priority
   - Owner
   - Tags
   - Date ranges
3. **Verify**: Results accurate
4. **Verify**: Performance acceptable

### Test 19: Bulk Operations
1. Select multiple projects
2. Test bulk actions:
   - Status changes
   - Tag assignments
   - Owner changes
3. **Verify**: All selected items updated
4. **Verify**: Activity logged for each

### Test 20: Data Export/Import
1. Export project data
2. **Verify**: Export contains all expected data
3. **Verify**: Format is correct (CSV, Excel, etc.)
4. Test import functionality (if implemented)

## 🚨 Error Handling Testing

### Test 21: Database Errors
1. Temporarily break database connection
2. **Verify**: Graceful error messages
3. **Verify**: Fallback to mock data (if implemented)
4. **Verify**: No application crashes

### Test 22: Authentication Errors
1. Test with invalid tokens
2. Test with expired sessions
3. **Verify**: Proper redirects to login
4. **Verify**: Error messages clear

### Test 23: Validation Errors
1. Submit forms with invalid data
2. **Verify**: Client-side validation works
3. **Verify**: Server-side validation works
4. **Verify**: Error messages helpful

## 📱 Responsive Design Testing

### Test 24: Mobile Compatibility
1. Test on various screen sizes
2. **Verify**: Navigation works on mobile
3. **Verify**: Forms usable on touch devices
4. **Verify**: Tables scroll/adapt properly

### Test 25: Browser Compatibility
1. Test on different browsers:
   - Chrome
   - Firefox
   - Safari
   - Edge
2. **Verify**: Consistent functionality
3. **Verify**: No console errors

## 🔒 Security Testing

### Test 26: Access Control
1. Try accessing admin routes as member
2. Try modifying other users' data
3. **Verify**: Proper access denied responses
4. **Verify**: No sensitive data exposed

### Test 27: SQL Injection Protection
1. Try SQL injection in search fields
2. Try in form inputs
3. **Verify**: No database errors
4. **Verify**: Queries properly sanitized

## 📈 Performance Testing

### Test 28: Load Testing
1. Create many projects (100+)
2. **Verify**: Pages load in reasonable time
3. **Verify**: Pagination works correctly
4. **Verify**: Search remains fast

### Test 29: Concurrent Users
1. Have multiple users logged in
2. **Verify**: No conflicts in data
3. **Verify**: Real-time updates work
4. **Verify**: Performance remains good

## ✅ Test Results Checklist

### Authentication & Authorization
- [ ] User registration works
- [ ] User login works
- [ ] Invitations work correctly
- [ ] Role-based access enforced
- [ ] Webhooks sync users properly

### Core Functionality
- [ ] Dashboard displays real data
- [ ] Projects can be created/edited
- [ ] All project views work
- [ ] Custom attributes functional
- [ ] Comments and subtasks work

### User Management
- [ ] Member management works
- [ ] Role changes effective
- [ ] Permission matrix accurate

### Advanced Features
- [ ] Search and filtering work
- [ ] Bulk operations successful
- [ ] Export functionality works

### Quality Assurance
- [ ] Error handling graceful
- [ ] Responsive design works
- [ ] Security measures effective
- [ ] Performance acceptable

## 🐛 Common Issues & Solutions

### Issue: "User not found" errors
**Solution**: Check webhook configuration and JWT template

### Issue: Permission denied errors
**Solution**: Verify RLS policies and user roles

### Issue: Slow page loads
**Solution**: Check database indexes and query optimization

### Issue: Mobile layout broken
**Solution**: Review responsive CSS and test on actual devices

## 📝 Test Report Template

```
# Test Report - [Date]

## Environment
- Database: Supabase [Project ID]
- Authentication: Clerk [App ID]
- Deployment: [Local/Production URL]

## Test Results
- Total Tests: [X]
- Passed: [X]
- Failed: [X]
- Skipped: [X]

## Failed Tests
1. [Test Name] - [Issue Description] - [Status: Fixed/Pending]

## Performance Metrics
- Average page load: [X]ms
- Database query time: [X]ms
- User registration time: [X]s

## Recommendations
- [List any improvements needed]
```

## 🎯 Success Criteria

The system passes testing when:
- All authentication flows work correctly
- All CRUD operations function properly
- Role-based access is enforced
- Performance is acceptable (< 2s page loads)
- No critical security vulnerabilities
- Mobile experience is usable
- Error handling is graceful

Once all tests pass, your RFP Management System is ready for production deployment!
