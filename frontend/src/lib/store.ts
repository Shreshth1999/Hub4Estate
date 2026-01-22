import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  city: string;
  type: 'user' | 'dealer' | 'admin';
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isVerifying: boolean; // True while verifying token with backend
  isVerified: boolean;  // True after successful backend verification
  setAuth: (user: User, token: string) => void;
  setVerifying: (verifying: boolean) => void;
  setVerified: (verified: boolean) => void;
  updateUser: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isVerifying: false,
      isVerified: false,
      setAuth: (user, token) => {
        localStorage.setItem('token', token);
        set({ user, token, isAuthenticated: true, isVerified: true, isVerifying: false });
      },
      setVerifying: (verifying) => set({ isVerifying: verifying }),
      setVerified: (verified) => set({ isVerified: verified, isVerifying: false }),
      updateUser: (user) => set({ user }),
      logout: () => {
        localStorage.removeItem('token');
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isVerified: false,
          isVerifying: false
        });
      },
    }),
    {
      name: 'auth-storage',
      // Only persist these fields - isVerified must be re-verified on mount
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

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
