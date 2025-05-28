import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Transaction, InsertTransaction } from "@shared/schema";

export function useTransactions(filters?: { type?: string; category?: string; search?: string }) {
  const queryParams = new URLSearchParams();
  if (filters?.type) queryParams.append('type', filters.type);
  if (filters?.category) queryParams.append('category', filters.category);
  if (filters?.search) queryParams.append('search', filters.search);

  return useQuery<Transaction[]>({
    queryKey: ['/api/transactions', queryParams.toString()],
  });
}

export function useTransaction(id: number) {
  return useQuery<Transaction>({
    queryKey: ['/api/transactions', id],
    enabled: !!id,
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: InsertTransaction & { photo?: File }) => {
      const formData = new FormData();
      
      // Add transaction data
      Object.entries(data).forEach(([key, value]) => {
        if (key !== 'photo' && value !== undefined) {
          formData.append(key, value.toString());
        }
      });

      // Add photo if provided
      if (data.photo) {
        formData.append('photo', data.photo);
      }

      const response = await fetch('/api/transactions', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to create transaction');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard'] });
    },
  });
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: { id: number } & Partial<InsertTransaction>) => {
      const response = await apiRequest('PUT', `/api/transactions/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard'] });
    },
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/transactions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard'] });
    },
  });
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ['/api/dashboard/stats'],
  });
}
