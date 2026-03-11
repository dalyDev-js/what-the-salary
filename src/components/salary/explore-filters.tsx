'use client';
import { useTranslations } from 'next-intl';
import { INDUSTRIES, CITIES, EXPERIENCE_RANGES, COMPANY_SIZES } from '@/lib/constants';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Filters {
  search: string;
  industry: string;
  city: string;
  experience: string;
  companySize: string;
  sortBy: string;
}

interface ExploreFiltersProps {
  filters: Filters;
  onChange: (key: keyof Filters, value: string) => void;
}

export function ExploreFilters({ filters, onChange }: ExploreFiltersProps) {
  const t = useTranslations('filters');

  return (
    <div className="space-y-3">
      {/* Search */}
      <input
        type="text"
        placeholder={t('search')}
        value={filters.search}
        onChange={(e) => onChange('search', e.target.value)}
        className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 dark:text-white placeholder:text-gray-400"
      />

      {/* Filter row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <Select value={filters.industry || undefined} onValueChange={(v) => onChange('industry', v)}>
          <SelectTrigger>
            <SelectValue placeholder={t('industry')} />
          </SelectTrigger>
          <SelectContent>
            {INDUSTRIES.map((ind) => (
              <SelectItem key={ind} value={ind}>{ind}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.city || undefined} onValueChange={(v) => onChange('city', v)}>
          <SelectTrigger>
            <SelectValue placeholder={t('city')} />
          </SelectTrigger>
          <SelectContent>
            {CITIES.map((city) => (
              <SelectItem key={city} value={city}>{city}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.experience || undefined} onValueChange={(v) => onChange('experience', v)}>
          <SelectTrigger>
            <SelectValue placeholder={t('experience')} />
          </SelectTrigger>
          <SelectContent>
            {EXPERIENCE_RANGES.filter(r => r.value !== 'all').map((range) => (
              <SelectItem key={range.value} value={range.value}>{range.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.companySize || undefined} onValueChange={(v) => onChange('companySize', v)}>
          <SelectTrigger>
            <SelectValue placeholder={t('companySize')} />
          </SelectTrigger>
          <SelectContent>
            {COMPANY_SIZES.map((size) => (
              <SelectItem key={size.value} value={size.value}>{size.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Sort + clear */}
      <div className="flex items-center justify-between gap-2">
        <Select value={filters.sortBy} onValueChange={(v) => onChange('sortBy', v)}>
          <SelectTrigger className="w-auto min-w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">{t('mostRecent')}</SelectItem>
            <SelectItem value="salary_desc">{t('salaryHigh')}</SelectItem>
            <SelectItem value="salary_asc">{t('salaryLow')}</SelectItem>
          </SelectContent>
        </Select>

        {(filters.search || filters.industry || filters.city || filters.experience || filters.companySize) && (
          <button
            onClick={() => {
              onChange('search', '');
              onChange('industry', '');
              onChange('city', '');
              onChange('experience', '');
              onChange('companySize', '');
            }}
            className="text-sm text-red-500 hover:text-red-700 transition-colors"
          >
            {t('clearAll')}
          </button>
        )}
      </div>
    </div>
  );
}
