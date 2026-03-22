# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   ├── api-server/         # Express API server
│   └── internhub/          # InternHub React + Vite frontend
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts (single workspace package)
│   └── src/                # Individual .ts scripts
├── pnpm-workspace.yaml     # pnpm workspace
├── tsconfig.base.json      # Shared TS options
├── tsconfig.json           # Root TS project references
└── package.json            # Root package with hoisted devDeps
```

## Application: InternHub

**InternHub** is a fully automated internship SaaS platform where users:
- Register and get auto-assigned a random internship from the DB templates
- Complete tasks one by one (unlocked sequentially)
- Submit code for each task
- Track progress with a visual progress bar
- Receive an auto-generated certificate on 100% completion

### User Pages
- `/` — Landing page with hero, features, CTA
- `/register` — Create account (randomly assigns active internship)
- `/login` — Login
- `/dashboard` — Protected: progress, stats, current task
- `/tasks` — Protected: all tasks with status (locked/pending/completed)
- `/certificate` — Protected: certificate with PDF download (only after 100%)

### Admin Panel
- `/admin/login` — Admin login (default: admin@internhub.com / admin123)
- `/admin/dashboard` — Dashboard with stats: internship count, user count, certificates issued, avg progress
- `/admin/internships` — List all internship programs (CRUD)
- `/admin/internships/:id` — Edit internship + manage task templates (add/edit/delete tasks)
- `/admin/users` — View all users with progress table

### Auth
- JWT-based authentication stored in localStorage as `internhub_token`
- bcrypt password hashing (12 rounds)
- 7-day JWT expiry
- `isAdmin` flag in users table; admin middleware on all `/api/admin/*` routes

### Automation Logic
- On register: randomly picks an active internship from DB templates, creates task records from task_templates
- Tasks unlock sequentially (only one pending at a time)
- Progress = completedTasks / totalTasks * 100
- Certificate auto-generated when progress = 100%

### Seeded Data (on first startup)
- 3 internship templates: Web Development (14 tasks), Data Science (10 tasks), UI/UX Design (7 tasks)
- Admin user: admin@internhub.com / admin123

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all packages as project references.

- **Always typecheck from the root** — run `pnpm run typecheck`
- **`emitDeclarationOnly`** — only `.d.ts` files are emitted during typecheck

## Packages

### `artifacts/api-server` (`@workspace/api-server`)

Express 5 API server.

Routes:
- `GET /api/healthz` — health check
- `POST /api/auth/register` — register user, auto-assign random internship from DB
- `POST /api/auth/login` — login
- `GET /api/users/me` — get current user (auth required)
- `GET /api/tasks` — get all tasks with status (auth required)
- `POST /api/tasks/:taskId/complete` — complete a task (auth required)
- `GET /api/certificate` — get certificate data (auth required, 100% only)
- `GET /api/admin/internships` — list internship templates (admin)
- `POST /api/admin/internships` — create internship template (admin)
- `GET /api/admin/internships/:id` — get internship with tasks (admin)
- `PUT /api/admin/internships/:id` — update internship (admin)
- `DELETE /api/admin/internships/:id` — delete internship (admin)
- `POST /api/admin/internships/:id/tasks` — add task template (admin)
- `PUT /api/admin/tasks/:id` — update task template (admin)
- `DELETE /api/admin/tasks/:id` — delete task template (admin)
- `GET /api/admin/users` — list all users (admin)

Middleware:
- `src/middlewares/auth.ts` — JWT verification, `generateToken()`
- `src/middlewares/adminAuth.ts` — isAdmin check

Lib:
- `src/lib/seed.ts` — seeds 3 internship templates + admin user on first startup

### `artifacts/internhub` (`@workspace/internhub`)

React + Vite frontend.

Key files:
- `src/lib/auth-context.tsx` — AuthProvider, useAuth hook, token management, login(token, user?)
- `src/App.tsx` — router with user + admin routes
- `src/components/layout/AdminLayout.tsx` — admin sidebar layout
- `src/pages/admin/AdminLogin.tsx` — admin login
- `src/pages/admin/AdminDashboard.tsx` — admin dashboard with stats
- `src/pages/admin/AdminInternships.tsx` — internship CRUD list
- `src/pages/admin/AdminInternshipDetail.tsx` — edit internship + manage task templates
- `src/pages/admin/AdminUsers.tsx` — user table with progress

### `lib/db` (`@workspace/db`)

Database schema:
- `src/schema/users.ts` — users table (id, name, email, password_hash, internship info, progress, is_admin)
- `src/schema/tasks.ts` — tasks table (id, user_id, day_number, title, description, instructions, is_completed, submitted_code)
- `src/schema/internship_templates.ts` — internship_templates (id, title, field, description, is_active)
- `src/schema/task_templates.ts` — task_templates (id, internship_template_id, day_number, title, description, instructions)

Push schema: `pnpm --filter @workspace/db run push`

### `lib/api-spec` (`@workspace/api-spec`)

OpenAPI 3.1 spec + Orval config. Run codegen: `pnpm --filter @workspace/api-spec run codegen`
