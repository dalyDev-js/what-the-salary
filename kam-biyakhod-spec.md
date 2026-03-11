# Kam Biyakhod? (كام بياخد؟) — Full Project Specification

## Overview

Anonymous salary sharing and comparison platform for the Egyptian job market. Users submit their salaries anonymously and explore aggregated salary data filtered by job title, industry, city, experience, and company size.

**Target Audience:** Egyptian professionals, job seekers, fresh graduates, HR departments, recruiters.

**Core Value Proposition:** "Know your worth. Share anonymously. Help others negotiate better."

---

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Framework | Next.js 15 (App Router) | SSR, API routes, RSC, latest React features |
| UI | shadcn/ui + Tailwind CSS 4 | Polished components, customizable, accessible |
| Database | Neon (Serverless Postgres) | Free tier, serverless, fast cold starts |
| ORM | Drizzle ORM | Type-safe, lightweight, better serverless perf than Prisma |
| Data Fetching | TanStack React Query v5 | Caching, optimistic updates, infinite queries |
| HTTP Client | Axios (configured instance) | Interceptors, base URL config, error handling |
| Charts | Recharts | Lightweight, composable, shadcn-compatible |
| Deployment | Vercel | Zero-config Next.js hosting, free tier |
| Language | TypeScript (strict mode) | End-to-end type safety |
| Validation | Zod | Schema validation shared between client & server |
| i18n | next-intl | Bilingual Arabic/English with RTL support |
| Rate Limiting | upstash/ratelimit + Upstash Redis | Serverless-compatible spam protection |
| OG Images | next/og (Satori) | Dynamic social sharing cards |
| Analytics | Vercel Analytics (free) | Basic traffic tracking |

---

## Project Structure

```
kam-biyakhod/
├── src/
│   ├── app/
│   │   ├── [locale]/                    # i18n dynamic segment
│   │   │   ├── layout.tsx               # Root layout with providers, RTL support
│   │   │   ├── page.tsx                 # Home/Explore page (SSR)
│   │   │   ├── submit/
│   │   │   │   └── page.tsx             # Submit salary form
│   │   │   ├── job/
│   │   │   │   └── [slug]/
│   │   │   │       └── page.tsx         # Individual job detail page (SSR)
│   │   │   └── admin/
│   │   │       └── page.tsx             # Admin moderation (Phase 2)
│   │   ├── api/
│   │   │   ├── salaries/
│   │   │   │   ├── route.ts             # GET (list/filter) + POST (submit)
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts         # GET single, PATCH (admin moderate)
│   │   │   ├── stats/
│   │   │   │   └── route.ts             # GET aggregated statistics
│   │   │   ├── jobs/
│   │   │   │   └── route.ts             # GET unique job titles with stats
│   │   │   └── og/
│   │   │       └── route.tsx            # Dynamic OG image generation (Phase 2)
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/                          # shadcn components
│   │   ├── salary/
│   │   │   ├── submit-form.tsx          # Salary submission form
│   │   │   ├── explore-filters.tsx      # Search + filter controls
│   │   │   ├── salary-card.tsx          # Single job salary display card
│   │   │   ├── salary-range-bar.tsx     # Visual min/median/max bar
│   │   │   ├── salary-chart.tsx         # Recharts salary distribution
│   │   │   └── stats-overview.tsx       # Top-level KPI cards
│   │   ├── layout/
│   │   │   ├── header.tsx               # Navigation + language toggle
│   │   │   ├── footer.tsx
│   │   │   └── mobile-nav.tsx
│   │   └── shared/
│   │       ├── locale-toggle.tsx        # AR/EN switcher
│   │       ├── theme-toggle.tsx         # Dark mode (Phase 2)
│   │       ├── share-button.tsx         # Native share / copy link
│   │       └── empty-state.tsx
│   ├── db/
│   │   ├── index.ts                     # Drizzle client + Neon connection
│   │   ├── schema.ts                    # Drizzle table definitions
│   │   └── seed.ts                      # Seed script with initial data
│   ├── lib/
│   │   ├── axios.ts                     # Configured axios instance
│   │   ├── validators.ts               # Zod schemas (shared client/server)
│   │   ├── utils.ts                     # Helpers (formatSalary, slugify, etc.)
│   │   ├── constants.ts                # Industries, cities, experience ranges
│   │   └── rate-limit.ts               # Upstash rate limiter config
│   ├── hooks/
│   │   ├── use-salaries.ts             # React Query hook for salary data
│   │   ├── use-stats.ts                # React Query hook for aggregated stats
│   │   └── use-submit-salary.ts        # React Query mutation with optimistic update
│   ├── types/
│   │   └── index.ts                     # Shared TypeScript types
│   └── messages/
│       ├── en.json                      # English translations
│       └── ar.json                      # Arabic translations
├── drizzle/
│   └── migrations/                      # Auto-generated migrations
├── drizzle.config.ts
├── next.config.ts
├── tailwind.config.ts
├── middleware.ts                         # i18n locale detection + routing
└── .env.local                           # DATABASE_URL, ADMIN_SECRET
```

