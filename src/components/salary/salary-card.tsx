'use client';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { SalaryRangeBar } from './salary-range-bar';
import { formatSalaryFull } from '@/lib/utils';
import type { JobStats } from '@/types';

interface SalaryCardProps {
  job: JobStats;
}

export function SalaryCard({ job }: SalaryCardProps) {
  const t = useTranslations('salary');
  const params = useParams();
  const locale = params.locale as string;

  return (
    <Link href={`/${locale}/job/${job.jobSlug}`}>
      <div className="group rounded-2xl border border-gray-200 dark:border-gray-700/60 bg-white dark:bg-gray-900 p-5 shadow-sm hover:shadow-lg hover:border-green-400 dark:hover:border-green-600 transition-all duration-200 cursor-pointer">
        {/* Title row */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 dark:text-white text-[15px] leading-tight truncate group-hover:text-green-600 transition-colors">
              {job.jobTitle}
            </h3>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              {job.count} {job.count === 1 ? t('entry') : t('entries')}
            </p>
          </div>
          <div className="text-right ms-3 flex-shrink-0">
            <p className="text-lg font-bold text-green-600 dark:text-green-500">
              {formatSalaryFull(job.avgSalary)}
            </p>
            <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wide">{t('perMonth')}</p>
          </div>
        </div>

        {/* Range bar */}
        <SalaryRangeBar
          min={job.minSalary}
          max={job.maxSalary}
          median={job.medianSalary}
          avg={job.avgSalary}
        />

        {/* Tags */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {job.industries.slice(0, 2).map((ind) => (
            <span
              key={ind}
              className="inline-flex items-center rounded-full bg-green-50 dark:bg-green-900/20 px-2.5 py-0.5 text-[11px] font-medium text-green-700 dark:text-green-400"
            >
              {ind}
            </span>
          ))}
          {job.cities.slice(0, 2).map((city) => (
            <span
              key={city}
              className="inline-flex items-center rounded-full bg-gray-100 dark:bg-gray-800 px-2.5 py-0.5 text-[11px] text-gray-500 dark:text-gray-400"
            >
              {city}
            </span>
          ))}
        </div>

        {/* Min / Median / Max */}
        <div className="mt-4 grid grid-cols-3 gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
          {[
            { label: t('min'), value: formatSalaryFull(job.minSalary), accent: false },
            { label: t('median'), value: formatSalaryFull(job.medianSalary), accent: true },
            { label: t('max'), value: formatSalaryFull(job.maxSalary), accent: false },
          ].map(({ label, value, accent }) => (
            <div key={label} className="text-center">
              <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-0.5">{label}</p>
              <p className={`text-xs font-semibold ${accent ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-300'}`}>
                {value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </Link>
  );
}
