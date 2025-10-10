import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "../utils/test-utils";
import RegisterPage from "../../pages/RegisterPage";
import { useAuthStore } from "../../store/authStore";

vi.mock("../../store/authStore");
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
      <a href={to}>{children}</a>
    ),
  };
});

describe("RegisterPage", () => {
  const mockRegister = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useAuthStore as any).mockReturnValue({
      register: mockRegister,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  });

  it("renders register page correctly", () => {
    render(<RegisterPage />);

    // Should have "Create account" in both title and button
    const createAccountElements = screen.getAllByText(/create account/i);
    expect(createAccountElements).toHaveLength(2);
    expect(
      screen.getByText(/sign up to get started with your notes/i)
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/create a password/i)
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/confirm your password/i)
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /create account/i })
    ).toBeInTheDocument();
  });

  it("renders login link", () => {
    render(<RegisterPage />);

    expect(screen.getByText(/already have an account/i)).toBeInTheDocument();
    expect(screen.getByText(/sign in/i)).toBeInTheDocument();
  });

  it("renders registration form elements correctly", () => {
    render(<RegisterPage />);

    const nameInput = screen.getByLabelText(/full name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByPlaceholderText(/create a password/i);
    const confirmPasswordInput = screen.getByPlaceholderText(
      /confirm your password/i
    );
    const submitButton = screen.getByRole("button", {
      name: /create account/i,
    });

    expect(nameInput).toBeInTheDocument();
    expect(emailInput).toBeInTheDocument();
    expect(passwordInput).toBeInTheDocument();
    expect(confirmPasswordInput).toBeInTheDocument();
    expect(submitButton).toBeInTheDocument();
    expect(submitButton).toHaveAttribute("type", "submit");

    // Test that the form can accept input
    fireEvent.change(nameInput, { target: { value: "Test User" } });
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.change(confirmPasswordInput, {
      target: { value: "password123" },
    });

    expect(nameInput).toHaveValue("Test User");
    expect(emailInput).toHaveValue("test@example.com");
    expect(passwordInput).toHaveValue("password123");
    expect(confirmPasswordInput).toHaveValue("password123");
  });

  it("displays error message on registration failure", () => {
    (useAuthStore as any).mockReturnValue({
      register: mockRegister,
      isAuthenticated: false,
      isLoading: false,
      error: "Email already exists",
    });

    render(<RegisterPage />);

    expect(screen.getByText(/email already exists/i)).toBeInTheDocument();
  });

  it("shows loading state during registration", () => {
    (useAuthStore as any).mockReturnValue({
      register: mockRegister,
      isAuthenticated: false,
      isLoading: true,
      error: null,
    });

    render(<RegisterPage />);

    const submitButton = screen.getByRole("button", {
      name: /creating account/i,
    });
    expect(submitButton).toBeDisabled();
  });

  it("validates form fields", async () => {
    render(<RegisterPage />);

    const submitButton = screen.getByRole("button", {
      name: /create account/i,
    });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText(/name must be at least 2 characters/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/please enter a valid email address/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/password must be at least 6 characters/i)
      ).toBeInTheDocument();
    });

    expect(mockRegister).not.toHaveBeenCalled();
  });

  it("validates password confirmation", async () => {
    render(<RegisterPage />);

    const passwordInput = screen.getByPlaceholderText(/create a password/i);
    const confirmPasswordInput = screen.getByPlaceholderText(
      /confirm your password/i
    );
    const submitButton = screen.getByRole("button", {
      name: /create account/i,
    });

    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.change(confirmPasswordInput, {
      target: { value: "different123" },
    });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/passwords don't match/i)).toBeInTheDocument();
    });

    expect(mockRegister).not.toHaveBeenCalled();
  });

  it("validates minimum password length", async () => {
    render(<RegisterPage />);

    const passwordInput = screen.getByPlaceholderText(/create a password/i);
    const submitButton = screen.getByRole("button", {
      name: /create account/i,
    });

    fireEvent.change(passwordInput, { target: { value: "123" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText(/password must be at least 6 characters/i)
      ).toBeInTheDocument();
    });

    expect(mockRegister).not.toHaveBeenCalled();
  });

  it("redirects if already authenticated", () => {
    (useAuthStore as any).mockReturnValue({
      register: mockRegister,
      isAuthenticated: true,
      isLoading: false,
      error: null,
    });

    render(<RegisterPage />);

    // Should redirect to dashboard, so register form shouldn't be visible
    expect(screen.queryByText(/create your account/i)).not.toBeInTheDocument();
  });
});
