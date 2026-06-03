import { create } from "zustand";

interface User {
  id: string;
  email: string;
  role?: string;
  name?: string;
  imageUrl?: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  hydrateFromServer: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,

  hydrateFromServer: async () => {
    try {
      const r = await fetch("/api/auth/me", {
        credentials: "include",
        cache: "no-store",
      });
      if (!r.ok) {
        throw new Error("unauthorized");
      }
      const user = (await r.json()) as User;
      set({ user, isLoading: false });
    } catch {
      set({ user: null, isLoading: false });
    }
  },

  logout: async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
        keepalive: true,
      });
    } catch {
      /* best effort */
    }
    set({ user: null, isLoading: false });
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  },
}));
