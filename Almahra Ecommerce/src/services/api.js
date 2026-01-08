import axios from "axios";

// Base URL - will use local backend for development, cloud for production
const API_BASE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : "http://localhost:5000/api";

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Important for cookies/sessions
});

// Request interceptor - Add JWT token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Token refresh function
const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem("refresh_token");
  if (!refreshToken) {
    return null;
  }

  try {
    const response = await axios.post(
      `${API_BASE_URL}/auth/refresh`,
      {},
      {
        headers: {
          Authorization: `Bearer ${refreshToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    const { access_token } = response.data;
    localStorage.setItem("token", access_token);
    return access_token;
  } catch (error) {
    console.error("Token refresh failed:", error);
    return null;
  }
};

// Response interceptor - Handle errors globally
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response) {
      // Server responded with error
      const { status, data } = error.response;

      // Handle expired token - attempt refresh
      if (
        (status === 401 || status === 422) &&
        data?.code === "token_expired" &&
        !originalRequest._retry
      ) {
        originalRequest._retry = true;

        const newToken = await refreshAccessToken();
        if (newToken) {
          // Retry the original request with new token
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        }
      }

      if (status === 401 || status === 422) {
        // Unauthorized or token invalid - clear and redirect to login
        localStorage.removeItem("token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      } else if (status === 403) {
        console.error("Access forbidden:", data.message);
      } else if (status === 404) {
        console.error("Resource not found:", data.message);
      } else if (status === 500) {
        console.error("Server error:", data.message);
      }

      return Promise.reject(error.response.data);
    } else if (error.request) {
      // Request made but no response
      console.error("Network error - Backend not responding");
      return Promise.reject({
        message:
          "Cannot connect to server. Make sure backend is running on http://localhost:5000",
      });
    } else {
      // Something else happened
      console.error("Error:", error.message);
      return Promise.reject(error);
    }
  }
);

export default api;
