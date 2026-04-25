import { httpClient } from "../lib/httpClient";

const unwrap = (response) =>
  response?.data?.data ?? response?.data ?? response ?? null;

export const legalContentApi = {
  getBySlug: async (slug) => {
    const response = await httpClient.get(`/legal-content/${slug}`);
    return unwrap(response);
  },
};
