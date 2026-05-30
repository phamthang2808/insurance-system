import type { User } from "@/types";
import { create } from "zustand";

interface AuthStore {
  user: User | null;
  authToken: string | null;
  userEmail: string | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  setAuthToken: (token: string | null) => void;
  setUserEmail: (email: string | null) => void;
  logout: () => void;
  initialize: () => void; // Initialize from localStorage
}

// Helper to initialize from localStorage
const initializeFromStorage = (): {
  user: User | null;
  authToken: string | null;
  userEmail: string | null;
  isAuthenticated: boolean;
} => {
  try {
    const storedAccessToken = localStorage.getItem("accessToken");
    const storedUserEmail = localStorage.getItem("userEmail");
    const storedUser = localStorage.getItem("user");

    if (storedAccessToken && storedUser && storedUserEmail) {
      const user = JSON.parse(storedUser);
      return {
        user,
        authToken: storedAccessToken,
        userEmail: storedUserEmail,
        isAuthenticated: true,
      };
    }
  } catch (error) {
    console.error("Failed to restore auth state from localStorage:", error);
    // Clear corrupted data
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    localStorage.removeItem("userEmail");
  }

  return {
    user: null,
    authToken: null,
    userEmail: null,
    isAuthenticated: false,
  };
};

export const useAuthStore = create<AuthStore>((set) => {
  const initialState = initializeFromStorage();

  return {
    ...initialState,
    setUser: (user) => set({ user, isAuthenticated: !!user }),
    setAuthToken: (token) => set({ authToken: token }),
    setUserEmail: (email) => set({ userEmail: email }),
    logout: () =>
      set({
        user: null,
        authToken: null,
        userEmail: null,
        isAuthenticated: false,
      }),
    initialize: () => {
      const state = initializeFromStorage();
      set(state);
    },
  };
});
