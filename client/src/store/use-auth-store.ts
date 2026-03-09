import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@shared/schema';

interface AuthState {
  user: User | null;
  userId: number | null;
  setUser: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      userId: null,
      setUser: (user) => set({ user, userId: user.id }),
      logout: () => set({ user: null, userId: null }),
    }),
    {
      name: 'crypto-cave-auth',
    }
  )
);
