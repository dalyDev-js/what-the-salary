export const INDUSTRIES = [
  'Tech', 'Finance', 'Healthcare', 'Marketing', 'Construction',
  'Creative', 'Education', 'Retail', 'FMCG', 'Telecom',
  'HR', 'Legal', 'Manufacturing', 'Real Estate', 'Oil & Gas',
  'Logistics', 'Hospitality', 'Government', 'NGO', 'Other'
] as const;

export const CITIES = [
  'Cairo', 'Giza', 'Alexandria', '6th October', 'New Capital',
  'Sheikh Zayed', 'New Cairo', '10th of Ramadan', 'Mansoura',
  'Tanta', 'Ismailia', 'Port Said', 'Aswan', 'Luxor',
  'Hurghada', 'Sharm El Sheikh', 'Other'
] as const;

export const COMPANY_SIZES = [
  { value: 'startup', label: 'Startup (1-50)', labelAr: 'شركة ناشئة (١-٥٠)' },
  { value: 'mid', label: 'Mid-size (51-200)', labelAr: 'متوسطة (٥١-٢٠٠)' },
  { value: 'large', label: 'Large (200+)', labelAr: 'كبيرة (+٢٠٠)' },
] as const;

export const EXPERIENCE_RANGES = [
  { value: 'all', label: 'All', labelAr: 'الكل' },
  { value: '0-2', label: '0-2 years', labelAr: '٠-٢ سنين' },
  { value: '3-5', label: '3-5 years', labelAr: '٣-٥ سنين' },
  { value: '6-10', label: '6-10 years', labelAr: '٦-١٠ سنين' },
  { value: '10+', label: '10+ years', labelAr: '+١٠ سنين' },
] as const;

export const SALARY_RANGES = [
  { min: 0, max: 5000, label: '0-5K' },
  { min: 5000, max: 10000, label: '5-10K' },
  { min: 10000, max: 20000, label: '10-20K' },
  { min: 20000, max: 35000, label: '20-35K' },
  { min: 35000, max: 50000, label: '35-50K' },
  { min: 50000, max: Infinity, label: '50K+' },
] as const;
