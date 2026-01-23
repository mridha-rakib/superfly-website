import { httpClient, refreshClient } from "../lib/httpClient";

const unwrap = (response) => response?.data ?? response;

export const authApi = {
  register: async (payload) => {
    // client self-signup; backend enforces role client
    const response = await httpClient.post("/auth/register", payload);
    return unwrap(response);
  },

  login: async (payload) => {
    const response = await httpClient.post("/auth/login", payload);
    return unwrap(response);
  },

  refreshAccessToken: async () => {
    const response = await refreshClient.post("/auth/refresh-token");
    return unwrap(response);
  },

  logout: async () => {
    const response = await httpClient.post("/auth/logout");
    return unwrap(response);
  },

  verifyEmail: async (payload) => {
    const response = await httpClient.post("/auth/verify-email", payload);
    return unwrap(response);
  },

  resendVerification: async (payload) => {
    const response = await httpClient.post("/auth/resend-verification", payload);
    return unwrap(response);
  },

  verifyOtp: async (payload) => {
    const response = await httpClient.post("/auth/verify-otp", payload);
    return unwrap(response);
  },

  requestPasswordReset: async (payload) => {
    const response = await httpClient.post("/auth/request-reset-password", payload);
    return unwrap(response);
  },

  resetPassword: async (payload) => {
    const response = await httpClient.post("/auth/reset-password", payload);
    return unwrap(response);
  },

  changePassword: async (payload) => {
    const response = await httpClient.put("/auth/change-password", payload);
    return unwrap(response);
  },

  getProfile: async () => {
    const response = await httpClient.get("/user/profile");
    return unwrap(response);
  },
};
