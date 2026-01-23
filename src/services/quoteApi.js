import { httpClient } from "../lib/httpClient";

const unwrap = (response) => response?.data ?? response;

export const quoteApi = {
  createIntent: async (payload) => {
    const response = await httpClient.post("/quotes/intent", payload);
    return unwrap(response);
  },
};

