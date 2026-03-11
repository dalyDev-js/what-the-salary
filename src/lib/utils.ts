import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function formatSalary(amount: number): string {
  if (amount >= 1000) {
    return `${(amount / 1000).toFixed(0)}K`;
  }
  return amount.toString();
}

export function formatSalaryFull(amount: number): string {
  return new Intl.NumberFormat('en-EG').format(amount);
}

export function getExperienceRange(years: number): string {
  if (years <= 2) return '0-2';
  if (years <= 5) return '3-5';
  if (years <= 10) return '6-10';
  return '10+';
}

export function normalizeJobTitle(title: string): string {
  return title.toLowerCase().trim().replace(/\s+/g, ' ');
}
