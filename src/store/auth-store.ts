import { create } from "zustand";

interface User {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  setUser: (user) => set({ user, loading: false }),
  setLoading: (loading) => set({ loading }),
  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("wabot_user");
    }
    set({ user: null, loading: false });
  },
}));

export function getStoredUser(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem("wabot_user");
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

export function storeUser(user: User | null) {
  if (typeof window === "undefined") return;
  if (user) {
    localStorage.setItem("wabot_user", JSON.stringify(user));
  } else {
    localStorage.removeItem("wabot_user");
  }
}