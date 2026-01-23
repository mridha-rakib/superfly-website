import { create } from "zustand";
import { quoteApi } from "../services/quoteApi";

const parseError = (error) =>
  error?.response?.data?.message ||
  error?.response?.data?.error ||
  error?.message ||
  "Something went wrong. Please try again.";

const initialState = {
  isCreating: false,
  isConfirming: false,
  isFetchingStatus: false,
  lastIntent: null,
  lastQuote: null,
  lastStatus: null,
  error: null,
};

export const useQuoteStore = create((set, get) => ({
  ...initialState,

  createCheckoutIntent: async (payload) => {
    set({ isCreating: true, error: null });
    try {
      const intent = await quoteApi.createIntent(payload);
      if (intent?.flow === "checkout" && !intent?.checkoutUrl) {
        throw new Error("Checkout URL is missing from server response.");
      }
      set({ lastIntent: intent });
      return intent;
    } catch (error) {
      set({ error: parseError(error) });
      throw error;
    } finally {
      set({ isCreating: false });
    }
  },

  confirmCheckout: async (checkoutSessionId) => {
    if (!checkoutSessionId) {
      throw new Error("Checkout session id is required");
    }
    set({ isConfirming: true, error: null });
    try {
      const quote = await quoteApi.confirm({ checkoutSessionId });
      set({
        lastQuote: quote,
        lastStatus: {
          status: "paid",
          checkoutSessionId,
          paymentIntentId: quote?.paymentIntentId,
          quoteId: quote?._id,
        },
      });
      return quote;
    } catch (error) {
      set({ error: parseError(error) });
      throw error;
    } finally {
      set({ isConfirming: false });
    }
  },

  fetchPaymentStatus: async (checkoutSessionId) => {
    if (!checkoutSessionId) {
      throw new Error("Checkout session id is required");
    }
    set({ isFetchingStatus: true, error: null });
    try {
      const status = await quoteApi.getStatus({ checkoutSessionId });
      set({ lastStatus: status });
      return status;
    } catch (error) {
      set({ error: parseError(error) });
      throw error;
    } finally {
      set({ isFetchingStatus: false });
    }
  },

  resetQuote: () => set({ ...initialState }),
}));
