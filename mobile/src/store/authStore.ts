import { create } from 'zustand';
import { AuthUser } from '../types/auth';

interface AuthStore {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isBootstrapped: boolean; // true after initial auth check completes

  setAuth: (user: AuthUser, accessToken: string) => void;
  setUser: (user: AuthUser) => void;
  updateUser: (partial: Partial<AuthUser>) => void;
  setLoading: (loading: boolean) => void;
  setBootstrapped: (done: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: false,
  isBootstrapped: false,

  setAuth: (user, accessToken) =>
    set({ user, accessToken, isAuthenticated: true, isLoading: false }),

  setUser: (user) =>
    set({ user, isAuthenticated: true, isLoading: false }),

  updateUser: (partial) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...partial } : null,
    })),

  setLoading: (loading) => set({ isLoading: loading }),

  setBootstrapped: (done) => set({ isBootstrapped: done }),

  logout: () =>
    set({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,
    }),
}));
