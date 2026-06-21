import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: import.meta.env.MODE === "development" ? "http://localhost:3000/api" : "/api",
  withCredentials: true,
});

axiosInstance.interceptors.request.use(
  async (config) => {
    try {
      // Access Clerk instance if available in window object
      const clerk = window.Clerk;
      if (clerk && clerk.session) {
        const token = await clerk.session.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    } catch (error) {
      console.error("Error setting auth header in interceptor:", error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
