import { NextRequest, NextResponse } from 'next/server';
import { eq, ilike, and, gte, lte, desc, asc, count, SQL } from 'drizzle-orm';
import { db } from '@/db';
import { salaries } from '@/db/schema';
import { submitSalarySchema, filtersSchema } from '@/lib/validators';
import { slugify, normalizeJobTitle } from '@/lib/utils';
import { getSubmitLimiter } from '@/lib/rate-limit';
import crypto from 'crypto';

// ─── helpers ────────────────────────────────────────────────────────────────

function buildWhere(data: ReturnType<typeof filtersSchema.parse>) {
  const conditions: SQL[] = [eq(salaries.isHidden, false)];

  if (data.search)
    conditions.push(ilike(salaries.jobTitleNormalized, `%${data.search.toLowerCase()}%`));
  if (data.industry)
    conditions.push(eq(salaries.industry, data.industry));
  if (data.city)
    conditions.push(eq(salaries.city, data.city));
  if (data.companySize && data.companySize !== 'all')
    conditions.push(eq(salaries.companySize, data.companySize));
  if (data.experience && data.experience !== 'all') {
    const EXP: Record<string, [number, number]> = {
      '0-2': [0, 2], '3-5': [3, 5], '6-10': [6, 10], '10+': [10, 100],
    };
    const [lo, hi] = EXP[data.experience] ?? [0, 100];
    conditions.push(gte(salaries.yearsExperience, lo));
    conditions.push(lte(salaries.yearsExperience, hi));
  }

  return and(...conditions);
}

// ─── GET /api/salaries ───────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  try {
    const parsed = filtersSchema.safeParse(
      Object.fromEntries(req.nextUrl.searchParams)
    );
    if (!parsed.success)
      return NextResponse.json({ error: 'Invalid query params' }, { status: 400 });

    const { sortBy, page, limit } = parsed.data;
    const where = buildWhere(parsed.data);

    const [{ total }] = await db
      .select({ total: count() })
      .from(salaries)
      .where(where);

    const orderBy =
      sortBy === 'salary_desc' ? desc(salaries.monthlySalaryEGP)
      : sortBy === 'salary_asc' ? asc(salaries.monthlySalaryEGP)
      : desc(salaries.submittedAt);

    const rows = await db
      .select({
        id: salaries.id,
        jobTitle: salaries.jobTitle,
        jobSlug: salaries.jobSlug,
        industry: salaries.industry,
        companySize: salaries.companySize,
        monthlySalaryEGP: salaries.monthlySalaryEGP,
        yearsExperience: salaries.yearsExperience,
        city: salaries.city,
        hasBonus: salaries.hasBonus,
        hasMedicalInsurance: salaries.hasMedicalInsurance,
        submittedAt: salaries.submittedAt,
      })
      .from(salaries)
      .where(where)
      .orderBy(orderBy)
      .limit(limit)
      .offset((page - 1) * limit);

    return NextResponse.json({
      data: rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error('[GET /api/salaries]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// ─── POST /api/salaries ──────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    // Rate limiting (optional – skipped if Upstash not configured)
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? '127.0.0.1';

    const limiter = getSubmitLimiter();
    if (limiter) {
      const { success, reset } = await limiter.limit(ip);
      if (!success) {
        const hoursLeft = Math.ceil((reset - Date.now()) / 3_600_000);
        return NextResponse.json(
          { error: `Rate limit exceeded. Try again in ${hoursLeft}h.` },
          { status: 429 }
        );
      }
    }

    const body = await req.json();
    const parsed = submitSalarySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', issues: parsed.error.issues },
        { status: 400 }
      );
    }

    // honeypot check (schema already enforces max(0), but double-check)
    if (parsed.data.honeypot !== '') {
      // silent reject for bots
      return NextResponse.json({ success: true }, { status: 201 });
    }

    const { honeypot: _hp, ...data } = parsed.data;

    const ua = req.headers.get('user-agent') ?? '';
    const fingerprintHash = crypto
      .createHash('sha256')
      .update(`${ip}:${ua}`)
      .digest('hex');

    await db.insert(salaries).values({
      ...data,
      jobTitleNormalized: normalizeJobTitle(data.jobTitle),
      jobSlug: slugify(data.jobTitle),
      fingerprintHash,
    });

    return NextResponse.json(
      { success: true, message: 'Salary submitted anonymously' },
      { status: 201 }
    );
  } catch (err) {
    console.error('[POST /api/salaries]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
