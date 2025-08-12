# Database Reset for Enhanced RFP Management

This directory contains scripts to completely reset your Supabase database with enhanced RFP management functionality.

## ⚠️ WARNING: DATA LOSS

**These scripts will DELETE ALL existing data in your database.** Only proceed if you want to completely reset your database or if you are setting up for the first time.

## Enhanced Features

The new schema includes comprehensive RFP management features:

### 🏢 **Basic RFP Information**
- **RFP Added Date** - Date when the first entry of the project is made
- **RFP Title** - This will be the Project Name  
- **Client Name** - Name of the Client who released the RFP
- **Due Date** - The Date when the RFP is due
- **State** - The state of the Project (Non-Mandatory)
- **Description** - Description of the Project with No Character Limits
- **Portal URL** - URL from where the RFP is Fetched
- **Folder URL** - SharePoint Folder URL

### 📋 **Post-Review Fields (Stage = 'reviewed')**
- **Priority Banding** - Dropdown: P1, P2, P3, No bid
- **Review Comment** - With 1000 Character Limits
- **Assigned to** - Select the Users
- **For** - Select the Company for which that Particular User will work for: 
  - DatamanHealth
  - DatamanUSA  
  - CCSI

## Files Overview

| File | Description |
|------|-------------|
| `MASTER_RESET.sql` | **Main script** - Run this to execute all scripts in order |
| `00_complete_reset_schema.sql` | Drops and recreates all tables with enhanced fields |
| `01_enhanced_rls_policies.sql` | Comprehensive Row Level Security policies |
| `02_enhanced_functions.sql` | Advanced database functions for filtering and management |
| `03_sample_data.sql` | Sample data for testing (optional) |

## How to Reset Your Database

### Option 1: Using Supabase Dashboard (Recommended)

1. **Open your Supabase project dashboard**
2. **Navigate to SQL Editor**
3. **Copy and paste the contents of `00_complete_reset_schema.sql`**
4. **Execute the script** (Click "Run")
5. **Copy and paste the contents of `01_enhanced_rls_policies.sql`**  
6. **Execute the script**
7. **Copy and paste the contents of `02_enhanced_functions.sql`**
8. **Execute the script**
9. **Optionally, run `03_sample_data.sql` for test data**

### Option 2: Using Supabase CLI (If Available)

```bash
# Make sure you're in the project directory
cd /path/to/rfp-management-tool

# Reset the database
supabase db reset

# Push the new schema
supabase db push
```

## What Gets Created

### Tables
- ✅ **Enhanced `projects` table** with all RFP fields
- ✅ **Users** with role-based access
- ✅ **Tags** for project categorization  
- ✅ **Comments** with threading support
- ✅ **Subtasks** with assignment and tracking
- ✅ **Notifications** system
- ✅ **Custom attributes** for extensibility
- ✅ **Activity logging** for audit trails

### Security Features
- 🔒 **Row Level Security (RLS)** on all tables
- 👥 **Role-based permissions** (admin, manager, member)
- 🎯 **Project ownership** and assignment controls
- 📊 **Conditional field access** based on project stage

### Performance Features  
- ⚡ **Optimized indexes** for fast queries
- 🔍 **Full-text search** capabilities
- 📈 **Dashboard functions** for analytics
- 🔄 **Automated triggers** for data consistency

### Enhanced Functions
- `get_projects_enhanced()` - Advanced filtering and sorting
- `get_project_statistics()` - Dashboard analytics
- `update_project_stage()` - Stage transition with validation
- `assign_project()` - User assignment with notifications
- `search_projects()` - Full-text search

## Post-Reset Steps

1. **Update your environment variables** if needed
2. **Test the application** at http://localhost:3001  
3. **Create your first user** through Clerk authentication
4. **Assign admin role** to your user in the database:
   ```sql
   UPDATE public.users 
   SET role = 'admin' 
   WHERE email = 'your-email@example.com';
   ```

## Troubleshooting

### Common Issues

**Error: "relation does not exist"**
- Make sure to run scripts in the correct order
- Check that all previous scripts completed successfully

**Error: "permission denied"** 
- Ensure your Supabase user has sufficient privileges
- Try running as database owner

**Error: "function does not exist"**
- Make sure `02_enhanced_functions.sql` ran successfully  
- Check the Supabase logs for function creation errors

### Verification Queries

Check if the reset was successful:

```sql
-- Check tables were created
SELECT tablename FROM pg_tables WHERE schemaname = 'public';

-- Check enhanced project fields
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'projects' 
ORDER BY ordinal_position;

-- Check sample data (if loaded)
SELECT COUNT(*) as project_count FROM public.projects;
SELECT COUNT(*) as user_count FROM public.users;
```

## Backup Recommendation

Before running the reset scripts, consider backing up any important data:

```sql
-- Export existing projects (example)
COPY (SELECT * FROM projects) TO '/path/to/backup/projects.csv' CSV HEADER;
```

## Support

If you encounter issues:
1. Check the Supabase logs in your dashboard
2. Verify your environment variables are correct
3. Ensure your Clerk integration is properly configured
4. Review the RLS policies if you have access issues
