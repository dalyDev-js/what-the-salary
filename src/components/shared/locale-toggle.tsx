'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface LocaleToggleProps {
  locale: string;
}

export function LocaleToggle({ locale }: LocaleToggleProps) {
  const pathname = usePathname();
  const otherLocale = locale === 'en' ? 'ar' : 'en';
  const newPath = pathname.replace(`/${locale}`, `/${otherLocale}`);

  return (
    <Link
      href={newPath}
      className="inline-flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-1.5 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
    >
      {locale === 'en' ? 'عربي' : 'EN'}
    </Link>
  );
}