---

## Database Schema (Drizzle)

```typescript
// src/db/schema.ts
import { pgTable, serial, text, integer, timestamp, boolean, varchar, index } from 'drizzle-orm/pg-core';

export const salaries = pgTable('salaries', {
  id: serial('id').primaryKey(),

  // Job info
  jobTitle: varchar('job_title', { length: 150 }).notNull(),
  jobTitleNormalized: varchar('job_title_normalized', { length: 150 }).notNull(), // lowercase, trimmed for grouping
  jobSlug: varchar('job_slug', { length: 150 }).notNull(), // URL-friendly slug

  // Company info (anonymous - no company name)
  industry: varchar('industry', { length: 50 }).notNull(),
  companySize: varchar('company_size', { length: 30 }).notNull(), // 'startup' | 'mid' | 'large'
  companyType: varchar('company_type', { length: 30 }), // 'local' | 'multinational' | 'government' | 'ngo'

  // Compensation
  monthlySalaryEGP: integer('monthly_salary_egp').notNull(),
  hasBonus: boolean('has_bonus').default(false),
  hasMedicalInsurance: boolean('has_medical_insurance').default(false),

  // Demographics
  yearsExperience: integer('years_experience').notNull(),
  city: varchar('city', { length: 50 }).notNull(),
  gender: varchar('gender', { length: 20 }), // 'male' | 'female' | 'other' | null

  // Education level
  education: varchar('education', { length: 30 }), // 'high_school' | 'bachelors' | 'masters' | 'phd'

  // Metadata
  isVerified: boolean('is_verified').default(false), // admin moderation
  isHidden: boolean('is_hidden').default(false),     // spam/abuse flag
  submittedAt: timestamp('submitted_at').defaultNow().notNull(),

  // Spam protection
  fingerprintHash: varchar('fingerprint_hash', { length: 64 }), // hashed browser fingerprint to limit duplicates
}, (table) => ({
  // Indexes for common queries
  jobTitleIdx: index('job_title_idx').on(table.jobTitleNormalized),
  industryIdx: index('industry_idx').on(table.industry),
  cityIdx: index('city_idx').on(table.city),
  salaryIdx: index('salary_idx').on(table.monthlySalaryEGP),
  submittedIdx: index('submitted_idx').on(table.submittedAt),
  slugIdx: index('slug_idx').on(table.jobSlug),
}));

// Type exports
export type Salary = typeof salaries.$inferSelect;
export type NewSalary = typeof salaries.$inferInsert;
```

---

## API Routes Specification

### `GET /api/salaries`

Returns filtered, paginated salary entries.

