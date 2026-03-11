'use client';
import { useTranslations } from 'next-intl';
import { formatSalaryFull } from '@/lib/utils';
import type { StatsResponse } from '@/types';

interface StatsOverviewProps {
  stats: StatsResponse | undefined;
  isLoading?: boolean;
}

export function StatsOverview({ stats, isLoading }: StatsOverviewProps) {
  const t = useTranslations('hero');

  const items = [
    {
      label: t('totalEntries'),
      value: isLoading ? '...' : (stats?.totalEntries?.toLocaleString() ?? '0'),
      icon: '👥',
    },
    {
      label: t('avgSalary'),
      value: isLoading ? '...' : (stats ? `${formatSalaryFull(stats.averageSalary)} EGP` : '0'),
      icon: '💰',
    },
    {
      label: t('jobTitles'),
      value: isLoading ? '...' : (stats?.uniqueJobTitles?.toLocaleString() ?? '0'),
      icon: '💼',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-2xl border border-gray-200 dark:border-gray-700/60 bg-white dark:bg-gray-900 p-5 text-center shadow-sm"
        >
          <div className="text-3xl mb-2">{item.icon}</div>
          <div className="text-2xl font-bold text-green-600">{item.value}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{item.label}</div>
        </div>
      ))}
    </div>
  );
}
