import { config } from 'dotenv';
config({ path: '.env.local' });
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';
import { slugify, normalizeJobTitle } from '../lib/utils';
import crypto from 'crypto';

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

const SEED_JOBS = [
  { title: 'Software Engineer', industry: 'Tech', salaryRange: [8000, 65000] as [number, number] },
  { title: 'Accountant', industry: 'Finance', salaryRange: [5000, 25000] as [number, number] },
  { title: 'Graphic Designer', industry: 'Creative', salaryRange: [4000, 22000] as [number, number] },
  { title: 'Pharmacist', industry: 'Healthcare', salaryRange: [5000, 20000] as [number, number] },
  { title: 'Marketing Manager', industry: 'Marketing', salaryRange: [10000, 50000] as [number, number] },
  { title: 'Civil Engineer', industry: 'Construction', salaryRange: [6000, 30000] as [number, number] },
  { title: 'Doctor', industry: 'Healthcare', salaryRange: [8000, 60000] as [number, number] },
  { title: 'Sales Executive', industry: 'Retail', salaryRange: [4000, 20000] as [number, number] },
  { title: 'Data Analyst', industry: 'Tech', salaryRange: [8000, 35000] as [number, number] },
  { title: 'Teacher', industry: 'Education', salaryRange: [3000, 15000] as [number, number] },
  { title: 'HR Specialist', industry: 'HR', salaryRange: [5000, 20000] as [number, number] },
  { title: 'Product Manager', industry: 'Tech', salaryRange: [15000, 70000] as [number, number] },
  { title: 'UI/UX Designer', industry: 'Tech', salaryRange: [7000, 35000] as [number, number] },
  { title: 'DevOps Engineer', industry: 'Tech', salaryRange: [12000, 55000] as [number, number] },
  { title: 'Customer Service', industry: 'Telecom', salaryRange: [3500, 10000] as [number, number] },
  { title: 'Lawyer', industry: 'Legal', salaryRange: [6000, 40000] as [number, number] },
  { title: 'Content Writer', industry: 'Marketing', salaryRange: [4000, 15000] as [number, number] },
  { title: 'Mechanical Engineer', industry: 'Manufacturing', salaryRange: [5000, 25000] as [number, number] },
  { title: 'Dentist', industry: 'Healthcare', salaryRange: [7000, 35000] as [number, number] },
  { title: 'Project Manager', industry: 'Construction', salaryRange: [12000, 45000] as [number, number] },
];

const CITIES = ['Cairo', 'Giza', 'Alexandria', 'New Cairo', 'Sheikh Zayed', '6th October'];
const COMPANY_SIZES = ['startup', 'mid', 'large'] as const;
const COMPANY_TYPES = ['local', 'multinational', 'government', 'ngo'] as const;
const GENDERS = ['male', 'female'] as const;
const EDUCATIONS = ['high_school', 'bachelors', 'masters', 'phd'] as const;
const CITY_MULTIPLIERS: Record<string, number> = {
  'Cairo': 1.0, 'New Cairo': 1.05, 'Sheikh Zayed': 1.03,
  'Giza': 0.92, 'Alexandria': 0.88, '6th October': 0.85,
};

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function seed() {
  console.log('🌱 Seeding database...');

  const entries: schema.NewSalary[] = [];

  for (const job of SEED_JOBS) {
    const count = randomBetween(7, 12);
    for (let i = 0; i < count; i++) {
      const yearsExperience = randomBetween(0, 15);
      const expMultiplier = 1 + (yearsExperience * 0.04);
      const city = pick(CITIES);
      const cityMultiplier = CITY_MULTIPLIERS[city] ?? 0.9;
      const baseSalary = randomBetween(job.salaryRange[0], job.salaryRange[1]);
      const monthlySalaryEGP = Math.round(baseSalary * expMultiplier * cityMultiplier / 500) * 500;

      const fingerprintHash = crypto.randomBytes(32).toString('hex');

      entries.push({
        jobTitle: job.title,
        jobTitleNormalized: normalizeJobTitle(job.title),
        jobSlug: slugify(job.title),
        industry: job.industry,
        companySize: pick(COMPANY_SIZES),
        companyType: pick(COMPANY_TYPES),
        monthlySalaryEGP: Math.min(Math.max(monthlySalaryEGP, 1000), 500000),
        hasBonus: Math.random() > 0.5,
        hasMedicalInsurance: Math.random() > 0.4,
        yearsExperience,
        city,
        gender: Math.random() > 0.3 ? pick(GENDERS) : undefined,
        education: Math.random() > 0.2 ? pick(EDUCATIONS) : undefined,
        isVerified: false,
        isHidden: false,
        fingerprintHash,
      });
    }
  }

  // Insert in batches
  const batchSize = 20;
  for (let i = 0; i < entries.length; i += batchSize) {
    await db.insert(schema.salaries).values(entries.slice(i, i + batchSize));
    console.log(`  Inserted ${Math.min(i + batchSize, entries.length)}/${entries.length}`);
  }

  console.log(`✅ Seeded ${entries.length} salary entries`);
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