**Query Parameters:**
```
?search=software+engineer     # Full-text search on job title
&industry=Tech                # Filter by industry
&city=Cairo                   # Filter by city
&experience=3-5               # Experience range: '0-2' | '3-5' | '6-10' | '10+'
&companySize=startup          # 'startup' | 'mid' | 'large'
&sortBy=salary_desc           # 'salary_desc' | 'salary_asc' | 'recent'
&page=1                       # Pagination
&limit=20                     # Per page (max 50)
```

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "jobTitle": "Software Engineer",
      "jobSlug": "software-engineer",
      "industry": "Tech",
      "companySize": "startup",
      "monthlySalaryEGP": 18000,
      "yearsExperience": 2,
      "city": "Cairo",
      "submittedAt": "2026-03-10T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 142,
    "totalPages": 8
  }
}
```

### `POST /api/salaries`

Submit a new anonymous salary entry.

**Rate Limit:** 3 submissions per IP per 24 hours.

**Request Body (validated with Zod):**
```json
{
  "jobTitle": "Software Engineer",
  "industry": "Tech",
  "companySize": "startup",
  "companyType": "multinational",
  "monthlySalaryEGP": 18000,
  "hasBonus": true,
  "hasMedicalInsurance": true,
  "yearsExperience": 2,
  "city": "Cairo",
  "gender": "male",
  "education": "bachelors",
  "honeypot": ""
}
```

**Validation Rules (Zod):**
```typescript
// src/lib/validators.ts
import { z } from 'zod';

export const submitSalarySchema = z.object({
  jobTitle: z.string().min(2).max(150).trim(),
  industry: z.enum(INDUSTRIES),
  companySize: z.enum(['startup', 'mid', 'large']),
  companyType: z.enum(['local', 'multinational', 'government', 'ngo']).optional(),
  monthlySalaryEGP: z.number().int().min(1000).max(500000),
  hasBonus: z.boolean().optional().default(false),
  hasMedicalInsurance: z.boolean().optional().default(false),
  yearsExperience: z.number().int().min(0).max(40),
  city: z.enum(CITIES),
  gender: z.enum(['male', 'female', 'other']).optional(),
  education: z.enum(['high_school', 'bachelors', 'masters', 'phd']).optional(),
  honeypot: z.string().max(0), // spam trap — must be empty
});
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Salary submitted anonymously"
}
```

### `GET /api/stats`

Returns aggregated statistics for the dashboard.

**Query Parameters:** Same filters as `/api/salaries`

**Response:**
```json
{
  "totalEntries": 1420,
  "averageSalary": 18500,
  "medianSalary": 15000,
  "uniqueJobTitles": 87,
  "topIndustries": [
    { "industry": "Tech", "count": 342, "avgSalary": 28000 },
    { "industry": "Finance", "count": 198, "avgSalary": 22000 }
  ],
  "salaryDistribution": [
    { "range": "0-5K", "count": 45 },
    { "range": "5-10K", "count": 189 },
    { "range": "10-20K", "count": 412 },
    { "range": "20-35K", "count": 298 },
    { "range": "35-50K", "count": 156 },
    { "range": "50K+", "count": 78 }
  ]
}
```

### `GET /api/jobs`

Returns unique job titles with aggregated salary stats (for explore page cards).

**Query Parameters:** Same filters as `/api/salaries`

**Response:**
```json
{
  "data": [
    {
      "jobTitle": "Software Engineer",
      "jobSlug": "software-engineer",
      "count": 24,
      "minSalary": 8000,
      "maxSalary": 65000,
      "avgSalary": 32000,
      "medianSalary": 28000,
      "industries": ["Tech", "Finance", "Telecom"],
      "cities": ["Cairo", "Giza", "Alexandria"]
    }
  ]
}
```

### `GET /api/salaries/[id]` — Individual entry (minimal, for detail enrichment)

### `GET /api/og?title=Software+Engineer&min=8000&max=65000&avg=32000` — OG Image (Phase 2)

---

## Zod Validators (shared client/server)

```typescript
// src/lib/validators.ts
import { z } from 'zod';
import { INDUSTRIES, CITIES } from './constants';

