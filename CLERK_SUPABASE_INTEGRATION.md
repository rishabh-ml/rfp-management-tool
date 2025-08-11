# Clerk + Supabase Integration Guide

This guide provides step-by-step instructions for integrating Clerk authentication with Supabase database using the current (non-deprecated) method.

## Overview

- **Clerk**: Handles user authentication, session management, and JWT tokens
- **Supabase**: Database with Row Level Security (RLS) policies
- **Integration**: Uses Clerk JWT tokens for Supabase authentication

## Prerequisites

- Clerk account and project set up
- Supabase project created
- Database schema deployed (from `database/` folder)

## Step 1: Configure Clerk JWT Template

### 1.1 Create Custom JWT Template in Clerk Dashboard

1. Go to your Clerk Dashboard
2. Navigate to **JWT Templates** in the sidebar
3. Click **New template**
4. Choose **Supabase** as the template type
5. Configure the template:

```json
{
  "aud": "authenticated",
  "exp": "{{user.created_at + 3600}}",
  "iat": "{{user.created_at}}",
  "iss": "https://your-clerk-domain.clerk.accounts.dev",
  "sub": "{{user.id}}",
  "email": "{{user.primary_email_address.email_address}}",
  "phone": "{{user.primary_phone_number.phone_number}}",
  "app_metadata": {
    "provider": "clerk",
    "providers": ["clerk"]
  },
  "user_metadata": {
    "first_name": "{{user.first_name}}",
    "last_name": "{{user.last_name}}",
    "avatar_url": "{{user.image_url}}"
  },
  "role": "authenticated"
}
```

6. Save the template and note the **Template Name** (e.g., "supabase")

### 1.2 Get JWT Signing Secret

1. In Clerk Dashboard, go to **API Keys**
2. Copy the **JWT Signing Secret** (starts with `sk_test_` or `sk_live_`)

## Step 2: Configure Supabase JWT Settings

### 2.1 Set JWT Secret in Supabase

1. Go to your Supabase Dashboard
2. Navigate to **Settings** → **API**
3. In the **JWT Settings** section:
   - Set **JWT Secret** to your Clerk JWT Signing Secret
   - Set **JWT Expiry** to `3600` (1 hour)

### 2.2 Update Environment Variables

Add to your `.env.local`:

```env
# Clerk Configuration
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
CLERK_SECRET_KEY=sk_test_your_secret_here
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# JWT Configuration for Supabase-Clerk Integration
SUPABASE_JWT_SECRET=your_clerk_jwt_signing_secret_here
```

## Step 3: Implement Supabase Client with Clerk Auth

### 3.1 Create Clerk-Supabase Client

The integration is already implemented in `src/lib/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js'
import { auth } from '@clerk/nextjs/server'

export async function createClerkSupabaseClient() {
  const { getToken } = await auth()
  
  const supabaseAccessToken = await getToken({
    template: 'supabase' // Use your JWT template name
  })

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          Authorization: `Bearer ${supabaseAccessToken}`,
        },
      },
    }
  )

  return supabase
}
```

## Step 4: Set Up User Synchronization

### 4.1 Create Clerk Webhook

1. In Clerk Dashboard, go to **Webhooks**
2. Click **Add Endpoint**
3. Set URL to: `https://your-domain.com/api/webhooks/clerk`
4. Select events:
   - `user.created`
   - `user.updated`
   - `user.deleted`
5. Copy the **Signing Secret**

### 4.2 Implement Webhook Handler

The webhook is implemented in `src/app/api/webhooks/clerk/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { Webhook } from 'svix'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    throw new Error('Please add CLERK_WEBHOOK_SECRET to .env.local')
  }

  // Verify webhook
  const headerPayload = req.headers
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occurred -- no svix headers', { status: 400 })
  }

  const payload = await req.json()
  const body = JSON.stringify(payload)

  const wh = new Webhook(WEBHOOK_SECRET)
  let evt

  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    })
  } catch (err) {
    console.error('Error verifying webhook:', err)
    return new Response('Error occurred', { status: 400 })
  }

  // Handle the webhook
  const { id, email_addresses, first_name, last_name, image_url } = evt.data
  const eventType = evt.type

  if (eventType === 'user.created' || eventType === 'user.updated') {
    // Use service role client for webhook operations
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    await supabase.rpc('sync_user_from_clerk', {
      p_id: id,
      p_email: email_addresses[0]?.email_address || '',
      p_first_name: first_name || null,
      p_last_name: last_name || null,
      p_avatar_url: image_url || null
    })
  }

  return NextResponse.json({ message: 'Success' })
}
```

### 4.3 Add Webhook Secret to Environment

```env
CLERK_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

## Step 5: Test the Integration

### 5.1 Test Database Connection

Visit `/api/test-db` to verify the connection:

```bash
curl https://your-domain.com/api/test-db
```

### 5.2 Test User Creation

1. Sign up a new user through your app
2. Check Supabase database to see if user was created
3. Verify RLS policies are working

### 5.3 Test API Endpoints

```bash
# Test projects endpoint
curl -H "Authorization: Bearer YOUR_CLERK_TOKEN" \
     https://your-domain.com/api/projects
```

## Step 6: Troubleshooting

### Common Issues

1. **JWT Verification Failed**
   - Ensure JWT secret matches between Clerk and Supabase
   - Check JWT template configuration

2. **RLS Policies Blocking Access**
   - Verify `current_user_id()` function returns correct user ID
   - Check policy conditions

3. **User Not Found in Database**
   - Ensure webhook is properly configured
   - Check webhook logs in Clerk dashboard

### Debug Commands

```sql
-- Test current user function
SELECT public.current_user_id();

-- Check user exists
SELECT * FROM public.users WHERE id = 'clerk_user_id';

-- Test RLS policies
SELECT * FROM public.projects; -- Should only show user's projects
```

## Security Considerations

1. **Never expose service role key** in client-side code
2. **Use RLS policies** for all data access
3. **Validate JWT tokens** in API routes
4. **Implement proper error handling** to avoid information leakage

## Next Steps

1. Deploy your application
2. Configure production webhooks
3. Set up monitoring and logging
4. Implement additional security measures
