# Clerk + Supabase TPA Integration Migration Guide

This guide documents the migration from the deprecated JWT template approach to the new native Third-Party Auth (TPA) integration between Clerk and Supabase.

## What Changed

### Before (Deprecated JWT Template Approach)
- Used custom JWT templates in Clerk Dashboard
- Required sharing JWT signing secrets between Clerk and Supabase
- Used `Authorization: Bearer ${token}` headers
- Required manual token management

### After (Native TPA Integration)
- Uses Clerk's native Supabase integration
- No shared secrets required (uses RS256 public key verification)
- Uses `accessToken()` callback in Supabase client
- Automatic token refresh and management

## Migration Steps Completed

### 1. ✅ Updated Supabase Client (Server-side)

**File:** `src/lib/supabase.ts`

**Before:**
```typescript
return createClient(supabaseUrl, supabaseAnonKey, {
  global: {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  },
})
```

**After:**
```typescript
return createClient(supabaseUrl, supabaseAnonKey, {
  async accessToken() {
    const token = await getToken()
    return token ?? null
  },
})
```

### 2. ✅ Updated Client-side Hook

**File:** `src/lib/hooks/use-realtime.ts`

**Before:**
```typescript
const client = createClient(supabaseUrl, supabaseAnonKey, {
  global: token
    ? { headers: { Authorization: `Bearer ${token}` } }
    : undefined,
  // ...
})
```

**After:**
```typescript
const client = createClient(supabaseUrl, supabaseAnonKey, {
  async accessToken() {
    const token = await getToken()
    return token ?? null
  },
  // ...
})
```

### 3. ✅ Updated Environment Variables

**File:** `.env.local`

**Removed:**
```env
SUPABASE_JWT_SECRET=...
```

**Added comment:**
```env
# TPA Integration: No shared JWT secret needed when using Clerk Third-party Auth (RS256)
```

### 4. ✅ RLS Policies (Already Compatible)

The existing RLS policies using `auth.jwt() ->> 'sub'` are already compatible with TPA integration.

### 5. ✅ Added Test Page

**File:** `src/app/test-tpa/page.tsx`

Comprehensive test page to validate the TPA integration.

## Required Dashboard Configuration

### Clerk Dashboard Configuration

1. Navigate to your Clerk Dashboard
2. Go to the Supabase integration setup
3. Select your configuration options
4. Click "Activate Supabase integration"
5. Note your Clerk domain: `https://social-aphid-87.clerk.accounts.dev`

### Supabase Dashboard Configuration

1. Go to your Supabase project dashboard
2. Navigate to **Authentication > Sign In / Up**
3. Click **Add provider** and select **Clerk**
4. Enter your Clerk domain: `https://social-aphid-87.clerk.accounts.dev`
5. The JWKS URL should automatically be set to: `https://social-aphid-87.clerk.accounts.dev/.well-known/jwks.json`
6. Save the configuration

## Testing the Integration

### 1. Run the Test Page

Visit `/test-tpa` in your application to run comprehensive integration tests:

- ✅ Clerk Authentication
- ✅ Token Generation
- ✅ Supabase Client Creation
- ✅ Database Connection
- ✅ RLS Policy Test
- ✅ User Data Access

### 2. Check Existing API Routes

All existing API routes should continue to work without changes since they use the updated `createClerkSupabaseClient()` function.

### 3. Verify Database Operations

Test CRUD operations to ensure RLS policies work correctly:

```typescript
// This should work for authenticated users
const { data, error } = await supabase
  .from('projects')
  .select('*')
  .eq('owner_id', userId)
```

## Benefits of TPA Integration

1. **Security**: No shared secrets, uses RS256 public key verification
2. **Maintenance**: Automatic token refresh, no manual token management
3. **Reliability**: Native integration reduces points of failure
4. **Future-proof**: Recommended approach by both Clerk and Supabase

## Troubleshooting

### Common Issues

1. **"Invalid JWT" errors**
   - Ensure Clerk domain is correctly configured in Supabase
   - Verify JWKS URL is accessible
   - Check that Clerk integration is activated

2. **RLS policy failures**
   - Verify user exists in the `users` table
   - Check that `auth.jwt() ->> 'sub'` returns the expected user ID
   - Use the test page to debug RLS issues

3. **Token not found**
   - Ensure user is properly authenticated with Clerk
   - Check that session is active
   - Verify `getToken()` returns a valid token

### Debug Commands

```typescript
// Check current user ID from RLS
const { data: userId } = await supabase.rpc('get_current_user_id')

// Check JWT claims
const token = await session?.getToken()
const decoded = JSON.parse(atob(token.split('.')[1]))
console.log('JWT claims:', decoded)
```

## Next Steps

1. Complete the dashboard configuration steps above
2. Run the test page at `/test-tpa` to validate the integration
3. Test your existing application functionality
4. Monitor for any authentication issues
5. Remove any old JWT template references if they exist

## Support

If you encounter issues:

1. Check the test page results for specific error details
2. Verify dashboard configuration is correct
3. Check browser network tab for authentication errors
4. Review Supabase logs for RLS policy issues
