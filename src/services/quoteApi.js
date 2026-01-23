import { httpClient } from "../lib/httpClient";

const unwrap = (response) =>
  response?.data?.data ?? response?.data ?? response ?? null;

export const quoteApi = {
  createIntent: async (payload) => {
    const response = await httpClient.post("/quotes/intent", payload);
    return unwrap(response);
  },

  confirm: async (payload) => {
    const response = await httpClient.post("/quotes/confirm", payload);
    return unwrap(response);
  },

  listCleanerAssigned: async (params) => {
    const response = await httpClient.get("/quotes/cleaner/assigned", {
      params,
    });
    return unwrap(response);
  },

  getStatus: async (params) => {
    const response = await httpClient.get("/quotes/payment-status", {
      params,
    });
    return unwrap(response);
  },
};
