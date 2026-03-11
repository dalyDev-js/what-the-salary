import { Suspense } from 'react';
import { ExploreClient } from './explore-client';

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64">Loading...</div>}>
      <ExploreClient locale={locale} />
    </Suspense>
  );
}
