# Clerk Webhook Integration Guide

This guide provides comprehensive instructions for setting up Clerk webhooks to automatically synchronize user data between Clerk and Supabase.

## Overview

The webhook integration solves the critical issue where users authenticated via Clerk don't have corresponding records in the Supabase database, which causes RLS policy failures and application errors.

## Problem Statement

Without webhook integration, you'll encounter these issues:
- **User not found errors**: `The result contains 0 rows` when querying user data
- **RLS policy failures**: Database queries fail because user records don't exist
- **Infinite recursion errors**: Fixed in RLS policies, but user sync is still needed
- **Project/data access issues**: Users can't access their data due to missing user records

## Solution Architecture

```
Clerk User Events → Webhook → API Route → Supabase Database
     ↓                ↓           ↓            ↓
user.created    →  Verify   →  Extract   →  Create User
user.updated    →  Payload  →  User Data →  Update User  
user.deleted    →  Process  →  Handle    →  Soft Delete
```

## Files Created/Modified

### 1. Enhanced Webhook Handler
**File:** `src/app/api/webhooks/clerk/route.ts`
- Comprehensive event handling for user.created, user.updated, user.deleted
- Proper error handling and logging
- Uses Supabase service role for admin operations
- Soft delete for user.deleted events (preserves data integrity)

### 2. User Sync Service
**File:** `src/lib/services/user-sync-service.ts`
- Utility functions for manual user synchronization
- Bulk sync capabilities for migrations
- User existence checking
- Reactivation/deactivation functions

### 3. Manual Sync API
**File:** `src/app/api/sync-user/route.ts`
- GET: Check if current user exists in database
- POST: Manually sync current user to database
- Useful for existing users or troubleshooting

### 4. Test Interface
**File:** `src/app/test-webhook/page.tsx`
- Visual interface to test webhook integration
- Check sync status of current user
- Manual sync trigger
- Setup instructions

### 5. Database Fixes
**File:** `database/02_rls_policies.sql`
- Fixed infinite recursion in subtasks RLS policies
- Removed circular reference that was causing database errors

## Setup Instructions

### Step 1: Configure Clerk Webhook

1. **Go to Clerk Dashboard**
   - Navigate to your Clerk project
   - Go to **Webhooks** section
   - Click **"Add endpoint"**

2. **Configure Webhook Settings**
   - **Endpoint URL**: `https://your-domain.com/api/webhooks/clerk`
   - **Events to subscribe to**:
     - `user.created`
     - `user.updated` 
     - `user.deleted`
   - **Description**: "Sync users to Supabase database"

3. **Copy Webhook Secret**
   - After creating the webhook, copy the signing secret
   - It starts with `whsec_`

### Step 2: Update Environment Variables

Add the webhook secret to your `.env.local`:

```env
# Existing variables...
CLERK_WEBHOOK_SECRET=whsec_your_actual_webhook_secret_here
```

### Step 3: Deploy and Test

1. **Deploy your application** with the new webhook handler

2. **Test the integration**:
   - Visit `/test-webhook` in your application
   - Check if your current user is synced
   - Use manual sync if needed

3. **Create a test user**:
   - Sign up a new user in your application
   - Check Clerk Dashboard → Webhooks → your endpoint → Recent deliveries
   - Verify the webhook was delivered successfully (200 status)
   - Check your Supabase database to confirm the user was created

## Webhook Event Handling

### user.created
```typescript
// Extracts user data from Clerk event
const userData = {
  id: clerkUser.id,                    // Maps to users.id (primary key)
  email: clerkUser.email_addresses[0], // Primary email
  first_name: clerkUser.first_name,    // First name
  last_name: clerkUser.last_name,      // Last name
  avatar_url: clerkUser.image_url      // Profile image
}

// Uses sync_user_from_clerk() database function
// Also creates default user preferences
```

### user.updated
```typescript
// Updates existing user record
// Handles email changes, name changes, avatar updates
// Preserves user role and other custom fields
```

### user.deleted
```typescript
// Soft delete: sets is_active = false
// Preserves data integrity for projects, comments, etc.
// User data remains for audit purposes
```

## Testing and Validation

### Manual Testing
1. Visit `/test-webhook` to check sync status
2. Use the manual sync button if needed
3. Create/update/delete test users to verify webhooks

### Webhook Delivery Testing
1. Check Clerk Dashboard → Webhooks → Recent deliveries
2. Look for 200 status codes (success)
3. Check response bodies for error details

### Database Verification
```sql
-- Check if user exists
SELECT * FROM users WHERE id = 'clerk_user_id_here';

-- Check recent webhook activity
SELECT * FROM activity_log WHERE action LIKE '%user%' ORDER BY created_at DESC;
```

## Troubleshooting

### Common Issues

1. **Webhook returns 400 "Invalid signature"**
   - Check `CLERK_WEBHOOK_SECRET` is correct
   - Ensure webhook secret starts with `whsec_`
   - Verify environment variable is loaded

2. **User creation fails**
   - Check Supabase service role key is correct
   - Verify `sync_user_from_clerk()` function exists in database
   - Check database logs for constraint violations

3. **RLS policy still failing**
   - Ensure user record was created successfully
   - Check that `auth.jwt() ->> 'sub'` returns the correct user ID
   - Verify TPA integration is configured correctly

### Debug Steps

1. **Check webhook logs**:
   ```bash
   # In your application logs, look for:
   [timestamp] Clerk Webhook - Processing webhook event: user.created
   ```

2. **Test manual sync**:
   ```bash
   curl -X POST https://your-domain.com/api/sync-user \
     -H "Authorization: Bearer your-clerk-session-token"
   ```

3. **Verify database function**:
   ```sql
   SELECT sync_user_from_clerk(
     'test_user_id',
     'test@example.com', 
     'Test',
     'User',
     'https://example.com/avatar.jpg'
   );
   ```

## Migration for Existing Users

If you have existing users who aren't synced:

1. **Use the bulk sync utility**:
   ```typescript
   import { UserSyncService } from '@/lib/services/user-sync-service'
   
   // Get all Clerk users and sync them
   const result = await UserSyncService.bulkSyncUsers(clerkUsers)
   ```

2. **Or create a migration script** to sync all existing users

## Security Considerations

- Webhook handler uses Supabase service role (bypasses RLS)
- Webhook signature verification prevents unauthorized requests
- Soft delete preserves data integrity
- User data is validated before database operations

## Monitoring

- Monitor webhook delivery success rates in Clerk Dashboard
- Set up alerts for failed webhook deliveries
- Monitor database for user creation/update patterns
- Track sync errors in application logs

## Next Steps

1. Set up the webhook in Clerk Dashboard
2. Update your environment variables
3. Deploy the changes
4. Test with a new user signup
5. Monitor webhook deliveries and database sync

This integration ensures seamless user data synchronization between Clerk and Supabase, resolving the authentication and database access issues you were experiencing.
