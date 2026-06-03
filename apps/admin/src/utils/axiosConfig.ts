import axios from "axios";
import { useAuthStore } from "@/stores/authStore";
import { logger } from "@/lib/logger";

const api = axios.create({
  baseURL: "/api/proxy",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Mutex: ensures only one refresh request runs at a time.
// Concurrent 401s await the same promise instead of triggering N refreshes.
let refreshPromise: Promise<void> | null = null;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (!error.response) {
      return Promise.reject(error);
    }

    const originalRequest = error.config || {};
    const requestUrl: string = typeof originalRequest.url === "string" ? originalRequest.url : "";
    const isAuthEndpoint =
      requestUrl.includes("/auth/login") ||
      requestUrl.includes("/auth/refresh-token");

    if (
      error.response.status === 401 &&
      !originalRequest._retry &&
      !isAuthEndpoint
    ) {
      originalRequest._retry = true;
      try {
        if (!refreshPromise) {
          refreshPromise = fetch("/api/auth/refresh", {
            method: "POST",
            credentials: "include",
          })
            .then(async (res) => {
              if (!res.ok) throw new Error("refresh failed");
              await useAuthStore.getState().hydrateFromServer();
            })
            .finally(() => {
              refreshPromise = null;
            });
        }
        await refreshPromise;
        originalRequest.headers = originalRequest.headers || {};
        return api(originalRequest);
      } catch {
        /* fall through to force-logout logic below */
      }
    }

    const shouldForceLogout =
      error.response.status === 401 ||
      (error.response.status === 403 && error.response.data?.code === "ACCOUNT_DISABLED");

    if (shouldForceLogout) {
      if (error.response.status === 401) {
        logger.warn("Phiên đăng nhập hết hạn. Đang đăng xuất...");
      } else {
        logger.warn("Tài khoản bị vô hiệu hóa. Đang đăng xuất...");
      }
      if (typeof window !== "undefined") {
        void fetch("/api/auth/logout", {
          method: "POST",
          credentials: "include",
        });
        useAuthStore.setState({ user: null, isLoading: false });
        if (!window.location.pathname.includes("/login")) {
          window.location.href = "/login";
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;
