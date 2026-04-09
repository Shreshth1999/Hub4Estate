import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inquiryApi } from '../lib/api';

export function useTrackInquiry(params: { phone?: string; id?: string; number?: string } | undefined) {
  return useQuery({
    queryKey: ['inquiries', 'track', params],
    queryFn: () => inquiryApi.track(params!).then(res => res.data),
    enabled: !!params && !!(params.phone || params.id || params.number),
  });
}

export function useSubmitInquiry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: FormData) => inquiryApi.submit(data).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inquiries'] });
    },
  });
}

// Admin hooks

export function useAdminInquiries(params?: { page?: number; limit?: number; status?: string; search?: string }) {
  return useQuery({
    queryKey: ['inquiries', 'admin', params],
    queryFn: () => inquiryApi.adminList(params).then(res => res.data),
  });
}

export function useAdminInquiryDetail(id: string | undefined) {
  return useQuery({
    queryKey: ['inquiries', 'admin', id],
    queryFn: () => inquiryApi.adminGet(id!).then(res => res.data),
    enabled: !!id,
  });
}

export function useAdminRespondInquiry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      inquiryApi.adminRespond(id, data).then(res => res.data),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['inquiries'] });
      queryClient.invalidateQueries({ queryKey: ['inquiries', 'admin', id] });
    },
  });
}

export function useAdminUpdateInquiryStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      inquiryApi.adminUpdateStatus(id, status).then(res => res.data),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['inquiries'] });
      queryClient.invalidateQueries({ queryKey: ['inquiries', 'admin', id] });
    },
  });
}
