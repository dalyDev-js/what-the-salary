import { SubmitForm } from '@/components/salary/submit-form';

export default async function SubmitPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return (
    <div className="container mx-auto px-4 py-10 max-w-2xl">
      <SubmitForm locale={locale} />
    </div>
  );
}
