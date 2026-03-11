import { NextRequest, NextResponse } from 'next/server';
import { eq, ilike, and, gte, lte, desc, count, avg, SQL } from 'drizzle-orm';
import { db } from '@/db';
import { salaries } from '@/db/schema';
import { filtersSchema } from '@/lib/validators';
import { SALARY_RANGES } from '@/lib/constants';

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

// ─── GET /api/stats ──────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  try {
    const parsed = filtersSchema.safeParse(
      Object.fromEntries(req.nextUrl.searchParams)
    );
    if (!parsed.success)
      return NextResponse.json({ error: 'Invalid params' }, { status: 400 });

    // Allow exact slug filter (used by job detail page)
    const slugParam = req.nextUrl.searchParams.get('slug');
    const where = slugParam
      ? and(eq(salaries.isHidden, false), eq(salaries.jobSlug, slugParam))
      : buildWhere(parsed.data);

    // Run queries in parallel
    const [aggResult, uniqueJobsResult, industryResult, allSalariesResult] =
      await Promise.all([
        // total + avg
        db
          .select({ total: count(), avgSalary: avg(salaries.monthlySalaryEGP) })
          .from(salaries)
          .where(where),

        // unique job titles
        db
          .selectDistinct({ title: salaries.jobTitleNormalized })
          .from(salaries)
          .where(where),

        // top 5 industries
        db
          .select({
            industry: salaries.industry,
            count: count(),
            avgSalary: avg(salaries.monthlySalaryEGP),
          })
          .from(salaries)
          .where(where)
          .groupBy(salaries.industry)
          .orderBy(desc(count()))
          .limit(5),

        // all salaries (for median + distribution)
        db
          .select({ salary: salaries.monthlySalaryEGP })
          .from(salaries)
          .where(where)
          .orderBy(salaries.monthlySalaryEGP),
      ]);

    const agg = aggResult[0];
    const salaryValues = allSalariesResult.map(r => r.salary);

    const median =
      salaryValues.length > 0
        ? salaryValues[Math.floor(salaryValues.length / 2)]
        : 0;

    const salaryDistribution = SALARY_RANGES.map(range => ({
      range: range.label,
      count: salaryValues.filter(
        s => s >= range.min && (range.max === Infinity ? true : s < range.max)
      ).length,
    }));

    return NextResponse.json({
      totalEntries: agg.total,
      averageSalary: Math.round(Number(agg.avgSalary) || 0),
      medianSalary: median,
      uniqueJobTitles: uniqueJobsResult.length,
      topIndustries: industryResult.map(r => ({
        industry: r.industry,
        count: r.count,
        avgSalary: Math.round(Number(r.avgSalary) || 0),
      })),
      salaryDistribution,
    });
  } catch (err) {
    console.error('[GET /api/stats]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
