import { create } from "zustand";

interface User {
  id: number;
  email: string;
  role?: string;
  name?: string;
  avatar?: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  hydrateFromServer: () => Promise<void>;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  hydrateFromServer: async () => {
    try {
      const r = await fetch("/api/auth/me", {
        credentials: "include",
        cache: "no-store",
      });
      if (!r.ok) {
        set({ user: null, isLoading: false, isAuthenticated: false });
        return;
      }
      const user = (await r.json()) as User;
      set({ user, isLoading: false, isAuthenticated: true });

      const { useCartStore } = await import("@/features/cart/store");
      const { useWishlistStore } = await import("@/features/wishlist/store");
      useCartStore.getState().fetchCartFromServer();
      useWishlistStore.getState().fetchWishlistFromServer();
    } catch {
      set({ user: null, isLoading: false, isAuthenticated: false });
    }
  },

  login: async () => {
    await useAuthStore.getState().hydrateFromServer();
  },

  logout: async () => {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    }).catch(() => undefined);
    set({ user: null, isLoading: false, isAuthenticated: false });

    const { useCartStore } = await import("@/features/cart/store");
    const { useWishlistStore } = await import("@/features/wishlist/store");
    useCartStore.getState().clearCart();
    useWishlistStore.getState().clearWishlist();

    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  },

  checkAuth: async () => {
    await useAuthStore.getState().hydrateFromServer();
  },
}));
