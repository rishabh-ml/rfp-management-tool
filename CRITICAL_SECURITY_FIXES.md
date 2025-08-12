# Critical Security Fixes

## 🚨 URGENT: Apply These Fixes Immediately

### Fix 1: User ID Mapping Corrections

The following endpoints are using `clerk_id` column which doesn't exist in the database schema. The `users` table uses `id` as the primary key that stores the Clerk user ID directly.

#### Files to Fix:

1. **`src/app/api/invitations/route.ts`** (Line 28)
2. **`src/app/api/notifications/mark-all-read/route.ts`** (Line 18)
3. **`src/app/api/profile/route.ts`** (Line 29)
4. **`src/app/api/profile/preferences/route.ts`** (Line 34)
5. **`src/app/api/users/[id]/role/route.ts`** (Line 30)
6. **`src/app/api/users/[id]/deactivate/route.ts`** (Line 22)
7. **`src/app/api/users/[id]/reactivate/route.ts`** (Line 22)
8. **`src/app/api/notifications/[id]/read/route.ts`** (Line 22)
9. **`src/app/api/custom-attributes/[id]/route.ts`** (Line 36)

#### Change Required:
```typescript
// ❌ WRONG - clerk_id column doesn't exist
.eq('clerk_id', userId)

// ✅ CORRECT - id column stores Clerk user ID
.eq('id', userId)
```

### Fix 2: Remove User ID from Request Bodies

These endpoints allow users to specify their own `userId` in request bodies, which is a critical security vulnerability:

#### Files to Fix:

1. **`src/app/api/comments/route.ts`**
   - Remove `userId: z.string().optional()` from schema
   - Remove `const actualUserId = requestUserId || userId` logic
   - Always use authenticated `userId`

2. **`src/app/api/projects/update-stage/route.ts`**
   - Remove `userId: z.string().optional()` from schema
   - Remove `const actualUserId = requestUserId || userId` logic
   - Always use authenticated `userId`

3. **`src/app/api/subtasks/route.ts`**
   - Remove `created_by: z.string().optional()` from schema
   - Remove `const actualUserId = created_by || userId` logic
   - Always use authenticated `userId`

### Fix 3: Remove Debug Endpoints

These endpoints expose sensitive information and should be removed in production:

#### Files to Remove/Secure:
1. **`src/app/api/debug/auth/route.ts`** - Remove entirely or add admin-only access
2. **`src/app/api/diagnostics/auth/route.ts`** - Remove entirely or add admin-only access

### Fix 4: Add Resource Authorization Checks

Several endpoints need proper resource ownership validation:

#### Files Needing Authorization Fixes:

1. **`src/app/api/comments/route.ts`** (GET method)
   - Verify user can access the project before returning comments

2. **`src/app/api/custom-attributes/route.ts`** (GET method)
   - Add proper filtering based on user permissions

## 🔧 Implementation Priority

### Priority 1 (CRITICAL - Fix Immediately)
- [ ] Fix user ID mapping in all 9 endpoints
- [ ] Remove userId from request bodies in 3 endpoints

### Priority 2 (HIGH - Fix Today)
- [ ] Remove/secure debug endpoints
- [ ] Add resource authorization checks

### Priority 3 (MEDIUM - Fix This Week)
- [ ] Implement rate limiting
- [ ] Improve error message sanitization
- [ ] Add comprehensive logging

## 🧪 Testing After Fixes

After applying these fixes, test:

1. **User ID Mapping**: Verify all endpoints can find users correctly
2. **Authorization**: Ensure users cannot access other users' resources
3. **Request Body Security**: Confirm users cannot impersonate others
4. **Debug Endpoints**: Verify they're removed or properly secured

## 📝 Code Review Checklist

Before deploying:
- [ ] All `clerk_id` references changed to `id`
- [ ] No optional `userId` parameters in request schemas
- [ ] Debug endpoints removed or secured
- [ ] Resource ownership checks implemented
- [ ] All tests passing
- [ ] Security review completed

## 🚀 Deployment Notes

These are breaking changes that will affect API behavior. Coordinate deployment with:
- Frontend team (if they rely on debug endpoints)
- QA team for testing
- DevOps team for monitoring

## 📞 Emergency Contact

If issues arise after deployment:
1. Revert the user ID mapping changes first
2. Check application logs for authentication errors
3. Verify RLS policies are working correctly
4. Monitor for 404/403 error spikes
