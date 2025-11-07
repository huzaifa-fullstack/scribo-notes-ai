import { describe, it, expect, beforeEach, vi } from "vitest";
import { useAuthStore } from "../../store/authStore";
import api from "../../services/api";

vi.mock("../../services/api");

describe("Auth Store", () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe("login", () => {
    it("should login successfully", async () => {
      const mockResponse = {
        data: {
          token: "test-token",
          user: {
            _id: "1",
            name: "Test User",
            email: "test@example.com",
            role: "user",
          },
        },
      };

      (api.post as any).mockResolvedValue(mockResponse);

      await useAuthStore.getState().login({
        email: "test@example.com",
        password: "password123",
      });

      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(true);
      expect(state.user).toEqual(mockResponse.data.user);
      expect(state.token).toBe("test-token");
      expect(state.error).toBeNull();
    });

    it("should handle login error", async () => {
      (api.post as any).mockRejectedValue({
        response: { data: { error: "Invalid credentials" } },
      });

      await expect(
        useAuthStore.getState().login({
          email: "test@example.com",
          password: "wrong",
        })
      ).rejects.toThrow();

      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(false);
      expect(state.error).toBe("Invalid credentials");
    });
  });

  describe("register", () => {
    it("should register successfully", async () => {
      const mockResponse = {
        data: {
          token: "test-token",
          user: {
            _id: "1",
            name: "New User",
            email: "new@example.com",
            role: "user",
          },
        },
      };

      (api.post as any).mockResolvedValue(mockResponse);

      await useAuthStore.getState().register({
        name: "New User",
        email: "new@example.com",
        password: "password123",
      });

      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(true);
      expect(state.user?.name).toBe("New User");
    });
  });

  describe("logout", () => {
    it("should logout successfully", async () => {
      useAuthStore.setState({
        user: { _id: "1", name: "Test", email: "test@test.com" } as any,
        token: "token",
        isAuthenticated: true,
      });

      useAuthStore.getState().logout();

      // Wait for the setTimeout in logout (300ms)
      await new Promise((resolve) => setTimeout(resolve, 350));

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });
  });

  describe("clearError", () => {
    it("should clear error", () => {
      useAuthStore.setState({ error: "Some error" });

      useAuthStore.getState().clearError();

      expect(useAuthStore.getState().error).toBeNull();
    });
  });
});
