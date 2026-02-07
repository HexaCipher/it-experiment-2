This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
# Security-First Student Management System

> **IT Security Assignment — Experiment 2**
>
> A full-stack application demonstrating production-ready security principles: Access Control, HTTPS, Input Validation, and Machine Authorization.

## 📋 Project Overview

This is a comprehensive student management system built with a focus on **defense-in-depth security architecture**. The application manages students, their marks, notices, and administrative operations while maintaining multiple overlapping security layers to ensure that if one fails, the next catches it.

The system demonstrates real, practical implementations of core security concepts rather than theoretical descriptions:

- **Multi-layered access control** with role-based authorization
- **Client and server-side validation** using Zod and Convex validators
- **Secure authentication** via Clerk with JWT tokens over HTTPS
- **Audit logging** for complete accountability of privileged operations
- **Fail-secure principles** — always deny by default, never allow

## ✨ Key Features

### Security Architecture

1. **Access Control & Least Privilege**
   - SessionWrapper redirects unauthenticated users to `/auth`
   - AdminWrapper & StudentWrapper enforce role-based access
   - ConfirmedUserWrapper blocks pending/disabled accounts
   - Fail-secure: defaults to DENY access

2. **HTTPS & Secure Communication**
   - All data-in-transit encrypted via TLS
   - Clerk manages authentication over HTTPS with JWT tokens
   - Webhook payloads verified using Svix HMAC signatures
   - Protection against man-in-the-middle attacks

3. **Dual-Layer Input Validation**
   - Client-side: Zod schemas for format, type, and length validation
   - Server-side: Convex validators with manual bounds checking
   - Roll number uniqueness enforcement
   - Password hashing delegated to Clerk (bcrypt/Argon2)

4. **Machine Authorization (RBAC)**
   - Backend-enforced role-based access control
   - Every admin mutation calls `requireAdmin()` guard
   - Identity verification from database — impossible to bypass
   - Role-filtered navigation in UI

5. **Audit Logging**
   - Every privileged operation logged with actor, target, timestamp
   - Complete accountability trail in `admin_actions` table
   - Fields: `action_type`, `target`, `by_clerk_user_id`, `details`, `_creationTime`

### User Roles

- **Admin**: Full access to user management, marks, notices, and view templates
- **Student**: View personal marks and notices
- **Pending**: Awaiting admin confirmation (no access)
- **Unauthenticated**: Redirected to login

## 🛠 Tech Stack

| Category | Technology |
|----------|------------|
| **Frontend** | Next.js 16, React 19, TypeScript |
| **Styling** | Tailwind CSS, Framer Motion |
| **UI Components** | shadcn/ui |
| **Backend** | Convex (serverless backend) |
| **Authentication** | Clerk |
| **Database** | PostgreSQL (via Convex) |
| **Validation** | Zod |
| **Webhooks** | Svix |

## 📦 Installation

### Prerequisites

