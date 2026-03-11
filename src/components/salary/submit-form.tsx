'use client';
import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useSubmitSalary } from '@/hooks/use-submit-salary';
import { submitSalarySchema } from '@/lib/validators';
import { INDUSTRIES, CITIES, COMPANY_SIZES } from '@/lib/constants';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { JobTitleCombobox } from './job-title-combobox';
import { ArrowLeftIcon, ArrowRightIcon } from '@radix-ui/react-icons';

type FormValues = {
  jobTitle: string;
  industry: string;
  companySize: 'startup' | 'mid' | 'large';
  companyType?: 'local' | 'multinational' | 'government' | 'ngo';
  monthlySalaryEGP: number;
  hasBonus: boolean;
  hasMedicalInsurance: boolean;
  yearsExperience: number;
  city: string;
  gender?: 'male' | 'female' | 'other';
  education?: 'high_school' | 'bachelors' | 'masters' | 'phd';
  honeypot: string;
};

interface SubmitFormProps {
  locale: string;
}

export function SubmitForm({ locale }: SubmitFormProps) {
  const t = useTranslations('submit');
  const [step, setStep] = useState(1);
  const [success, setSuccess] = useState(false);
  const { mutate, isPending, error } = useSubmitSalary();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    trigger,
  } = useForm<FormValues>({
    resolver: zodResolver(submitSalarySchema) as never,
    defaultValues: {
      hasBonus: false,
      hasMedicalInsurance: false,
      honeypot: '',
    },
  });

  const nextStep = async () => {
    const fields: Record<number, (keyof FormValues)[]> = {
      1: ['jobTitle', 'industry', 'companySize'],
      2: ['monthlySalaryEGP'],
      3: ['yearsExperience', 'city'],
    };
    const valid = await trigger(fields[step]);
    if (valid) setStep(s => s + 1);
  };

  const onSubmit = (data: FormValues) => {
    mutate(data as never, {
      onSuccess: () => setSuccess(true),
    });
  };

  if (success) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
          {t('success')}
        </h2>
        <Link
          href={`/${locale}`}
          className="inline-flex items-center justify-center rounded-lg bg-green-600 px-6 py-3 text-sm font-medium text-white hover:bg-green-700 transition-colors mt-4"
        >
          Explore Salaries <ArrowRightIcon />
        </Link>
      </div>
    );
  }

  const errorMessage = error
    ? (error as { response?: { data?: { error?: string } } }).response?.data?.error ?? t('validationError')
    : null;

  return (
    <div>
      {/* Privacy badge */}
      <div className="flex items-center gap-2 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 px-4 py-3 mb-8">
        <span className="text-green-600 text-lg">🔒</span>
        <p className="text-sm text-green-700 dark:text-green-300 font-medium">{t('privacy')}</p>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{t('title')}</h1>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
              s === step ? 'bg-green-600 text-white' : s < step ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
            }`}>
              {s < step ? '✓' : s}
            </div>
            {s < 3 && <div className={`h-0.5 w-8 transition-colors ${s < step ? 'bg-green-400' : 'bg-gray-200 dark:bg-gray-700'}`} />}
          </div>
        ))}
        <span className="text-sm text-gray-500 dark:text-gray-400 ms-2">
          {step === 1 ? t('step1') : step === 2 ? t('step2') : t('step3')}
        </span>
      </div>

      {errorMessage && (
        <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3 mb-6 text-sm text-red-700 dark:text-red-300">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Honeypot - hidden from humans */}
        <input type="text" {...register('honeypot')} className="hidden" tabIndex={-1} autoComplete="off" />

        {/* Step 1 */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('jobTitle')} *</label>
              <Controller
                name="jobTitle"
                control={control}
                render={({ field }) => (
                  <JobTitleCombobox
                    value={field.value ?? ''}
                    onChange={field.onChange}
                    error={errors.jobTitle?.message}
                  />
                )}
              />
              {errors.jobTitle && <p className="text-xs text-red-500 mt-1">{errors.jobTitle.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('industry')} *</label>
              <Controller
                name="industry"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full py-2.5">
                      <SelectValue placeholder="Select industry..." />
                    </SelectTrigger>
                    <SelectContent>
                      {INDUSTRIES.map(ind => (
                        <SelectItem key={ind} value={ind}>{ind}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.industry && <p className="text-xs text-red-500 mt-1">Required</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('companySize')} *</label>
              <div className="grid grid-cols-3 gap-2">
                {COMPANY_SIZES.map(size => (
                  <label key={size.value} className="cursor-pointer">
                    <input type="radio" {...register('companySize')} value={size.value} className="sr-only peer" />
                    <div className="rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2.5 text-sm text-center peer-checked:border-green-500 peer-checked:bg-green-50 dark:peer-checked:bg-green-900/20 peer-checked:text-green-700 dark:peer-checked:text-green-300 hover:border-gray-300 transition-colors cursor-pointer">
                      {size.label}
                    </div>
                  </label>
                ))}
              </div>
              {errors.companySize && <p className="text-xs text-red-500 mt-1">Required</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('companyType')}</label>
              <Controller
                name="companyType"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full py-2.5">
                      <SelectValue placeholder="Select type (optional)..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="local">{t('local')}</SelectItem>
                      <SelectItem value="multinational">{t('multinational')}</SelectItem>
                      <SelectItem value="government">{t('government')}</SelectItem>
                      <SelectItem value="ngo">{t('ngo')}</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('monthlySalary')} *</label>
              <div className="relative">
                <input
                  {...register('monthlySalaryEGP')}
                  type="number"
                  placeholder="e.g. 18000"
                  min={1000}
                  max={500000}
                  className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 dark:text-white pe-16"
                />
                <span className="absolute end-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">EGP</span>
              </div>
              {errors.monthlySalaryEGP && <p className="text-xs text-red-500 mt-1">{errors.monthlySalaryEGP.message}</p>}
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" {...register('hasBonus')} className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">{t('hasBonus')}</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" {...register('hasMedicalInsurance')} className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">{t('hasMedicalInsurance')}</span>
              </label>
            </div>
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('yearsExperience')} *</label>
              <input
                {...register('yearsExperience')}
                type="number"
                min={0}
                max={40}
                placeholder="e.g. 3"
                className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 dark:text-white"
              />
              {errors.yearsExperience && <p className="text-xs text-red-500 mt-1">{errors.yearsExperience.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('city')} *</label>
              <Controller
                name="city"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full py-2.5">
                      <SelectValue placeholder="Select city..." />
                    </SelectTrigger>
                    <SelectContent>
                      {CITIES.map(city => (
                        <SelectItem key={city} value={city}>{city}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.city && <p className="text-xs text-red-500 mt-1">Required</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('gender')}</label>
              <Controller
                name="gender"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full py-2.5">
                      <SelectValue placeholder={t('preferNotToSay')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">{t('male')}</SelectItem>
                      <SelectItem value="female">{t('female')}</SelectItem>
                      <SelectItem value="other">{t('other')}</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('education')}</label>
              <Controller
                name="education"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full py-2.5">
                      <SelectValue placeholder="Select level (optional)..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high_school">{t('highSchool')}</SelectItem>
                      <SelectItem value="bachelors">{t('bachelors')}</SelectItem>
                      <SelectItem value="masters">{t('masters')}</SelectItem>
                      <SelectItem value="phd">{t('phd')}</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex gap-3 pt-4">
          {step > 1 && (
            <button
              type="button"
              onClick={() => setStep(s => s - 1)}
              className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <ArrowLeftIcon /> {t('back')}
            </button>
          )}
          {step < 3 ? (
            <button
              type="button"
              onClick={nextStep}
              className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-green-700 transition-colors"
            >
              {t('next')} <ArrowRightIcon />
            </button>
          ) : (
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isPending ? '⏳ Submitting...' : `🔒 ${t('button')}`}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
