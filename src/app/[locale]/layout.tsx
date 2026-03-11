import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import '../globals.css';
import { Providers } from '@/components/providers';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

const locales = ['en', 'ar'];

export const metadata: Metadata = {
  title: {
    default: 'Kam Biyakhod? — كام بياخد؟ | Egypt Salary Explorer',
    template: '%s | Kam Biyakhod?',
  },
  description: 'Discover real, anonymous salaries in Egypt. Compare salaries by job title, industry, city, and experience. Share yours anonymously.',
  keywords: ['egypt salaries', 'salary egypt', 'مرتبات مصر', 'كام بياخد', 'salary comparison egypt'],
  openGraph: {
    type: 'website',
    locale: 'en_EG',
    alternateLocale: 'ar_EG',
    siteName: 'Kam Biyakhod?',
  },
  twitter: {
    card: 'summary_large_image',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!locales.includes(locale)) {
    notFound();
  }

  const messages = await getMessages();
  const isRTL = locale === 'ar';

  return (
    <html lang={locale} dir={isRTL ? 'rtl' : 'ltr'} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={isRTL ? 'font-arabic antialiased' : 'antialiased'}>
        <NextIntlClientProvider messages={messages}>
          <Providers>
            <div className="min-h-screen flex flex-col">
              <Header locale={locale} />
              <main className="flex-1">
                {children}
              </main>
              <Footer />
            </div>
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
