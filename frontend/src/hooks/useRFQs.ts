import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { rfqApi } from '../lib/api';

export function useMyRFQs(params?: { page?: number; limit?: number; status?: string }) {
  return useQuery({
    queryKey: ['rfqs', 'my', params],
    queryFn: () => rfqApi.getMyRFQs(params).then(res => res.data),
  });
}

export function useRFQDetail(id: string | undefined) {
  return useQuery({
    queryKey: ['rfqs', id],
    queryFn: () => rfqApi.getRFQ(id!).then(res => res.data),
    enabled: !!id,
  });
}

export function useCreateRFQ() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => rfqApi.create(data).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rfqs'] });
    },
  });
}

export function usePublishRFQ() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => rfqApi.publish(id).then(res => res.data),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ['rfqs'] });
      queryClient.invalidateQueries({ queryKey: ['rfqs', id] });
    },
  });
}

export function useSelectQuote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ rfqId, quoteId }: { rfqId: string; quoteId: string }) =>
      rfqApi.selectQuote(rfqId, quoteId).then(res => res.data),
    onSuccess: (_data, { rfqId }) => {
      queryClient.invalidateQueries({ queryKey: ['rfqs'] });
      queryClient.invalidateQueries({ queryKey: ['rfqs', rfqId] });
    },
  });
}

export function useCancelRFQ() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => rfqApi.cancelRFQ(id).then(res => res.data),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ['rfqs'] });
      queryClient.invalidateQueries({ queryKey: ['rfqs', id] });
    },
  });
}
