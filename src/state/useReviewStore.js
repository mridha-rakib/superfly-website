import { create } from "zustand";
import { getErrorMessage } from "../lib/api-error";
import { reviewApi } from "../services/reviewApi";

const parseError = (error, fallback = "Something went wrong. Please try again.") =>
  getErrorMessage(error, fallback);

const initialState = {
  reviews: [],
  isLoading: false,
  error: null,
};

export const useReviewStore = create((set) => ({
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
