# Deployment Checklist

This document provides a step-by-step guide for deploying the RFP Management Dashboard to production.

## Pre-Deployment Checklist

### 1. Environment Setup
- [ ] Supabase project created and configured
- [ ] Clerk application created and configured
- [ ] All environment variables documented
- [ ] Database schema deployed
- [ ] RLS policies enabled
- [ ] Sample data seeded (optional for production)

### 2. Code Quality
- [ ] All TypeScript errors resolved
- [ ] ESLint warnings addressed
- [ ] Build process successful (`npm run build`)
- [ ] All TODO comments documented
- [ ] Security review completed

### 3. Testing
- [ ] Authentication flow tested
- [ ] CRUD operations verified
- [ ] Kanban drag-and-drop functional
- [ ] Real-time updates working
- [ ] Mobile responsiveness checked
- [ ] Cross-browser compatibility verified

## Supabase Configuration

### 1. Database Setup

Execute these SQL files in order in your Supabase SQL editor:

```sql
-- 1. Create schema and tables
-- Copy and paste content from database/schema.sql

-- 2. Set up Row Level Security
-- Copy and paste content from database/rls-policies.sql

-- 3. Create helper functions
-- Copy and paste content from database/functions.sql

-- 4. Seed sample data (optional)
-- Copy and paste content from database/seed.sql
```

### 2. API Settings

In your Supabase dashboard:

1. Go to Settings > API
2. Copy the Project URL and anon key
3. Copy the service_role key (keep secure!)
4. Note the JWT Secret for Clerk integration

### 3. Authentication Settings

1. Go to Authentication > Settings
2. Disable email confirmations for development
3. Configure redirect URLs if needed
4. Set up any additional providers

## Clerk Configuration

### 1. Application Setup

1. Create a new Clerk application
2. Configure sign-in/sign-up options
3. Set up redirect URLs:
   - Sign-in URL: `/sign-in`
   - Sign-up URL: `/sign-up`
   - After sign-in: `/dashboard`
   - After sign-up: `/dashboard`

### 2. JWT Template

Create a JWT template named "supabase":

```json
{
  "aud": "authenticated",
  "exp": "{{exp}}",
  "iat": "{{iat}}",
  "iss": "https://your-clerk-domain.clerk.accounts.dev",
  "sub": "{{user.id}}",
  "user_id": "{{user.id}}",
  "email": "{{user.primary_email_address.email_address}}",
  "role": "authenticated"
}
```

### 3. Webhooks

Set up a webhook endpoint:
- Endpoint URL: `https://your-domain.com/api/webhooks/clerk`
- Events: `user.created`, `user.updated`, `user.deleted`
- Add webhook secret to environment variables

## Vercel Deployment

### 1. Repository Setup

1. Push code to GitHub repository
2. Ensure `.env.local` is in `.gitignore`
3. Create `.env.example` with template variables

### 2. Vercel Configuration

1. Connect GitHub repository to Vercel
2. Configure build settings:
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

### 3. Environment Variables

Add these environment variables in Vercel dashboard:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_your_key
CLERK_SECRET_KEY=sk_live_your_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# JWT Integration
# No shared JWT secret required when using Clerk TPA (RS256)

# Webhooks
CLERK_WEBHOOK_SECRET=your_webhook_secret
```

### 4. Domain Configuration

1. Configure custom domain (optional)
2. Update Clerk redirect URLs with production domain
3. Update webhook URLs with production domain

## Post-Deployment Verification

### 1. Functionality Tests

- [ ] Homepage redirects to dashboard
- [ ] Authentication flow works
- [ ] User registration creates database record
- [ ] Projects can be created, read, updated, deleted
- [ ] Kanban board drag-and-drop functions
- [ ] Tags can be managed
- [ ] Comments can be added
- [ ] Real-time updates work across sessions

### 2. Performance Tests

- [ ] Page load times < 2 seconds
- [ ] Drag-and-drop responsive < 100ms
- [ ] Real-time updates < 500ms
- [ ] Mobile performance acceptable
- [ ] Lighthouse scores > 90

### 3. Security Tests

- [ ] RLS policies prevent unauthorized access
- [ ] JWT tokens properly validated
- [ ] API endpoints secured
- [ ] No sensitive data in client-side code
- [ ] HTTPS enforced

## Monitoring and Maintenance

### 1. Error Tracking

Set up error monitoring:
- Vercel Analytics (built-in)
- Sentry (optional)
- Supabase logs monitoring

### 2. Performance Monitoring

- Vercel Speed Insights
- Core Web Vitals tracking
- Database performance monitoring

### 3. Backup Strategy

- Supabase automatic backups enabled
- Regular database exports
- Code repository backups

## Rollback Plan

In case of deployment issues:

1. **Immediate Rollback**: Use Vercel's instant rollback feature
2. **Database Issues**: Restore from Supabase backup
3. **Configuration Issues**: Revert environment variables
4. **Code Issues**: Revert to previous Git commit

## Production Checklist

Before going live:

- [ ] All tests passing
- [ ] Performance benchmarks met
- [ ] Security review completed
- [ ] Backup strategy implemented
- [ ] Monitoring configured
- [ ] Documentation updated
- [ ] Team trained on new features
- [ ] Support processes defined

## Scaling Considerations

For future scaling:

1. **Database**: Consider read replicas for heavy read workloads
2. **CDN**: Implement for static assets
3. **Caching**: Add Redis for session/data caching
4. **Load Balancing**: Multiple Vercel regions
5. **Monitoring**: Advanced APM tools

## Support and Troubleshooting

Common production issues:

1. **Database Connection**: Check Supabase status and connection limits
2. **Authentication**: Verify Clerk configuration and JWT template
3. **Real-time**: Check WebSocket connections and Supabase limits
4. **Performance**: Monitor database queries and optimize as needed

For additional support:
- Supabase documentation and support
- Clerk documentation and support
- Vercel documentation and support
- Next.js documentation
