import { httpClient } from "../lib/httpClient";

const unwrap = (response) => response?.data ?? response;

export const cleaningServiceApi = {
  listActive: async () => {
    const response = await httpClient.get("/services");
    return unwrap(response);
  },
};
