# Gurugram University – IQAC Feedback Portal

A multi-role web portal for collecting the University's stakeholder feedback forms online and
reporting on them.

| User type | Forms |
|---|---|
| Student | Students Feedback Form (each semester), Exit Survey Report by the Student |
| Alumni | Alumni Feedback Form, Exit Survey (if not already filled as a student) |
| Faculty Member | Feedback from Faculty Members |
| Employer | Feedback from Employers (one per graduate employee) |
| Parent | Feedback from the Parents |
| Support Staff | Feedback from Support-Staff Members |
| Admin (IQAC) | Dashboard, per-form reports with averages and distributions, CSV export, user management |

**Student → Alumni:** when a student completes their programme, an admin selects them on
*Admin → Users* and clicks **Mark as graduated**. The same account becomes an Alumni account
(with year of passing) and the Alumni Feedback Form unlocks. Past graduates without a student
account can also register directly as Alumni.

All form questions live in [`lib/forms.ts`](lib/forms.ts) — edit that file to add, remove or
reword questions; the form pages, reports and CSV export update automatically.

## Tech stack

Next.js 14 (App Router, server actions) · TypeScript · Tailwind CSS · Prisma (SQLite locally) ·
cookie sessions signed with `jose`, passwords hashed with `bcryptjs`.

## Running locally

```bash
npm install
cp .env.example .env        # then set AUTH_SECRET to a long random string
npm run setup               # creates the SQLite DB and seeds admin + demo users
npm run dev                 # http://localhost:3000
```

Seeded accounts:

- Admin: `admin@gurugramuniversity.ac.in` / `Admin@12345` (override with `ADMIN_EMAIL` /
  `ADMIN_PASSWORD` when seeding). **Change this password after first login.**
- Demo users (password `Demo@12345`): `student@demo.gu`, `student2@demo.gu`, `alumni@demo.gu`,
  `faculty@demo.gu`, `employer@demo.gu`, `parent@demo.gu`, `staff@demo.gu`. Run the seed with
  `SEED_DEMO=false` to skip demo users and sample responses.

## Deploying (e.g. Vercel)

SQLite files do not persist on serverless hosts. For production:

1. Create a PostgreSQL database (Vercel Postgres, Neon, Supabase…).
2. In `prisma/schema.prisma` change `provider = "sqlite"` to `provider = "postgresql"`.
3. Set `DATABASE_URL` and `AUTH_SECRET` environment variables.
4. Run `npx prisma db push && SEED_DEMO=false npm run db:seed` once against the production DB.
