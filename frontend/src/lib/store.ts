import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  email: string;
  name: string;
  role?: string;
  city?: string;
  phone?: string;
  type: 'user' | 'dealer' | 'admin';
  profVerificationStatus?: string;
  status?: string;
  onboardingStep?: number;
  profileComplete?: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isVerifying: boolean;
  isVerified: boolean;
  setAuth: (user: User, token: string) => void;
  setToken: (token: string) => void;
  setUser: (user: User) => void;
  setVerifying: (verifying: boolean) => void;
  setVerified: (verified: boolean) => void;
  updateUser: (user: User) => void;
  logout: () => void;
  getToken: () => string | null;
}

// CRIT-03: Token stored in-memory only — never in localStorage.
// On page refresh, token is lost and user must re-authenticate.
// This prevents XSS attacks from stealing the JWT.
let _inMemoryToken: string | null = null;

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isVerifying: false,
      isVerified: false,
      setAuth: (user: User, token: string) => {
        _inMemoryToken = token;
        set({ user, token, isAuthenticated: true, isVerified: true, isVerifying: false });
      },
      setToken: (token: string) => {
        _inMemoryToken = token;
        set({ token, isAuthenticated: true });
      },
      setUser: (user: User) => {
        set({ user, isVerified: true, isVerifying: false });
      },
      setVerifying: (verifying) => set({ isVerifying: verifying }),
      setVerified: (verified) => set({ isVerified: verified, isVerifying: false }),
      updateUser: (user) => set({ user }),
      logout: () => {
        _inMemoryToken = null;
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isVerified: false,
          isVerifying: false
        });
      },
      getToken: () => _inMemoryToken,
    }),
    {
      name: 'auth-storage',
      // Persist user profile only — token is NEVER persisted (CRIT-03)
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

/** Get the in-memory token (for use outside React components) */
export function getAuthToken(): string | null {
  return _inMemoryToken;
}

// RFQ Item for the cart
interface RFQItem {
  productId: string;
  name: string;
  brand: string;
  quantity: number;
  notes?: string;
}

interface RFQState {
  items: RFQItem[];
  addItem: (item: Omit<RFQItem, 'notes'>) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  updateNotes: (productId: string, notes: string) => void;
  clearItems: () => void;
}

export const useRFQStore = create<RFQState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item) =>
        set((state) => {
          // Check if item already exists
          const exists = state.items.find((i) => i.productId === item.productId);
          if (exists) {
            return {
              items: state.items.map((i) =>
                i.productId === item.productId
                  ? { ...i, quantity: i.quantity + 1 }
                  : i
              ),
            };
          }
          return { items: [...state.items, { ...item, quantity: item.quantity || 1 }] };
        }),
      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        })),
      updateQuantity: (productId, quantity) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.productId === productId ? { ...i, quantity } : i
          ),
        })),
      updateNotes: (productId, notes) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.productId === productId ? { ...i, notes } : i
          ),
        })),
      clearItems: () => set({ items: [] }),
    }),
    {
      name: 'rfq-storage',
    }
  )
);
