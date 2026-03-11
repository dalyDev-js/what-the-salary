import { NextRequest, NextResponse } from 'next/server';
import {
  eq, ilike, and, gte, lte, desc, asc,
  count, avg, min, max, SQL,
} from 'drizzle-orm';
import { db } from '@/db';
import { salaries } from '@/db/schema';
import { filtersSchema } from '@/lib/validators';

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

// ─── GET /api/jobs ───────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  try {
    const parsed = filtersSchema.safeParse(
      Object.fromEntries(req.nextUrl.searchParams)
    );
    if (!parsed.success)
      return NextResponse.json({ error: 'Invalid params' }, { status: 400 });

    const { sortBy, page, limit } = parsed.data;

    // Allow exact slug lookup (used by job detail page)
    const slugParam = req.nextUrl.searchParams.get('slug');

    const where = slugParam
      ? and(eq(salaries.isHidden, false), eq(salaries.jobSlug, slugParam))
      : buildWhere(parsed.data);

    // Step 1 – aggregate per job slug
    const avgCol = avg(salaries.monthlySalaryEGP);
    const cntCol = count();

    const orderBy =
      sortBy === 'salary_desc' ? desc(avgCol)
      : sortBy === 'salary_asc' ? asc(avgCol)
      : desc(cntCol);

    const jobGroups = await db
      .select({
        jobTitle: salaries.jobTitle,
        jobSlug: salaries.jobSlug,
        count: cntCol,
        minSalary: min(salaries.monthlySalaryEGP),
        maxSalary: max(salaries.monthlySalaryEGP),
        avgSalary: avgCol,
      })
      .from(salaries)
      .where(where)
      .groupBy(salaries.jobSlug, salaries.jobTitle)
      .orderBy(orderBy)
      .limit(limit)
      .offset((page - 1) * limit);

    if (jobGroups.length === 0) {
      return NextResponse.json({ data: [] });
    }

    // Step 2 – single query to get all entries for those job slugs
    const slugs = jobGroups.map(j => j.jobSlug);

    const details = await db
      .select({
        jobSlug: salaries.jobSlug,
        monthlySalaryEGP: salaries.monthlySalaryEGP,
        industry: salaries.industry,
        city: salaries.city,
      })
      .from(salaries)
      .where(
        and(
          eq(salaries.isHidden, false),
          // filter to only the slugs we need
          // Drizzle doesn't have inArray for strings easily,
          // so we fetch them and filter in JS
        )
      );

    // Group detail rows by slug
    const detailsBySlug = new Map<
      string,
      { salaries: number[]; industries: Set<string>; cities: Set<string> }
    >();

    for (const row of details) {
      if (!slugs.includes(row.jobSlug)) continue;
      if (!detailsBySlug.has(row.jobSlug)) {
        detailsBySlug.set(row.jobSlug, {
          salaries: [],
          industries: new Set(),
          cities: new Set(),
        });
      }
      const entry = detailsBySlug.get(row.jobSlug)!;
      entry.salaries.push(row.monthlySalaryEGP);
      entry.industries.add(row.industry);
      entry.cities.add(row.city);
    }

    // Step 3 – build response
    const data = jobGroups.map(job => {
      const detail = detailsBySlug.get(job.jobSlug);
      const sorted = (detail?.salaries ?? []).sort((a, b) => a - b);
      const median =
        sorted.length > 0 ? sorted[Math.floor(sorted.length / 2)] : 0;

      return {
        jobTitle: job.jobTitle,
        jobSlug: job.jobSlug,
        count: job.count,
        minSalary: job.minSalary ?? 0,
        maxSalary: job.maxSalary ?? 0,
        avgSalary: Math.round(Number(job.avgSalary) || 0),
        medianSalary: median,
        industries: detail ? [...detail.industries].slice(0, 3) : [],
        cities: detail ? [...detail.cities].slice(0, 3) : [],
      };
    });

    return NextResponse.json({ data });
  } catch (err) {
    console.error('[GET /api/jobs]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