- **Node.js** 18+ or **Bun** 1.0+
- **Git**

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd it-experiment-2
   ```

2. **Install dependencies**
   ```bash
   bun install
   # or
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   # Clerk Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=<your-clerk-publishable-key>
   CLERK_SECRET_KEY=<your-clerk-secret-key>
   
   # Convex Backend
   CONVEX_DEPLOYMENT=<your-convex-deployment>
   NEXT_PUBLIC_CONVEX_URL=<your-convex-url>
   
   # Svix Webhooks (for Clerk events)
   SVIX_WEBHOOK_SECRET=<your-svix-webhook-secret>
   ```

   For detailed setup instructions, see [AUTH_SETUP.md](AUTH_SETUP.md)

4. **Run the development server**
   ```bash
   bun run dev
   # or
   npm run dev
   ```

5. **Open the application**
   
   Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

## 📂 Project Structure

```
├── app/                          # Next.js App Router pages
│   ├── page.tsx                 # Landing/home page
│   ├── layout.tsx               # Root layout
│   ├── auth/                    # Authentication pages
│   ├── admin/                   # Admin dashboard & management
│   │   ├── users/              # User management
│   │   ├── marks/              # Marks management
│   │   ├── notices/            # Notice management
│   │   └── students/           # Student management
│   ├── student/                # Student portal
│   ├── pending/                # Pending user page
│   ├── 403/                    # Unauthorized access handler
│   └── account-not-found/      # Account not found handler
│
├── components/
│   ├── navbar.tsx              # Navigation bar
│   ├── admin/                  # Admin-specific components
│   │   ├── UserTable.tsx
│   │   └── DeleteConfirmDialog.tsx
│   ├── landing/                # Landing page components
│   │   └── SecurityShieldAnimation.tsx
│   ├── ui/                     # Reusable UI components (shadcn/ui)
│   └── wrappers/               # Authorization wrappers
│       ├── SessionWrapper.tsx
│       ├── AdminWrapper.tsx
│       ├── StudentWrapper.tsx
│       └── ConfirmedUserWrapper.tsx
│
├── convex/                      # Backend logic
│   ├── schema.ts               # Database schema
│   ├── auth.config.ts          # Authentication configuration
│   ├── http.ts                 # HTTP routing & webhooks
│   ├── functions/
│   │   ├── queries.ts          # Read operations
│   │   ├── mutations.ts        # Write operations (user)
│   │   └── adminMutations.ts   # Write operations (admin)
│   └── types/
│       └── index.ts            # TypeScript type definitions
│
├── hooks/                       # Custom React hooks
│   └── use-mobile.ts
│
├── lib/                         # Utility functions
│   ├── convexAuth.ts           # Clerk/Convex integration
│   ├── ConvexClerkProvider.tsx # Provider components
│   ├── theme-provider.tsx      # Theme configuration
│   ├── utils.ts                # General utilities
│   └── validations.ts          # Zod validation schemas
│
├── public/                      # Static assets
├── package.json
├── tsconfig.json
├── next.config.ts
├── postcss.config.mjs
├── tailwind.config.ts
└── components.json
```

## 🚀 Running the Application

### Development Mode

```bash
bun run dev
```

The app runs on [http://localhost:3000](http://localhost:3000) with hot-reload enabled.

### Build for Production

```bash
bun run build
```

### Start Production Server

```bash
bun run start
```

### Run ESLint

```bash
bun run lint
```

## 👥 Using the Application

### Authentication Flow

1. **New User**: Click "Get Started" → Redirected to Clerk login
2. **First Login**: Admin confirms your account
3. **Pending Users**: See `/pending` page until confirmation
4. **Access Levels**:
   - Admins: Full dashboard at `/admin`
   - Students: Personal portal at `/student`
   - Unconfirmed: Locked to `/pending`
   - Unauthorized: Redirected to `/403`

### Admin Features

- **User Management**: Confirm, disable, or delete users
- **Marks Management**: Upload and manage student marks per semester
- **Notice Board**: Post and manage notices
- **View Templates**: Access student data templates

### Student Features

- **View Marks**: See personal marks by semester
- **View Notices**: Read all published notices
- **View Profile**: Access personal information

## 🔐 Security Best Practices Implemented

| Practice | Implementation |
|----------|----------------|
| **Defense in Depth** | 5 overlapping security layers (Clerk → Session → Role → Backend → Audit) |
| **Least Privilege** | Users only see what their role permits |
| **Fail-Secure** | System defaults to DENY, never ALLOW |
| **Input Validation** | Dual validation: client (Zod) + server (Convex) |
| **Secure Communication** | HTTPS/TLS for all data-in-transit |
| **Authentication** | Clerk with JWT tokens over HTTPS |
| **Authorization** | Backend-enforced RBAC on all mutations |
| **Audit Trail** | Every admin action logged with full context |
| **CSRF Protection** | Convex's built-in session management |
| **XSS Prevention** | React's automatic escaping + CSP headers |

## 📊 Database Schema Highlights

Key tables (defined in `convex/schema.ts`):

- **users**: User accounts with role and confirmation status
- **marks**: Student marks by roll number and semester
- **notices**: Administrative notices
- **admin_actions**: Audit log of all privileged operations
- **templates**: Student dataview templates for admins

## 🔧 Environment & Configuration

### Required Environment Variables

Check [AUTH_SETUP.md](AUTH_SETUP.md) for comprehensive setup guide including:
- Clerk authentication setup
- Convex backend configuration
- Webhook configuration
- Production deployment steps

## 🐛 Troubleshooting

### "Account Not Found"
- User email doesn't match any account in the database
- Ensure admin has confirmed your account

### "Access Denied" (403)
- Your role doesn't have permission for this page
- Contact administrator to update your role

### "Pending Verification"
- Your account is awaiting admin confirmation
- Check the `/pending` page for status

### Database Migration Issues
- Run `convex dev` to set up local development
- Ensure all schema migrations are applied

## 📝 API & Backend Documentation

For detailed Convex backend documentation:
- **Queries**: `convex/functions/queries.ts`
- **Mutations**: `convex/functions/mutations.ts`
- **Admin Operations**: `convex/functions/adminMutations.ts`
- **Type Definitions**: `convex/types/index.ts`

## 🎓 Learning Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Convex Documentation](https://docs.convex.dev)
- [Clerk Documentation](https://clerk.com/docs)
- [Zod Validation](https://zod.dev)
- [OWASP Security Guidelines](https://owasp.org)

## 📄 License

This is an educational project created for IT Security Assignment — Experiment 2.

## 👨‍💻 Contributing

This is an educational assignment. Feel free to use this as a reference for implementing secure full-stack applications.

## 📞 Support

For issues or questions:
1. Check [AUTH_SETUP.md](AUTH_SETUP.md) for setup-specific help
2. Review error messages in browser console
3. Check Convex/Clerk dashboards for service status
4. Review security logs in `admin_actions` table
