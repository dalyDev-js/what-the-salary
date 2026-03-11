import type { Metadata } from 'next';
import { JobDetailClient } from './job-detail-client';
import { formatSalary } from '@/lib/utils';

async function getJobData(slug: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/jobs?search=${encodeURIComponent(slug)}&limit=1`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.data?.[0] ?? null;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const job = await getJobData(slug);

  if (!job) {
    return { title: 'Job Not Found' };
  }

  return {
    title: `${job.jobTitle} Salary in Egypt`,
    description: `${job.jobTitle} earns ${formatSalary(job.minSalary)}-${formatSalary(job.maxSalary)} EGP/month in Egypt. ${job.count} anonymous salaries shared.`,
    openGraph: {
      images: [`/api/og?title=${encodeURIComponent(job.jobTitle)}&min=${job.minSalary}&max=${job.maxSalary}&avg=${job.avgSalary}`],
    },
  };
}

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  return <JobDetailClient locale={locale} slug={slug} />;
}
