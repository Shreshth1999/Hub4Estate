import { useQuery } from '@tanstack/react-query';
import { authApi } from '../lib/api';

export function useCurrentUser() {
  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: () => authApi.getMe().then(res => res.data),
    staleTime: 5 * 60_000, // user profile rarely changes within a session
    retry: false,
  });
}
