import axios from "axios";

const api = axios.create({
  baseURL: "/api/proxy",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const requestUrl = String(originalRequest?.url || "");

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !requestUrl.includes("/auth/")
    ) {
      originalRequest._retry = true;

      try {
        const refreshRes = await fetch("/api/auth/refresh", {
          method: "POST",
          credentials: "include",
        });
        if (!refreshRes.ok) {
          throw new Error("refresh failed");
        }
        return api(originalRequest);
      } catch {
        if (
          typeof window !== "undefined" &&
          !window.location.pathname.includes("/login")
        ) {
          await fetch("/api/auth/logout", {
            method: "POST",
            credentials: "include",
          });
          window.location.href = "/login";
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;
