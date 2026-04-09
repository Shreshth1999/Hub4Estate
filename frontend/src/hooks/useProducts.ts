import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productsApi } from '../lib/api';

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => productsApi.getCategories().then(res => res.data),
    staleTime: 5 * 60_000, // categories change rarely
  });
}

export function useCategory(slug: string | undefined) {
  return useQuery({
    queryKey: ['categories', slug],
    queryFn: () => productsApi.getCategoryBySlug(slug!).then(res => res.data),
    enabled: !!slug,
  });
}

export function useProductDetail(id: string | undefined) {
  return useQuery({
    queryKey: ['products', id],
    queryFn: () => productsApi.getProduct(id!).then(res => res.data),
    enabled: !!id,
  });
}

export function useProductSearch(params: Record<string, unknown> | undefined) {
  return useQuery({
    queryKey: ['products', 'search', params],
    queryFn: () => productsApi.searchProducts(params).then(res => res.data),
    enabled: !!params,
  });
}

export function useProductType(slug: string | undefined, params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ['productTypes', slug, params],
    queryFn: () => productsApi.getProductType(slug!, params).then(res => res.data),
    enabled: !!slug,
  });
}

export function useSavedProducts() {
  return useQuery({
    queryKey: ['products', 'saved'],
    queryFn: () => productsApi.getSavedProducts().then(res => res.data),
  });
}

export function useSaveProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) =>
      productsApi.saveProduct(id, notes).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products', 'saved'] });
    },
  });
}