export const submitSalarySchema = z.object({
  jobTitle: z.string()
    .min(2, 'Job title is too short')
    .max(150, 'Job title is too long')
    .trim()
    .transform(val => val.replace(/\s+/g, ' ')), // normalize whitespace
  industry: z.enum(INDUSTRIES as [string, ...string[]]),
  companySize: z.enum(['startup', 'mid', 'large']),
  companyType: z.enum(['local', 'multinational', 'government', 'ngo']).optional(),
  monthlySalaryEGP: z.coerce
    .number()
    .int('Salary must be a whole number')
    .min(1000, 'Minimum salary is 1,000 EGP')
    .max(500000, 'Maximum salary is 500,000 EGP'),
  hasBonus: z.boolean().optional().default(false),
  hasMedicalInsurance: z.boolean().optional().default(false),
  yearsExperience: z.coerce
    .number()
    .int()
    .min(0, 'Experience cannot be negative')
    .max(40, 'Maximum 40 years'),
  city: z.enum(CITIES as [string, ...string[]]),
  gender: z.enum(['male', 'female', 'other']).optional(),
  education: z.enum(['high_school', 'bachelors', 'masters', 'phd']).optional(),
  honeypot: z.string().max(0, 'Bot detected'),
});

export const filtersSchema = z.object({
  search: z.string().max(100).optional(),
  industry: z.string().optional(),
  city: z.string().optional(),
  experience: z.enum(['all', '0-2', '3-5', '6-10', '10+']).optional(),
  companySize: z.enum(['all', 'startup', 'mid', 'large']).optional(),
  sortBy: z.enum(['salary_desc', 'salary_asc', 'recent']).optional().default('recent'),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(50).optional().default(20),
});

export type SubmitSalaryInput = z.infer<typeof submitSalarySchema>;
export type FiltersInput = z.infer<typeof filtersSchema>;
```

---

## Constants

```typescript
// src/lib/constants.ts
export const INDUSTRIES = [
  'Tech', 'Finance', 'Healthcare', 'Marketing', 'Construction',
  'Creative', 'Education', 'Retail', 'FMCG', 'Telecom',
  'HR', 'Legal', 'Manufacturing', 'Real Estate', 'Oil & Gas',
  'Logistics', 'Hospitality', 'Government', 'NGO', 'Other'
] as const;

export const CITIES = [
  'Cairo', 'Giza', 'Alexandria', '6th October', 'New Capital',
  'Sheikh Zayed', 'New Cairo', '10th of Ramadan', 'Mansoura',
  'Tanta', 'Ismailia', 'Port Said', 'Aswan', 'Luxor',
  'Hurghada', 'Sharm El Sheikh', 'Other'
] as const;

export const COMPANY_SIZES = [
  { value: 'startup', label: 'Startup (1-50)', labelAr: 'شركة ناشئة (١-٥٠)' },
  { value: 'mid', label: 'Mid-size (51-200)', labelAr: 'متوسطة (٥١-٢٠٠)' },
  { value: 'large', label: 'Large (200+)', labelAr: 'كبيرة (+٢٠٠)' },
] as const;

export const EXPERIENCE_RANGES = [
  { value: 'all', label: 'All', labelAr: 'الكل' },
  { value: '0-2', label: '0-2 years', labelAr: '٠-٢ سنين' },
  { value: '3-5', label: '3-5 years', labelAr: '٣-٥ سنين' },
  { value: '6-10', label: '6-10 years', labelAr: '٦-١٠ سنين' },
  { value: '10+', label: '10+ years', labelAr: '+١٠ سنين' },
] as const;

export const SALARY_RANGES = [
  { min: 0, max: 5000, label: '0-5K' },
  { min: 5000, max: 10000, label: '5-10K' },
  { min: 10000, max: 20000, label: '10-20K' },
  { min: 20000, max: 35000, label: '20-35K' },
  { min: 35000, max: 50000, label: '35-50K' },
  { min: 50000, max: Infinity, label: '50K+' },
] as const;
```

---

## Axios Instance

```typescript
// src/lib/axios.ts
import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.error || 'Something went wrong';
    // You can integrate with a toast library here
    console.error(`[API Error] ${error.response?.status}: ${message}`);
    return Promise.reject(error);
  }
);

