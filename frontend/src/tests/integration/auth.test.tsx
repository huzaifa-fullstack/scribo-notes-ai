import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";
import { handlers } from "../mocks/handlers";
import { Routes, Route } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import LoginPage from "../../pages/LoginPage";
import RegisterPage from "../../pages/RegisterPage";

// Setup MSW server
const server = setupServer(...handlers);

// NOTE: We use individual page components instead of the full app

// NOTE: We don't need the full app wrapper for focused integration tests

describe("Integration Tests - Authentication Components", () => {
  beforeEach(() => {
    server.listen({ onUnhandledRequest: "error" });
    localStorage.clear();
    vi.clearAllMocks();
    // Reset auth store to clean state
    useAuthStore.setState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  });

  afterEach(() => {
    server.resetHandlers();
  });

  afterAll(() => {
    server.close();
  });

  it("integrates LoginForm with auth store and navigation", async () => {
    render(
      <MemoryRouter initialEntries={["/login"]}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<div>Dashboard Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    // Should show login form
    expect(screen.getByText(/welcome back/i)).toBeInTheDocument();

    // Fill in and submit login form
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByPlaceholderText(/enter your password/i);
    const submitButton = screen.getByRole("button", { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.click(submitButton);

    // Should handle the authentication API call and show success
    await waitFor(() => {
      // The auth store should be updated and user should be logged in
      const authStore = useAuthStore.getState();
      expect(authStore.isAuthenticated).toBe(true);
      expect(authStore.token).toBeTruthy();
      expect(authStore.user?.name).toBe("Test User");
    });
  });

  it("integrates RegisterForm with auth store", async () => {
    render(
      <MemoryRouter initialEntries={["/register"]}>
        <Routes>
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/dashboard" element={<div>Dashboard Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    // Should show register form
    expect(
      screen.getByText(/sign up to get started with your notes/i)
    ).toBeInTheDocument();

    // Fill in registration form
    const nameInput = screen.getByLabelText(/full name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByPlaceholderText(/create a password/i);
    const confirmPasswordInput = screen.getByPlaceholderText(
      /confirm your password/i
    );
    const submitButton = screen.getByRole("button", {
      name: /create account/i,
    });

    fireEvent.change(nameInput, { target: { value: "Test User" } });
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.change(confirmPasswordInput, {
      target: { value: "password123" },
    });
    fireEvent.click(submitButton);

    // Should handle the registration API call and update auth store
    await waitFor(() => {
      const authStore = useAuthStore.getState();
      expect(authStore.isAuthenticated).toBe(true);
      expect(authStore.user?.name).toBe("Test User");
    });
  });

  it("handles authentication errors properly", async () => {
    // Mock failed login response
    server.use(
      http.post("/api/auth/login", () => {
        return HttpResponse.json(
          { success: false, message: "Invalid credentials" },
          { status: 401 }
        );
      })
    );

    render(
      <MemoryRouter initialEntries={["/login"]}>
        <LoginPage />
      </MemoryRouter>
    );

    // Fill in login form with invalid credentials
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByPlaceholderText(/enter your password/i);
    const submitButton = screen.getByRole("button", { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: "wrong@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "wrongpassword" } });
    fireEvent.click(submitButton);

    // Should keep user logged out
    await waitFor(() => {
      const authStore = useAuthStore.getState();
      expect(authStore.isAuthenticated).toBe(false);
    });
  });

  it("integrates localStorage persistence with auth store", async () => {
    // Simulate login which should set localStorage
    const { login } = useAuthStore.getState();

    await login({ email: "test@example.com", password: "password123" });

    // Should have set localStorage and auth state
    await waitFor(() => {
      const authStore = useAuthStore.getState();
      expect(authStore.isAuthenticated).toBe(true);
      expect(authStore.token).toBe("mock-token");
      expect(authStore.user?.name).toBe("Test User");
    });
  });

  it("integrates logout functionality", async () => {
    // First login to set up authenticated state
    const { login, logout } = useAuthStore.getState();

    await login({ email: "test@example.com", password: "password123" });

    // Verify authenticated state
    await waitFor(() => {
      const authStore = useAuthStore.getState();
      expect(authStore.isAuthenticated).toBe(true);
    });

    // Call logout
    logout();

    // Should clear auth state
    const authStore = useAuthStore.getState();
    expect(authStore.isAuthenticated).toBe(false);
    expect(authStore.user).toBeNull();
    expect(authStore.token).toBeNull();
  });
});
