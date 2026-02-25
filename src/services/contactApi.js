import { httpClient } from "../lib/httpClient";

const unwrap = (response) =>
  response?.data?.data ?? response?.data ?? response ?? null;

export const contactApi = {
  sendPublicMessage: async (payload) => {
    const response = await httpClient.post("/contact", payload);
    return unwrap(response);
  },
};