export default api;
```

---

## React Query Hooks

```typescript
// src/hooks/use-salaries.ts
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import api from '@/lib/axios';
import type { FiltersInput } from '@/lib/validators';

export function useJobsWithStats(filters: FiltersInput) {
  return useQuery({
    queryKey: ['jobs', filters],
    queryFn: async () => {
      const { data } = await api.get('/jobs', { params: filters });
      return data;
    },
    placeholderData: keepPreviousData, // keep old data while new filters load
    staleTime: 1000 * 60 * 5, // 5 min cache
  });
}

export function useSalariesByJob(slug: string, filters?: Partial<FiltersInput>) {
  return useQuery({
    queryKey: ['salaries', slug, filters],
    queryFn: async () => {
      const { data } = await api.get('/salaries', {
        params: { ...filters, search: slug }
      });
      return data;
    },
    staleTime: 1000 * 60 * 5,
  });
}
```

```typescript
// src/hooks/use-submit-salary.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import type { SubmitSalaryInput } from '@/lib/validators';

export function useSubmitSalary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: SubmitSalaryInput) => {
      const { data } = await api.post('/salaries', input);
      return data;
    },
    onSuccess: () => {
      // Invalidate all salary-related queries to refetch fresh data
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['salaries'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
  });
}
```

```typescript
// src/hooks/use-stats.ts
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';

