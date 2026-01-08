import api from "./api";

const authService = {
  // Register new user
  register: async (userData) => {
    try {
      const response = await api.post("/auth/register", userData);

      // Store token and user info
      if (response.data.access_token) {
        localStorage.setItem("token", response.data.access_token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
      }
      if (response.data.refresh_token) {
        localStorage.setItem("refresh_token", response.data.refresh_token);
      }

      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Login user
  login: async (credentials) => {
    try {
      const response = await api.post("/auth/login", credentials);

      console.log("Login response:", response.data);
      console.log("Access token:", response.data.access_token);

      // Store token and user info
      if (response.data.access_token) {
        localStorage.setItem("token", response.data.access_token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        console.log(
          "Token stored in localStorage:",
          localStorage.getItem("token")
        );
      } else {
        console.error("No access_token in response!");
      }
      if (response.data.refresh_token) {
        localStorage.setItem("refresh_token", response.data.refresh_token);
      }

      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Logout user
  logout: async () => {
    try {
      await api.post("/auth/logout");

      // Clear local storage
      localStorage.removeItem("token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user");
      localStorage.removeItem("cart");

      return { success: true };
    } catch (error) {
      // Clear local storage even if API call fails
      localStorage.removeItem("token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user");
      localStorage.removeItem("cart");

      throw error;
    }
  },

  // Get current user from localStorage
  getCurrentUser: () => {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  },

  // Check if user is logged in
  isAuthenticated: () => {
    return !!localStorage.getItem("token");
  },

  // Get auth token
  getToken: () => {
    return localStorage.getItem("token");
  },

  // Verify email (if backend implements this)
  verifyEmail: async (token) => {
    try {
      const response = await api.post("/auth/verify-email", { token });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Request password reset
  requestPasswordReset: async (email) => {
    try {
      const response = await api.post("/auth/reset-password", { email });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Reset password with token
  resetPassword: async (token, newPassword) => {
    try {
      const response = await api.post("/auth/reset-password/confirm", {
        token,
        new_password: newPassword,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default authService;
