'use client';
import { useTranslations } from 'next-intl';

export function Footer() {
  const t = useTranslations('footer');

  return (
    <footer className="border-t bg-gray-50 dark:bg-gray-900 dark:border-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center gap-2 text-center">
          <p className="text-lg font-bold text-green-600">كام بياخد؟</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md">
            {t('tagline')}
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
            {t('privacy')}
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            © {new Date().getFullYear()} Kam Biyakhod? — {t('rights')}
          </p>
        </div>
      </div>
    </footer>
  );
}