export function useStats(filters?: Record<string, string>) {
  return useQuery({
    queryKey: ['stats', filters],
    queryFn: async () => {
      const { data } = await api.get('/stats', { params: filters });
      return data;
    },
    staleTime: 1000 * 60 * 10, // 10 min — stats don't change fast
  });
}
```

---

## Key Pages Specification

### 1. Home / Explore Page (`/[locale]/page.tsx`)

**Server Component** — fetches initial data via RSC for SEO.

**Layout:**
- Hero section with stats (total entries, avg salary, contribution count)
- Search bar (full-text search on job titles, supports Arabic)
- Filter row: Industry, City, Experience, Company Size (shadcn Select components)
- Results: List of job title cards, each showing:
  - Job title (EN + AR)
  - Salary range bar (visual min → median → max)
  - Average & median salary
  - Number of entries
  - Industry & city tags
- Sticky CTA banner at bottom: "Share your salary anonymously"

**React Features:**
- `Suspense` boundary around the results list with skeleton loader
- URL search params for filters (shareable filtered URLs)
- `useOptimistic` for instant filter feedback
- `useTransition` for non-blocking filter changes
- Infinite scroll OR pagination (your choice — pagination is simpler for MVP)

### 2. Submit Page (`/[locale]/submit/page.tsx`)

**Client Component** — interactive form.

**Layout:**
- Privacy badge prominently displayed: "100% Anonymous — no name, no email, no tracking"
- Multi-step form OR single scrollable form:
  - Step 1: Job Title + Industry + Company Size + Company Type
  - Step 2: Monthly Salary + Bonus + Medical Insurance
  - Step 3: Experience + City + Gender (optional) + Education (optional)
- Hidden honeypot field for spam
- Submit button with loading state
- Success state: confetti/celebration + "Share to help others" CTA

**React Features:**
- `useActionState` for form submission (Next.js Server Action compatible)
- `useOptimistic` — show the new entry in explore immediately before server confirms
- Zod validation on client AND server
- Rate limit feedback ("You can submit again in X hours")

### 3. Job Detail Page (`/[locale]/job/[slug]/page.tsx`)

**Server Component** with client interactive parts.

**Layout:**
- Job title hero with total entries count
- Key stats: min, max, avg, median salary
- Salary distribution chart (Recharts BarChart)
- Breakdown by:
  - Experience level (bar chart)
  - City (horizontal bars)
  - Company size (comparison cards)
- Individual salary entries list (anonymized, showing salary + experience + industry + city)
- Share button (generates OG card in Phase 2)
- Related job titles section

**Dynamic OG Metadata:**
```typescript
export async function generateMetadata({ params }): Promise<Metadata> {
  const job = await getJobBySlug(params.slug);
  return {
    title: `${job.title} Salary in Egypt — Kam Biyakhod?`,
    description: `${job.title} earns ${formatSalary(job.min)}-${formatSalary(job.max)} EGP/month in Egypt. ${job.count} anonymous salaries shared.`,
    openGraph: {
      images: [`/api/og?title=${job.title}&min=${job.min}&max=${job.max}&avg=${job.avg}`],
    },
  };
}
```

---

## Bilingual / i18n Setup

**Middleware** handles locale detection and routing:
```typescript
// middleware.ts
import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  locales: ['en', 'ar'],
  defaultLocale: 'en',
  localeDetection: true,
});

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};
```

**RTL Handling:**
```typescript
// src/app/[locale]/layout.tsx
export default function RootLayout({ children, params: { locale } }) {
  const isRTL = locale === 'ar';

  return (
    <html lang={locale} dir={isRTL ? 'rtl' : 'ltr'}>
      <body className={isRTL ? 'font-arabic' : 'font-sans'}>
        {children}
      </body>
    </html>
  );
}
```

**Tailwind RTL:** Use Tailwind's `rtl:` modifier for layout flips:
```html
<div className="ml-4 rtl:ml-0 rtl:mr-4">
```

**Translation files keep it simple — just key strings:**
```json
// messages/en.json
{
  "hero": {
    "title": "Know Your Worth",
    "subtitle": "Anonymous salary data from real Egyptian professionals",
    "cta": "Share Your Salary"
  },
  "filters": {
    "search": "Search job title...",
    "industry": "Industry",
    "city": "City",
    "experience": "Experience",
    "companySize": "Company Size"
  },
  "submit": {
    "title": "Share Your Salary Anonymously",
    "privacy": "100% Anonymous. No name, no email, no tracking.",
    "button": "Submit Anonymously",
    "success": "Thank you! You're helping thousands negotiate better."
  },
  "salary": {
    "avg": "Average",
    "median": "Median",
    "min": "Min",
    "max": "Max",
    "perMonth": "EGP/month",
    "entries": "salaries"
  }
}
```

```json
// messages/ar.json
{
  "hero": {
    "title": "اعرف قيمتك",
    "subtitle": "بيانات مرتبات حقيقية من محترفين مصريين",
    "cta": "شارك مرتبك"
  },
  "filters": {
    "search": "ابحث عن وظيفة...",
    "industry": "المجال",
    "city": "المدينة",
    "experience": "الخبرة",
    "companySize": "حجم الشركة"
  },
  "submit": {
    "title": "شارك مرتبك بسرية تامة",
    "privacy": "بياناتك مجهولة تماماً. لا اسم، لا إيميل، لا تتبع.",
    "button": "أرسل بسرية",
    "success": "!شكراً! أنت بتساعد آلاف الناس يتفاوضوا أحسن"
  },
  "salary": {
    "avg": "المتوسط",
    "median": "الوسيط",
    "min": "الأقل",
    "max": "الأعلى",
    "perMonth": "جنيه/شهر",
    "entries": "مرتب"
  }
}
```

---

## Anti-Spam Strategy

**Layer 1: Honeypot Field**
Hidden form field that bots fill but humans don't. If filled → reject silently.

**Layer 2: Rate Limiting (Upstash)**
```typescript
// src/lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

export const submitLimiter = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(3, '24 h'), // 3 submissions per 24h per IP
  analytics: true,
});
```

**Layer 3: Salary Sanity Checks**
Reject entries where salary is clearly fake:
- Below 1,000 EGP (below minimum wage)
- Above 500,000 EGP (unrealistic for Egypt)
- Mismatch: 0 experience + 100K salary → flag for review

**Layer 4: Browser Fingerprint Hash**
Generate a hash from browser properties (screen size, timezone, language). Store hashed — not the raw fingerprint. Use to detect duplicate submissions from same browser.

**Layer 5: Admin Moderation (Phase 2)**
Simple admin page behind `ADMIN_SECRET` env var. Shows flagged entries, allows hide/verify.

---

## Seed Data Strategy

Create a seed script that generates 100-200 realistic entries:

```typescript
// src/db/seed.ts
// Run with: npx tsx src/db/seed.ts

