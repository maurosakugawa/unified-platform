import { create } from "zustand";

const API_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:3101";

interface User {
  id: number;
  username: string;
}

interface AuthStore {
  user: User | null;
  loading: boolean;
  initialized: boolean;
  error: string;

  checkAuth: () => Promise<void>;
  login: (
    username: string,
    password: string
  ) => Promise<void>;
  register: (
    username: string,
    password: string
  ) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "Não foi possível concluir a operação.";
}

export const useAuthStore =
  create<AuthStore>((set) => ({
    user: null,
    loading: false,
    initialized: false,
    error: "",

    checkAuth: async () => {
      set({ loading: true });

      try {
        const response = await fetch(
          `${API_URL}/auth/me`,
          { credentials: "include" }
        );

        if (response.ok) {
          const user =
            await response.json() as User;

          set({ user });
        } else {
          set({ user: null });
        }
      } catch {
        set({ user: null });
      } finally {
        set({
          loading: false,
          initialized: true,
        });
      }
    },

    login: async (username, password) => {
      set({
        loading: true,
        error: "",
      });

      try {
        const response = await fetch(
          `${API_URL}/auth/login`,
          {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              username,
              password,
            }),
          }
        );

        const data =
          await response.json() as {
            error?: string;
            user?: User;
          };

        if (!response.ok || !data.user) {
          throw new Error(
            data.error || "Login falhou."
          );
        }

        set({
          user: data.user,
          loading: false,
          initialized: true,
        });
      } catch (error) {
        set({
          error: getErrorMessage(error),
          loading: false,
          initialized: true,
        });

        throw error;
      }
    },

    register: async (username, password) => {
      set({
        loading: true,
        error: "",
      });

      try {
        const response = await fetch(
          `${API_URL}/auth/register`,
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              username,
              password,
            }),
          }
        );

        const data =
          await response.json() as {
            error?: string;
          };

        if (!response.ok) {
          throw new Error(
            data.error || "Registro falhou."
          );
        }

        set({
          loading: false,
          initialized: true,
        });
      } catch (error) {
        set({
          error: getErrorMessage(error),
          loading: false,
          initialized: true,
        });

        throw error;
      }
    },

    logout: async () => {
      try {
        await fetch(
          `${API_URL}/auth/logout`,
          {
            method: "POST",
            credentials: "include",
          }
        );
      } finally {
        set({
          user: null,
          initialized: true,
        });
      }
    },

    clearError: () => set({ error: "" }),
  }));
