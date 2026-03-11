import { z } from 'zod';
import { INDUSTRIES, CITIES } from './constants';

export const submitSalarySchema = z.object({
  jobTitle: z.string()
    .min(2, 'Job title is too short')
    .max(150, 'Job title is too long')
    .trim()
    .transform(val => val.replace(/\s+/g, ' ')),
  industry: z.enum(INDUSTRIES as unknown as [string, ...string[]]),
  companySize: z.enum(['startup', 'mid', 'large']),
  companyType: z.enum(['local', 'multinational', 'government', 'ngo']).optional(),
  monthlySalaryEGP: z.coerce
    .number()
    .int('Salary must be a whole number')
    .min(1000, 'Minimum salary is 1,000 EGP')
    .max(500000, 'Maximum salary is 500,000 EGP'),
  hasBonus: z.boolean().optional().default(false),
  hasMedicalInsurance: z.boolean().optional().default(false),
  yearsExperience: z.coerce
    .number()
    .int()
    .min(0, 'Experience cannot be negative')
    .max(40, 'Maximum 40 years'),
  city: z.enum(CITIES as unknown as [string, ...string[]]),
  gender: z.enum(['male', 'female', 'other']).optional(),
  education: z.enum(['high_school', 'bachelors', 'masters', 'phd']).optional(),
  honeypot: z.string().max(0, 'Bot detected'),
});

export const filtersSchema = z.object({
  search: z.string().max(100).optional(),
  industry: z.string().optional(),
  city: z.string().optional(),
  experience: z.enum(['all', '0-2', '3-5', '6-10', '10+']).optional(),
  companySize: z.enum(['all', 'startup', 'mid', 'large']).optional(),
  sortBy: z.enum(['salary_desc', 'salary_asc', 'recent']).optional().default('recent'),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(50).optional().default(20),
});

export type SubmitSalaryInput = z.infer<typeof submitSalarySchema>;
export type FiltersInput = z.infer<typeof filtersSchema>;
