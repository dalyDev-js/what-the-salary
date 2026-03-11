'use client';
import { useState, useTransition, useDeferredValue } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ArrowRightIcon } from '@radix-ui/react-icons';
import Image from 'next/image';
import { ExploreFilters } from '@/components/salary/explore-filters';
import { SalaryCard } from '@/components/salary/salary-card';
import { StatsOverview } from '@/components/salary/stats-overview';
import { EmptyState } from '@/components/shared/empty-state';
import { useJobsWithStats } from '@/hooks/use-salaries';
import { useStats } from '@/hooks/use-stats';
import type { FiltersInput } from '@/lib/validators';
import type { JobStats } from '@/types';

interface ExploreClientProps {
  locale: string;
}

interface FilterState {
  search: string;
  industry: string;
  city: string;
  experience: string;
  companySize: string;
  sortBy: string;
}

export function ExploreClient({ locale }: ExploreClientProps) {
  const t = useTranslations('hero');
  const [, startTransition] = useTransition();
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    industry: '',
    city: '',
    experience: '',
    companySize: '',
    sortBy: 'recent',
  });

  const deferredFilters = useDeferredValue(filters);

  const queryFilters: Partial<FiltersInput> = {
    search: deferredFilters.search || undefined,
    industry: deferredFilters.industry || undefined,
    city: deferredFilters.city || undefined,
    experience: (deferredFilters.experience as FiltersInput['experience']) || undefined,
    companySize: (deferredFilters.companySize as FiltersInput['companySize']) || undefined,
    sortBy: (deferredFilters.sortBy as FiltersInput['sortBy']) || 'recent',
    page: 1,
    limit: 20,
  };

  const { data: jobsData, isLoading: jobsLoading } = useJobsWithStats(queryFilters as FiltersInput);
  const { data: stats, isLoading: statsLoading } = useStats();

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    startTransition(() => {
      setFilters(prev => ({ ...prev, [key]: value }));
    });
  };

  const jobs: JobStats[] = jobsData?.data ?? [];

  return (
    <div className="min-h-screen">
      {/* Hero — soft green gradient band */}
      <div className="bg-gradient-to-b from-green-50 to-transparent dark:from-green-950/20 dark:to-transparent border-b border-green-100 dark:border-green-900/30">
        <div className="container mx-auto px-4 pt-12 pb-10 max-w-6xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-green-100 dark:bg-green-900/30 px-4 py-1.5 text-xs font-semibold text-green-700 dark:text-green-400 mb-5 tracking-wide uppercase">
            <Image src="/egypt-flag-icon.svg" alt="Egypt" width={18} height={18} className="rounded-sm" />
            Egypt Salary Data
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-3 tracking-tight">
            {t('title')} <span className="text-green-600">💰</span>
          </h1>
          <p className="text-base text-gray-500 dark:text-gray-400 mb-7 max-w-lg mx-auto leading-relaxed">
            {t('subtitle')}
          </p>
          <Link
            href={`/${locale}/submit`}
            className="inline-flex items-center justify-center rounded-xl bg-green-600 px-7 py-3 text-sm font-semibold text-white hover:bg-green-700 transition-colors shadow-md shadow-green-200 dark:shadow-green-900/30"
          >
            {t('cta')} <ArrowRightIcon />
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Stats */}
        <div className="mb-8">
          <StatsOverview stats={stats} isLoading={statsLoading} />
        </div>

        {/* Filters — on a white card surface */}
        <div className="mb-7 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700/60 shadow-sm p-4">
          <ExploreFilters filters={filters} onChange={handleFilterChange} />
        </div>

        {/* Results */}
        {jobsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5 animate-pulse shadow-sm">
                <div className="h-5 bg-gray-100 dark:bg-gray-700 rounded-lg mb-3 w-3/4" />
                <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded mb-4 w-1/4" />
                <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full mb-4" />
                <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-4 uppercase tracking-wide">
              {jobs.length} job{jobs.length !== 1 ? 's' : ''} found
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {jobs.map((job) => (
                <SalaryCard key={job.jobSlug} job={job} />
              ))}
            </div>
          </>
        )}

        <div className="h-12" />

        {/* Bottom CTA */}
        <div className="text-center pb-16">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{t('subtitle')}</p>
          <Link
            href={`/${locale}/submit`}
            className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-7 py-3 text-sm font-semibold text-white hover:bg-green-700 transition-colors shadow-md shadow-green-200 dark:shadow-green-900/30"
          >
            💰 {t('cta')}
          </Link>
        </div>
      </div>
    </div>
  );
}
