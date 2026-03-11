'use client';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';

export function useStats(filters?: Record<string, string>) {
  return useQuery({
    queryKey: ['stats', filters],
    queryFn: async () => {
      const { data } = await api.get('/stats', { params: filters });
      return data;
    },
    staleTime: 1000 * 60 * 10,
  });
}
