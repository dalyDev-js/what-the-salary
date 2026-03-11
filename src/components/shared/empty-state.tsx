'use client';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';

export function EmptyState() {
  const t = useTranslations('empty');
  const params = useParams();
  const locale = params.locale as string;

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="text-6xl mb-4">💸</div>
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
        {t('title')}
      </h3>
      <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm">
        {t('subtitle')}
      </p>
      <Link
        href={`/${locale}/submit`}
        className="inline-flex items-center justify-center rounded-lg bg-green-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-green-700 transition-colors"
      >
        {t('cta')}
      </Link>
    </div>
  );
}
