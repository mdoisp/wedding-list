import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  CouplePublicResponse,
  LoginRequest,
  RegisterRequest,
  getMe,
  loginCouple,
  refreshTokens,
  registerCouple,
} from "../api/auth";
import { getCookie, removeCookie, setCookie } from "../cookies";

interface AuthState {
  couple: CouplePublicResponse | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      couple: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      clearError: () => set({ error: null }),

      login: async (data: LoginRequest) => {
        set({ isLoading: true, error: null });
        try {
          const tokens = await loginCouple(data);
          setCookie("access_token", tokens.access_token);
          setCookie("refresh_token", tokens.refresh_token);

          // Get authenticated couple's profile
          const couple = await getMe();

          set({
            couple,
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (err: unknown) {
          const message =
            err instanceof Error ? err.message : "Erro ao realizar login";
          set({
            isLoading: false,
            error: message,
            isAuthenticated: false,
          });
          throw err;
        }
      },

      register: async (data: RegisterRequest) => {
        set({ isLoading: true, error: null });
        try {
          await registerCouple(data);

          // Automatically log in after registration
          await get().login({
            email: data.email,
            password: data.password,
          });
        } catch (err: unknown) {
          const message =
            err instanceof Error ? err.message : "Erro ao realizar cadastro";
          set({
            isLoading: false,
            error: message,
          });
          throw err;
        }
      },

      logout: () => {
        removeCookie("access_token");
        removeCookie("refresh_token");
        set({
          couple: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          error: null,
          isLoading: false,
        });
      },

      checkAuth: async () => {
        const token = getCookie("access_token");
        const refresh = getCookie("refresh_token");

        if (!token && !refresh) {
          set({ isAuthenticated: false, couple: null });
          return;
        }

        try {
          if (token) {
            const couple = await getMe();
            set({ couple, isAuthenticated: true, accessToken: token });
          } else if (refresh) {
            const newTokens = await refreshTokens(refresh);
            setCookie("access_token", newTokens.access_token);
            setCookie("refresh_token", newTokens.refresh_token);
            const couple = await getMe();
            set({
              couple,
              accessToken: newTokens.access_token,
              refreshToken: newTokens.refresh_token,
              isAuthenticated: true,
            });
          }
        } catch {
          // Token expired or invalid
          get().logout();
        }
      },
    }),
    {
      name: "wedding-list-auth",
      partialize: (state) => ({
        couple: state.couple,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
