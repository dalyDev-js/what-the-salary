'use client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import type { SubmitSalaryInput } from '@/lib/validators';

export function useSubmitSalary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: SubmitSalaryInput) => {
      const { data } = await api.post('/salaries', input);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['salaries'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
  });
}
