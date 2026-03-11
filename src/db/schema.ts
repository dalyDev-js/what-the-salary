import { pgTable, serial, text, integer, timestamp, boolean, varchar, index } from 'drizzle-orm/pg-core';

export const salaries = pgTable('salaries', {
  id: serial('id').primaryKey(),

  jobTitle: varchar('job_title', { length: 150 }).notNull(),
  jobTitleNormalized: varchar('job_title_normalized', { length: 150 }).notNull(),
  jobSlug: varchar('job_slug', { length: 150 }).notNull(),

  industry: varchar('industry', { length: 50 }).notNull(),
  companySize: varchar('company_size', { length: 30 }).notNull(),
  companyType: varchar('company_type', { length: 30 }),

  monthlySalaryEGP: integer('monthly_salary_egp').notNull(),
  hasBonus: boolean('has_bonus').default(false),
  hasMedicalInsurance: boolean('has_medical_insurance').default(false),

  yearsExperience: integer('years_experience').notNull(),
  city: varchar('city', { length: 50 }).notNull(),
  gender: varchar('gender', { length: 20 }),

  education: varchar('education', { length: 30 }),

  isVerified: boolean('is_verified').default(false),
  isHidden: boolean('is_hidden').default(false),
  submittedAt: timestamp('submitted_at').defaultNow().notNull(),

  fingerprintHash: varchar('fingerprint_hash', { length: 64 }),
}, (table) => ({
  jobTitleIdx: index('job_title_idx').on(table.jobTitleNormalized),
  industryIdx: index('industry_idx').on(table.industry),
  cityIdx: index('city_idx').on(table.city),
  salaryIdx: index('salary_idx').on(table.monthlySalaryEGP),
  submittedIdx: index('submitted_idx').on(table.submittedAt),
  slugIdx: index('slug_idx').on(table.jobSlug),
}));

export type Salary = typeof salaries.$inferSelect;
export type NewSalary = typeof salaries.$inferInsert;
