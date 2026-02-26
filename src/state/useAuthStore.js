import { create } from "zustand";
import { persist } from "zustand/middleware";
import { configureHttpClient } from "../lib/httpClient";
import { authApi } from "../services/authApi";

const parseError = (error) =>
  error?.response?.data?.message ||
  error?.response?.data?.error ||
  error?.message ||
  "Something went wrong. Please try again.";

const normalizeUser = (u) => {
  if (!u) return null;
  const avatar =
    u.profileImage ||
    u.profileImageUrl ||
    u.avatar ||
    u.photoUrl ||
    u.photo ||
    null;
  return { ...u, avatar };
};

const initialState = {
  user: null,
  role: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: false,
  isHydrating: false,
  error: null,
};

export const useAuthStore = create(
  persist(
    (set, get) => ({
      ...initialState,

      login: async (payload) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.login(payload);
          const user = normalizeUser(response?.data?.user || response?.user);
          const accessToken =
            response?.data?.accessToken || response?.accessToken || null;

          if (!user || !accessToken) {
            throw new Error("Login failed: missing token or user.");
          }

          set({
            user,
            role: user?.role || null,
            accessToken,
            isAuthenticated: Boolean(user && accessToken),
            isLoading: false,
          });
          return user;
        } catch (error) {
          set({ isLoading: false, error: parseError(error) });
          throw error;
        }
      },

      logout: async () => {
        try {
          await authApi.logout();
        } catch (error) {
          // ignore API errors on logout
        }
        set({ ...initialState });
      },

      forceLogout: () => set({ ...initialState }),

      refreshAccessToken: async () => {
        const response = await authApi.refreshAccessToken();
        const accessToken =
          response?.data?.accessToken || response?.accessToken || null;
        if (accessToken) {
          set({
            accessToken,
            isAuthenticated: true,
          });
        }
        return accessToken;
      },

      fetchProfile: async () => {
        const profile = await authApi.getProfile();
        const user = normalizeUser(profile?.data || profile || null);
        set({
          user,
          role: user?.role || null,
          isAuthenticated: Boolean(user && get().accessToken),
        });
        return user;
      },

      bootstrap: async () => {
        const { accessToken, isHydrating } = get();
        if (isHydrating) return;
        if (!accessToken) {
          set({ ...initialState });
          return;
        }
        set({ isHydrating: true });
        try {
          await get().fetchProfile();
        } catch (error) {
          set({ ...initialState });
        } finally {
          set({ isHydrating: false });
        }
      },

      setUser: (user) =>
        set({
          user: normalizeUser(user),
          role: user?.role || null,
          isAuthenticated: Boolean(user && get().accessToken),
        }),

      clearError: () => set({ error: null }),
    }),
    {
      name: "superfly-auth",
      partialize: (state) => ({
        user: state.user,
        role: state.role,
        accessToken: state.accessToken,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        const isAuthed = Boolean(state.accessToken);
        state.isAuthenticated = isAuthed;
      },
    }
  )
);

configureHttpClient({
  getAccessTokenFn: () => useAuthStore.getState().accessToken,
  refreshAccessTokenFn: () => useAuthStore.getState().refreshAccessToken(),
  onLogout: () => useAuthStore.getState().forceLogout(),
});
