# RFP Management Dashboard

A production-ready MVP for managing RFP (Request for Proposal) projects with a powerful Kanban-style interface. Built with Next.js 14, Supabase, and Clerk authentication.

## 🚀 Features

### Core Functionality
- **Project Management**: Complete CRUD operations for RFP projects
- **Kanban Board**: 6-stage workflow with drag-and-drop functionality
- **Custom Tags**: Color-coded tags for project categorization
- **User Management**: Role-based access control (Admin, Manager, Member)
- **Comments System**: Markdown-supported project discussions
- **Subtasks**: Break down projects into manageable tasks
- **Progress Tracking**: Visual progress indicators and status updates
- **Real-time Updates**: Live collaboration with Supabase Realtime

### Project Stages
1. **Unassigned** - New RFPs awaiting assignment
2. **Assigned** - RFPs assigned to team members
3. **Submitted** - Completed proposals submitted to clients
4. **Skipped** - RFPs we chose not to pursue
5. **Won** - Successful proposals that became contracts
6. **Lost** - Unsuccessful proposals

## 🛠 Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui, Lucide Icons
- **Backend**: Supabase (PostgreSQL, Realtime, RLS)
- **Authentication**: Clerk
- **Drag & Drop**: @dnd-kit
- **Forms**: React Hook Form + Zod validation
- **State Management**: React Server Components + Server Actions
- **Deployment**: Vercel

## 📋 Prerequisites

Before you begin, ensure you have:
- Node.js 18+ installed
- A Supabase account and project
- A Clerk account and application
- Git for version control

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd rfp-management-tool
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Copy the environment template:

```bash
cp .env.example .env.local
```

Fill in your environment variables in `.env.local`:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Clerk Configuration
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_publishable_key
CLERK_SECRET_KEY=sk_test_your_clerk_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# JWT Configuration for Supabase-Clerk Integration
# No shared JWT secret required when using Clerk TPA (RS256)
```

### 4. Database Setup

#### Create Supabase Tables

Run the following SQL scripts in your Supabase SQL editor:

1. **Schema Creation**: Execute `database/schema.sql`
2. **RLS Policies**: Execute `database/rls-policies.sql`
3. **Functions**: Execute `database/functions.sql`
4. **Sample Data**: Execute `database/seed.sql`

#### Configure Clerk-Supabase Integration

1. In your Clerk dashboard, go to JWT Templates
2. Create a new template named "supabase"
3. Use this configuration:

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

4. Set up a webhook endpoint in Clerk pointing to `/api/webhooks/clerk`

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── dashboard/         # Main dashboard pages
│   ├── sign-in/          # Authentication pages
│   └── api/              # API routes and webhooks
├── components/           # Reusable UI components
│   ├── ui/              # shadcn/ui components
│   └── kanban/          # Kanban-specific components
├── lib/                 # Utilities and configurations
│   ├── services/        # Data access layer
│   ├── types/           # TypeScript type definitions
│   ├── constants.ts     # App constants
│   ├── utils.ts         # Utility functions
│   └── supabase.ts      # Supabase client configuration
└── database/            # Database schema and migrations
    ├── schema.sql       # Database tables and types
    ├── rls-policies.sql # Row Level Security policies
    ├── functions.sql    # Database functions
    └── seed.sql         # Sample data
```

## 🔧 Configuration

### Supabase Setup

1. Create a new Supabase project
2. Run the SQL scripts in order:
   - `database/schema.sql` - Creates tables and types
   - `database/rls-policies.sql` - Sets up security policies
   - `database/functions.sql` - Creates helper functions
   - `database/seed.sql` - Adds sample data

### Clerk Setup

1. Create a Clerk application
2. Configure the JWT template for Supabase integration
3. Set up webhooks for user synchronization
4. Configure redirect URLs

## 🧪 Testing

The application includes sample data for testing:

- **Users**: 4 test users with different roles
- **Projects**: 7 sample projects across all stages
- **Tags**: 6 predefined tags with colors
- **Comments**: Sample project discussions
- **Subtasks**: Example task breakdowns

### Test Scenarios

1. **Drag & Drop**: Move projects between Kanban stages
2. **Tag Management**: Create, edit, and delete custom tags
3. **Project Creation**: Add new projects with assignments
4. **Comments**: Add discussions to projects
5. **Progress Tracking**: Update project completion status

### Build Status

⚠️ **Note**: The build will fail without proper environment variables. You must:

1. Set up a Supabase project and get real credentials
2. Set up a Clerk application and get real credentials
3. Update `.env.local` with actual values (not the placeholder values)
4. Run the database setup scripts in Supabase

The codebase is complete and ready for deployment once credentials are configured.

## 🚀 Deployment

### Vercel Deployment

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically on push

### Environment Variables for Production

Ensure all environment variables are set in your deployment platform:

- Supabase URLs and keys
- Clerk authentication keys
- JWT secrets for integration

## 🔒 Security Features

- **Row Level Security (RLS)**: Database-level access control
- **JWT Authentication**: Secure token-based auth with Clerk
- **Role-based Permissions**: Admin, Manager, Member roles
- **Input Validation**: Zod schemas for form validation
- **CSRF Protection**: Built-in Next.js security

## 📊 Performance

- **Server Components**: Optimized rendering
- **Real-time Updates**: Efficient WebSocket connections
- **Optimistic Updates**: Immediate UI feedback
- **Image Optimization**: Next.js automatic optimization
- **Code Splitting**: Automatic bundle optimization

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection**: Verify Supabase URL and keys
2. **Authentication**: Check Clerk configuration and JWT template
3. **RLS Policies**: Ensure policies are properly set up
4. **Environment Variables**: Verify all required vars are set

### Debug Mode

Enable debug logging by setting:

```env
NODE_ENV=development
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 Technical Debt

Items marked with `// TODO:` comments for post-MVP cleanup:

- Enhanced error handling and logging
- Comprehensive test suite
- Advanced filtering and search
- File attachment support
- Email notifications
- Advanced reporting and analytics

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:

1. Check the troubleshooting section
2. Review the database setup
3. Verify environment configuration
4. Check Supabase and Clerk documentation
