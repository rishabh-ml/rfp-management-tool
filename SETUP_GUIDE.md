# RFP Management System - Complete Setup Guide

This guide will walk you through setting up the RFP Management System with Supabase (database) and Clerk (authentication) integration.

## Prerequisites

- Node.js 18+ installed
- Git installed
- A Supabase account (free tier available)
- A Clerk account (free tier available)

## 🗄️ Part 1: Supabase Database Setup

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Choose your organization
4. Fill in project details:
   - **Name**: `rfp-management`
   - **Database Password**: Generate a strong password (save this!)
   - **Region**: Choose closest to your users
5. Click "Create new project"
6. Wait for the project to be ready (2-3 minutes)

### Step 2: Configure Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Run the database scripts in this order:

#### A. Create Schema and Tables
```sql
-- Copy and paste the entire content from database/01_schema.sql
-- This creates all tables, types, and indexes
```

#### B. Set Up Row Level Security
```sql
-- Copy and paste the entire content from database/02_rls_policies.sql
-- This sets up security policies and helper functions
```

#### C. Add Database Functions
```sql
-- Copy and paste the entire content from database/03_functions.sql
-- This adds utility functions and triggers
```

#### D. Add Seed Data (Optional)
```sql
-- Copy and paste the entire content from database/05_seed_data.sql
-- This adds comprehensive sample data for testing
```

**Or use the automated seeding script:**
```bash
# Make sure you have Node.js installed and dependencies
npm install

# Set your environment variables in .env.local
# Then run the seeding script
npm run seed

# Or run directly
node scripts/seed-database.js
```

### Step 3: Get Supabase Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (e.g., `https://your-project.supabase.co`)
   - **Project API Key** (anon/public key)
   - **Service Role Key** (keep this secret!)

## 🔐 Part 2: Clerk Authentication Setup

### Step 1: Create Clerk Application

1. Go to [clerk.com](https://clerk.com) and sign up/login
2. Click "Add application"
3. Fill in application details:
   - **Name**: `RFP Management`
   - **Sign-in options**: Email, Google (recommended)
4. Click "Create application"

### Step 2: Configure Clerk Third‑Party Auth (TPA) with Supabase

Clerk session tokens (RS256) are supported directly by Supabase—no custom HS256 template required.

In Supabase Dashboard → Auth → Third‑party Auth → Clerk, set:
- Issuer/Domain: https://<your-subdomain>.clerk.accounts.dev
- JWKS: https://<your-subdomain>.clerk.accounts.dev/.well-known/jwks.json

In Clerk, ensure the session token includes `{"role":"authenticated"}` (Customize session token). Do not override `sub`.

### Step 3: Set Up Webhooks (User Sync)

1. In Clerk dashboard, go to **Webhooks**
2. Click "Add Endpoint"
3. Set **Endpoint URL**: `https://your-domain.com/api/webhooks/clerk` (for local dev use your tunnel URL, e.g. from `ngrok`, to receive events)
4. Select events:
   - `user.created`
   - `user.updated`
   - `user.deleted`
5. Click "Create"
6. Copy the **Signing Secret** (you'll need this)

### Step 4: Get Clerk Credentials

1. In Clerk dashboard, go to **API Keys**
2. Copy these values:
   - **Publishable Key** (starts with `pk_`)
   - **Secret Key** (starts with `sk_`)

## ⚙️ Part 3: Application Configuration

### Step 1: Environment Variables

Create a `.env.local` file in your project root:

```env
# Clerk Configuration
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
CLERK_SECRET_KEY=sk_test_your_key_here
CLERK_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Clerk URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# TPA: No shared JWT secret needed when using Clerk Third‑party Auth (RS256)

# Optional local dev overrides
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Configure Supabase Auth

- Enable Clerk under Third‑party Auth with the Issuer and JWKS above.
- Disable email confirmations if Clerk handles onboarding.

## 🚀 Part 4: Deploy and Test

### Step 1: Run Development Server

```bash
npm run dev
```

### Step 2: Test Authentication

1. Go to `http://localhost:3000`
2. Click "Sign Up" and create an account
3. Verify the user appears in your Supabase `users` table
4. Test sign in/out functionality

### Step 3: Test Database Operations

1. Create a new project from the dashboard
2. Verify it appears in the `projects` table
3. Test adding comments and subtasks
4. Check that RLS policies are working

You can open a diagnostics endpoint to verify Clerk→Supabase token bridging:
- Visit `/api/diagnostics/auth` while signed in. Expected:
   - `clerk.hasToken` is true
   - `tokenAud` is `authenticated`
   - `tokenSub` equals your Clerk user id
   - `supabaseProbe.currentUserId` returns a UUID from the `users` table

### Step 4: Production Deployment

#### For Vercel:

1. Connect your GitHub repository to Vercel
2. Add all environment variables in Vercel dashboard
3. Update Clerk webhook URL to your production domain
4. Deploy!

#### For other platforms:

1. Set up environment variables
2. Update webhook URLs
3. Ensure proper CORS settings in Supabase

## 🔧 Part 5: Advanced Configuration

### Custom Attributes Setup

1. Go to `/dashboard/custom-attributes`
2. Create custom fields for your projects
3. Test them in project creation

### Role-Based Access Control

1. In Supabase, update user roles in the `users` table
2. Test different permission levels
3. Verify RLS policies work correctly
   - If you see `null` user in functions relying on `auth.jwt()`, re-check Clerk JWT template name (`supabase`) and audience (`authenticated`).

### Email Notifications (Optional)

1. Set up email service (SendGrid, Resend, etc.)
2. Configure SMTP settings
3. Test invitation emails

## 🐛 Troubleshooting

### Common Issues:

1. **"User not found" errors**
   - Check webhook is working (Clerk Dashboard → Webhooks → Delivery logs)
   - Verify Clerk TPA config in Supabase is correct (Issuer + JWKS)
   - Check user sync function
   - Ensure `SUPABASE_SERVICE_ROLE_KEY` is set for the webhook route (used server-side only)

2. **Permission denied errors**
   - Verify RLS policies
   - Check user roles
   - Ensure JWT is properly configured (token audience `authenticated`, `sub` matches Clerk user id)
   - Hit `/api/diagnostics/auth` to confirm `get_current_user_id()` resolves

3. **Database connection issues**
   - Check Supabase credentials
   - Verify network connectivity
   - Check API key permissions
   - Make sure the Supabase project URL and anon key are for the same project

### Debug Steps:

1. Check browser console for errors
2. Review Supabase logs
3. Check Clerk webhook logs (and re-deliver if needed)
4. Verify environment variables
5. Use the diagnostics endpoint as described above

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Clerk Documentation](https://clerk.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)

## 🎉 Success Checklist

- [ ] Supabase project created and configured
- [ ] Database schema deployed
- [ ] Clerk application set up
- [ ] JWT template configured
- [ ] Webhooks working
- [ ] Environment variables set
- [ ] Authentication working
- [ ] Database operations working
- [ ] Role-based access working
- [ ] Custom attributes working

Once all items are checked, your RFP Management System is ready for production use!
