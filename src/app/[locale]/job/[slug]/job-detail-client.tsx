'use client';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ArrowLeftIcon } from '@radix-ui/react-icons';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useJobBySlug, useSalariesByJob } from '@/hooks/use-salaries';
import { useStats } from '@/hooks/use-stats';
import { SalaryChart } from '@/components/salary/salary-chart';
import { formatSalaryFull } from '@/lib/utils';
import type { JobStats, SalaryEntry, StatsResponse } from '@/types';

interface JobDetailClientProps {
  locale: string;
  slug: string;
}

export function JobDetailClient({ locale, slug }: JobDetailClientProps) {
  const t = useTranslations('salary');

  // Use exact slug lookup — no search/ilike involved
  const { data: jobsData, isLoading: jobLoading } = useJobBySlug(slug);
  const { data: salariesData } = useSalariesByJob(slug, { limit: 50 });
  const { data: statsData } = useStats({ slug });

  const job: JobStats | undefined = jobsData?.data?.[0];
  const entries: SalaryEntry[] = salariesData?.data ?? [];
  const stats: StatsResponse | undefined = statsData;

  if (jobLoading) {
    return (
      <div className="container mx-auto px-4 py-10 max-w-4xl animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4" />
        <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-1/4 mb-8" />
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="text-5xl mb-4">🔍</div>
        <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">No data for this job yet</p>
        <p className="text-gray-500 dark:text-gray-400 mb-6">Be the first to share a salary for <strong>{slug.replace(/-/g, ' ')}</strong></p>
        <Link href={`/${locale}/submit`} className="inline-flex items-center justify-center rounded-lg bg-green-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-green-700 transition-colors">
          🔒 Share Your Salary
        </Link>
        <Link href={`/${locale}`} className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mt-4">
          <ArrowLeftIcon /> Back to Explore
        </Link>
      </div>
    );
  }

  // Experience breakdown
  const expBreakdown = [
    { label: '0-2 yrs', salaries: entries.filter(e => e.yearsExperience <= 2) },
    { label: '3-5 yrs', salaries: entries.filter(e => e.yearsExperience >= 3 && e.yearsExperience <= 5) },
    { label: '6-10 yrs', salaries: entries.filter(e => e.yearsExperience >= 6 && e.yearsExperience <= 10) },
    { label: '10+ yrs', salaries: entries.filter(e => e.yearsExperience > 10) },
  ]
    .filter(g => g.salaries.length > 0)
    .map(g => ({
      range: g.label,
      avg: Math.round(g.salaries.reduce((s, e) => s + e.monthlySalaryEGP, 0) / g.salaries.length),
    }));

  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl">
      {/* Back link */}
      <Link
        href={`/${locale}`}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mb-6"
      >
        <ArrowLeftIcon /> Back to Explore
      </Link>

      {/* Hero */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
          {job.jobTitle}
        </h1>
        <p className="text-gray-500 dark:text-gray-400">{job.count} anonymous salaries</p>
      </div>

      {/* Key stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: t('min'), value: formatSalaryFull(job.minSalary), color: 'text-gray-700 dark:text-gray-300' },
          { label: t('avg'), value: formatSalaryFull(job.avgSalary), color: 'text-green-600' },
          { label: t('median'), value: formatSalaryFull(job.medianSalary), color: 'text-blue-600' },
          { label: t('max'), value: formatSalaryFull(job.maxSalary), color: 'text-gray-700 dark:text-gray-300' },
        ].map(stat => (
          <div key={stat.label} className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{stat.label}</p>
            <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-gray-400">{t('perMonth')}</p>
          </div>
        ))}
      </div>

      {/* Salary distribution chart */}
      {stats?.salaryDistribution && stats.salaryDistribution.some(d => d.count > 0) && (
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 mb-6">
          <SalaryChart data={stats.salaryDistribution} />
        </div>
      )}

      {/* Experience breakdown */}
      {expBreakdown.length > 0 && (
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 mb-6">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">{t('byExperience')}</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={expBreakdown} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb20" />
              <XAxis
                type="number"
                tick={{ fontSize: 11, fill: '#6b7280' }}
                tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="range"
                tick={{ fontSize: 12, fill: '#6b7280' }}
                axisLine={false}
                tickLine={false}
                width={55}
              />
              <Tooltip
                cursor={false}
                contentStyle={{
                  background: 'var(--tooltip-bg, #1f2937)',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#f9fafb',
                  fontSize: '13px',
                }}
                formatter={(v) => [`${formatSalaryFull(Number(v))} EGP`, 'Avg']}
              />
              <Bar dataKey="avg" fill="#3b82f6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Individual entries */}
      {entries.length > 0 && (
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 mb-6">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
            Individual Entries ({entries.length})
          </h3>
          <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-gray-50 dark:bg-gray-800 text-sm"
              >
                <div className="flex items-center flex-wrap gap-2 text-gray-500 dark:text-gray-400">
                  <span className="rounded-full bg-green-100 dark:bg-green-900/30 px-2 py-0.5 text-xs text-green-700 dark:text-green-300">
                    {entry.yearsExperience} yrs exp
                  </span>
                  <span>{entry.industry}</span>
                  <span>📍 {entry.city}</span>
                </div>
                <span className="font-semibold text-green-600 ms-3 flex-shrink-0">
                  {formatSalaryFull(entry.monthlySalaryEGP)} EGP
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CTA */}
      <div className="rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-6 text-center">
        <p className="text-gray-700 dark:text-gray-300 mb-3">Help others by sharing your salary too!</p>
        <Link
          href={`/${locale}/submit`}
          className="inline-flex items-center justify-center rounded-lg bg-green-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-green-700 transition-colors"
        >
          🔒 Share Your Salary Anonymously
        </Link>
      </div>
    </div>
  );
}
