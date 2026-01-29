import { create } from "zustand";
import { reviewApi } from "../services/reviewApi";

const parseError = (error) =>
  error?.response?.data?.message ||
  error?.response?.data?.error ||
  error?.message ||
  "Something went wrong. Please try again.";

const initialState = {
  reviews: [],
  isLoading: false,
  error: null,
};

export const useReviewStore = create((set, get) => ({
  ...initialState,

  fetchReviews: async () => {
    set({ isLoading: true, error: null });
    try {
      const reviews = await reviewApi.list();
      set({ reviews });
      return reviews;
    } catch (error) {
      const message = parseError(error);
      set({ error: message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  addReview: async (payload) => {
    const review = await reviewApi.create(payload);
    set((state) => ({
      reviews: [review, ...(state.reviews || [])],
    }));
    return review;
  },
}));
