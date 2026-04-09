import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { messagingApi } from '../lib/api';

export function useConversations() {
  return useQuery({
    queryKey: ['conversations'],
    queryFn: () => messagingApi.getConversations().then(res => res.data),
    refetchInterval: 10_000, // Poll every 10s for new messages
  });
}

export function useMessages(conversationId: string | undefined, params?: { cursor?: string; limit?: number }) {
  return useQuery({
    queryKey: ['messages', conversationId, params],
    queryFn: () => messagingApi.getMessages(conversationId!, params).then(res => res.data),
    enabled: !!conversationId,
    refetchInterval: 5_000, // Poll every 5s
  });
}

export function useSendMessage(conversationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { content: string; type?: string; metadata?: Record<string, unknown> }) =>
      messagingApi.sendMessage(conversationId, data).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}

export function useCreateConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { title?: string; type?: string; referenceId?: string; referenceType?: string; participantId: string; participantType: string }) =>
      messagingApi.createConversation(data).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}

export function useMarkRead(conversationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => messagingApi.markRead(conversationId).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}

export function useToggleMute(conversationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (muted: boolean) => messagingApi.toggleMute(conversationId, muted).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}
