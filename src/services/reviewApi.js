import { httpClient } from "../lib/httpClient";

const unwrap = (response) =>
  response?.data?.data ?? response?.data ?? response ?? null;

export const reviewApi = {
  list: async () => {
    const response = await httpClient.get("/reviews");
    return unwrap(response);
  },
  create: async (payload) => {
    const response = await httpClient.post("/reviews", payload);
    return unwrap(response);
  },
};
