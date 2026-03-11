export interface JobStats {
  jobTitle: string;
  jobSlug: string;
  count: number;
  minSalary: number;
  maxSalary: number;
  avgSalary: number;
  medianSalary: number;
  industries: string[];
  cities: string[];
}

export interface SalaryEntry {
  id: number;
  jobTitle: string;
  jobSlug: string;
  industry: string;
  companySize: string;
  monthlySalaryEGP: number;
  yearsExperience: number;
  city: string;
  submittedAt: string;
}

export interface StatsResponse {
  totalEntries: number;
  averageSalary: number;
  medianSalary: number;
  uniqueJobTitles: number;
  topIndustries: { industry: string; count: number; avgSalary: number }[];
  salaryDistribution: { range: string; count: number }[];
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
