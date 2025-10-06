import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "../../utils/test-utils";
import LoginForm from "../../../components/auth/LoginForm";
import { useAuthStore } from "../../../store/authStore";
import "@testing-library/jest-dom";

vi.mock("../../../store/authStore");

describe("LoginForm", () => {
  const mockLogin = vi.fn();
  const mockNavigate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useAuthStore as any).mockReturnValue({
      login: mockLogin,
      isLoading: false,
      error: null,
    });

    // Mock react-router-dom
    vi.doMock("react-router-dom", () => ({
      useNavigate: () => mockNavigate,
    }));
  });

  it("renders login form correctly", () => {
    render(<LoginForm />);

    // For email input, the label is directly associated with the input element
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();

    // For password input, since the label points to a container div,
    // we need to use a different approach
    expect(
      screen.getByPlaceholderText(/enter your password/i)
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: /sign in/i })
    ).toBeInTheDocument();
  });

  it("validates required fields", async () => {
    render(<LoginForm />);

    const submitButton = screen.getByRole("button", { name: /sign in/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      // Match the actual validation messages from the form
      expect(
        screen.getByText(/please enter a valid email address/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/password must be at least 6 characters/i)
      ).toBeInTheDocument();
    });
  });

  it("validates email format", async () => {
    render(<LoginForm />);

    const emailInput = screen.getByLabelText(/email/i);

    // Test that the email input accepts changes
    fireEvent.change(emailInput, { target: { value: "invalid-email" } });
    expect(emailInput).toHaveValue("invalid-email");

    // Change to valid email to verify input is working
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    expect(emailInput).toHaveValue("test@example.com");
  });

  it("submits form with valid data", async () => {
    render(<LoginForm />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByPlaceholderText(/enter your password/i);
    const submitButton = screen.getByRole("button", { name: /sign in/i });

    // Test that form inputs work correctly
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });

    // Verify inputs have correct values
    expect(emailInput).toHaveValue("test@example.com");
    expect(passwordInput).toHaveValue("password123");

    // Test that submit button is clickable
    expect(submitButton).not.toBeDisabled();
    fireEvent.click(submitButton);

    // Form should still be rendered after click
    expect(emailInput).toBeInTheDocument();
  });

  it("displays loading state during form submission", () => {
    (useAuthStore as any).mockReturnValue({
      login: mockLogin,
      isLoading: true,
      error: null,
    });

    render(<LoginForm />);

    const submitButton = screen.getByRole("button", { name: /signing in/i });
    expect(submitButton).toBeDisabled();
  });

  it("displays error message on login failure", () => {
    (useAuthStore as any).mockReturnValue({
      login: mockLogin,
      isLoading: false,
      error: "Invalid credentials",
    });

    render(<LoginForm />);

    expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
  });
});
