import { httpClient } from "../lib/httpClient";

const unwrap = (response) => response?.data?.data ?? response?.data ?? response ?? null;

export const cleaningReportApi = {
  submit: async (quoteId, payload) => {
    const formData = new FormData();
    if (payload.arrivalTime) formData.append("arrivalTime", payload.arrivalTime);
    if (payload.startTime) formData.append("startTime", payload.startTime);
    if (payload.endTime) formData.append("endTime", payload.endTime);
    if (payload.notes) formData.append("notes", payload.notes);

    (payload.beforePhotos || []).forEach((file) => {
      formData.append("beforePhotos", file);
    });
    (payload.afterPhotos || []).forEach((file) => {
      formData.append("afterPhotos", file);
    });

    const response = await httpClient.post(
      `/cleaning-reports/quotes/${quoteId}`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return unwrap(response);
  },
};