const SEED_JOBS = [
  { title: 'Software Engineer', titleAr: 'مهندس برمجيات', industry: 'Tech', salaryRange: [8000, 65000] },
  { title: 'Accountant', titleAr: 'محاسب', industry: 'Finance', salaryRange: [5000, 25000] },
  { title: 'Graphic Designer', titleAr: 'مصمم جرافيك', industry: 'Creative', salaryRange: [4000, 22000] },
  { title: 'Pharmacist', titleAr: 'صيدلي', industry: 'Healthcare', salaryRange: [5000, 20000] },
  { title: 'Marketing Manager', titleAr: 'مدير تسويق', industry: 'Marketing', salaryRange: [10000, 50000] },
  { title: 'Civil Engineer', titleAr: 'مهندس مدني', industry: 'Construction', salaryRange: [6000, 30000] },
  { title: 'Doctor', titleAr: 'دكتور', industry: 'Healthcare', salaryRange: [8000, 60000] },
  { title: 'Sales Executive', titleAr: 'مسؤول مبيعات', industry: 'Retail', salaryRange: [4000, 20000] },
  { title: 'Data Analyst', titleAr: 'محلل بيانات', industry: 'Tech', salaryRange: [8000, 35000] },
  { title: 'Teacher', titleAr: 'مدرس', industry: 'Education', salaryRange: [3000, 15000] },
  { title: 'HR Specialist', titleAr: 'أخصائي موارد بشرية', industry: 'HR', salaryRange: [5000, 20000] },
  { title: 'Product Manager', titleAr: 'مدير منتجات', industry: 'Tech', salaryRange: [15000, 70000] },
  { title: 'UI/UX Designer', titleAr: 'مصمم واجهات', industry: 'Tech', salaryRange: [7000, 35000] },
  { title: 'DevOps Engineer', titleAr: 'مهندس DevOps', industry: 'Tech', salaryRange: [12000, 55000] },
  { title: 'Customer Service', titleAr: 'خدمة عملاء', industry: 'Telecom', salaryRange: [3500, 10000] },
  { title: 'Lawyer', titleAr: 'محامي', industry: 'Legal', salaryRange: [6000, 40000] },
  { title: 'Content Writer', titleAr: 'كاتب محتوى', industry: 'Marketing', salaryRange: [4000, 15000] },
  { title: 'Mechanical Engineer', titleAr: 'مهندس ميكانيكا', industry: 'Manufacturing', salaryRange: [5000, 25000] },
  { title: 'Dentist', titleAr: 'طبيب أسنان', industry: 'Healthcare', salaryRange: [7000, 35000] },
  { title: 'Project Manager', titleAr: 'مدير مشروعات', industry: 'Construction', salaryRange: [12000, 45000] },
];

// For each job, generate 5-15 entries with realistic salary distribution
// Salary correlates with experience (add ~15% per year of experience)
// City affects salary (Cairo/New Cairo = higher, other cities = 15-25% lower)
// Company size affects salary (large = higher, startup = variable)
```

---

## Environment Variables

```bash
# .env.local

# Neon Database
DATABASE_URL="postgresql://user:pass@ep-xxx.region.neon.tech/kambiyakhod?sslmode=require"

# Upstash Redis (for rate limiting)
UPSTASH_REDIS_REST_URL="https://xxx.upstash.io"
UPSTASH_REDIS_REST_TOKEN="xxx"

# Admin
ADMIN_SECRET="your-secret-for-admin-access"

