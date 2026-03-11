'use client';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import api from '@/lib/axios';
import type { FiltersInput } from '@/lib/validators';

export function useJobsWithStats(filters: FiltersInput) {
  return useQuery({
    queryKey: ['jobs', filters],
    queryFn: async () => {
      const { data } = await api.get('/jobs', { params: filters });
      return data;
    },
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 5,
  });
}

export function useJobBySlug(slug: string) {
  return useQuery({
    queryKey: ['jobs', 'slug', slug],
    queryFn: async () => {
      const { data } = await api.get('/jobs', { params: { slug } });
      return data;
    },
    staleTime: 1000 * 60 * 5,
    enabled: !!slug,
  });
}

export function useSalariesByJob(slug: string, filters?: Partial<FiltersInput>) {
  return useQuery({
    queryKey: ['salaries', slug, filters],
    queryFn: async () => {
      const { data } = await api.get('/salaries', {
        params: { ...filters, search: slug }
      });
      return data;
    },
    staleTime: 1000 * 60 * 5,
  });
}
