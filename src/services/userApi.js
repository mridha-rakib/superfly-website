import { httpClient } from "../lib/httpClient";

const unwrap = (response) => response?.data?.data ?? response?.data ?? response ?? null;

export const userApi = {
  getProfile: async () => {
    const res = await httpClient.get("/user/profile");
    return unwrap(res);
  },
  updateProfile: async (payload) => {
    const res = await httpClient.put("/user/profile", payload);
    return unwrap(res);
  },
};