# App
NEXT_PUBLIC_APP_URL="https://kambiyakhod.com"
```

---

## SEO & Metadata

```typescript
// src/app/[locale]/layout.tsx
export const metadata: Metadata = {
  title: {
    default: 'Kam Biyakhod? — كام بياخد؟ | Egypt Salary Explorer',
    template: '%s | Kam Biyakhod?',
  },
  description: 'Discover real, anonymous salaries in Egypt. Compare salaries by job title, industry, city, and experience. Share yours anonymously.',
  keywords: ['egypt salaries', 'salary egypt', 'مرتبات مصر', 'كام بياخد', 'salary comparison egypt'],
  openGraph: {
    type: 'website',
    locale: 'en_EG',
    alternateLocale: 'ar_EG',
    siteName: 'Kam Biyakhod?',
  },
  twitter: {
    card: 'summary_large_image',
  },
  robots: {
    index: true,
    follow: true,
  },
};
```

---

## Commands Reference

```bash
# Setup
npx create-next-app@latest kam-biyakhod --typescript --tailwind --eslint --app --src-dir
npx shadcn@latest init
npm install drizzle-orm @neondatabase/serverless
npm install -D drizzle-kit
npm install @tanstack/react-query axios zod next-intl recharts
npm install @upstash/ratelimit @upstash/redis

# shadcn components to install:
npx shadcn@latest add button input select card badge separator skeleton sheet dialog toast tabs

# Database
npx drizzle-kit generate   # generate migration
npx drizzle-kit push        # push schema to Neon (dev)
npx drizzle-kit migrate     # run migrations (prod)
npx tsx src/db/seed.ts      # seed initial data

# Dev
npm run dev

# Deploy
vercel --prod
```

---

## 2-Week Sprint Plan

### Week 1: Core

| Day | Task |
|-----|------|
| 1 | Project setup: Next.js + Drizzle + Neon + shadcn + Tailwind. Schema + migrations. Seed script. |
| 2 | API routes: GET /salaries, GET /jobs, GET /stats, POST /salaries with Zod validation |
| 3 | Explore page: search + filters + job cards with salary bars. React Query integration. |
| 4 | Submit page: form with validation, honeypot, rate limiting, success state |
| 5 | Job detail page: stats, charts (Recharts), individual entries list |
| 6 | i18n: next-intl setup, AR/EN translations, RTL layout, locale toggle |
| 7 | Polish: loading states (Suspense + skeletons), error boundaries, responsive design |

### Week 2: Launch

| Day | Task |
|-----|------|
| 8 | Deploy to Vercel. Domain setup. SEO metadata. Test everything on mobile. |
| 9 | Seed 100+ entries. Test with 5 friends. Fix bugs. |
| 10 | Write launch posts for LinkedIn, Twitter, Facebook dev groups. Prepare screenshots. |
| 11 | LAUNCH. Post everywhere. Share in Egyptian tech communities. |
| 12-14 | Monitor, fix bugs, respond to feedback, watch data come in |

### Post-Launch (Week 3-4)

- OG image generation for social sharing
- Dark mode
- Admin moderation dashboard
- Advanced charts on job detail page
- Google Analytics or Plausible
- Sitemap + structured data for Google

---

## Viral Growth Tactics

1. **Shareable salary cards:** Each job page generates a social card image showing the salary range. People screenshot and share these.

2. **"Is your salary fair?" widget:** After viewing data, show: "Based on your role and experience, you're in the top/bottom X%". This creates personal attachment and sharing.

3. **Weekly salary insights on social media:** Post weekly stats like "Top 5 highest paying jobs in Egypt this week" with a link back to the platform. This is free content marketing.

4. **WhatsApp sharing:** Add a "Share on WhatsApp" button. Egyptians share everything on WhatsApp. The message should be pre-formatted: "اكتشفت إن متوسط مرتب [Job Title] في مصر [Salary] — شوف الباقي هنا: [link]"

5. **Embed widget:** Let blogs and news sites embed a salary lookup widget. Free distribution.

---

*This spec is your blueprint. Don't overthink it. Don't add features not in this doc. Ship in 2 weeks, then iterate based on real user feedback. Good luck!*
