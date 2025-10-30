import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Lock, Mail, User, Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import loginBg from "../../assets/picture/login-background1.jpg";
import ScriboLogo from "../icons/ScriboLogo";
import GoogleSignInButton from "./GoogleSignInButton";
import { useAuthStore } from "../../store/authStore";

// Login validation schema
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// Register validation schema
const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .regex(/[A-Z]/, "Password must contain at least one capital letter")
      .regex(
        /[!@#$%^&*(),.?":{}|<>]/,
        "Password must contain at least one special character"
      ),
    confirmPassword: z.string().min(6, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

const SlidingAuthPage = () => {
  // Keep URL query in sync for robust state across remounts
  const [searchParams, setSearchParams] = useSearchParams();
  const initialMode = searchParams.get("mode");
  // Persist form state across React Strict Mode remounts and page reloads
  const [isSignIn, setIsSignIn] = useState(() => {
    if (initialMode) {
      return initialMode !== "signup"; // signin by default when unknown
    }
    const saved = sessionStorage.getItem("authFormState");
    return saved === "signup" ? false : true;
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [hasRegistrationError, setHasRegistrationError] = useState(false);
  const {
    login,
    register: registerUser,
    isLoading,
    error,
    clearError,
  } = useAuthStore();

  // Save form state to sessionStorage and URL whenever it changes
  useEffect(() => {
    sessionStorage.setItem("authFormState", isSignIn ? "signin" : "signup");
    // reflect in URL without navigation
    const current = searchParams.get("mode");
    const next = isSignIn ? "signin" : "signup";
    if (current !== next) {
      setSearchParams({ mode: next }, { replace: true } as any);
    }
  }, [isSignIn, searchParams, setSearchParams]);

  // Helper: switch to sign in deterministically
  const switchToSignIn = () => {
    setIsSignIn(true);
    try {
      sessionStorage.setItem("authFormState", "signin");
    } catch {}
    setSearchParams({ mode: "signin" }, { replace: true } as any);
  };

  // Login form
  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Register form
  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  // Clear error when user starts typing in login form
  useEffect(() => {
    const subscription = loginForm.watch((_value, { type }) => {
      if (error && type === "change") {
        clearError();
      }
    });
    return () => subscription.unsubscribe();
  }, [loginForm, error, clearError]);

  // Clear error when user starts typing in register form
  useEffect(() => {
    const subscription = registerForm.watch((_value, { type }) => {
      if (error && type === "change") {
        clearError();
      }
    });
    return () => subscription.unsubscribe();
  }, [registerForm, error, clearError]);

  const onLoginSubmit = async (data: LoginFormData) => {
    try {
      await login(data);
      toast.success("Welcome back! You have been successfully logged in.");
    } catch (error) {
      // Error is already set in the store
    }
  };

  const onRegisterSubmit = async (data: RegisterFormData) => {
    setHasRegistrationError(false);

    try {
      await registerUser({
        name: data.name,
        email: data.email,
        password: data.password,
      });

      // Registration successful - clear any errors and flags
      clearError();
      setHasRegistrationError(false);

      // Show success toast
      toast.success(
        "Account created successfully! Please log in with your credentials.",
        {
          duration: 4000,
        }
      );

      // Reset the register form
      registerForm.reset();

      // Switch to sign-in view after successful registration
      switchToSignIn();
    } catch (error) {
      // Error is already set in the store
      setHasRegistrationError(true);
    }
  };

  // Handler for manually switching to Sign Up form
  const handleSwitchToSignUp = () => {
    clearError(); // Clear any existing errors
    setHasRegistrationError(false); // Clear registration error flag
    setShowPassword(false);
    setShowConfirmPassword(false);
    setIsSignIn(false);
    try {
      sessionStorage.setItem("authFormState", "signup");
    } catch {}
    setSearchParams({ mode: "signup" }, { replace: true } as any);
  };

  // Handler for manually switching to Sign In form
  const handleSwitchToSignIn = () => {
    clearError(); // Clear any existing errors
    setHasRegistrationError(false); // Clear registration error flag
    setShowPassword(false);
    setShowConfirmPassword(false);
    switchToSignIn();
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        backgroundImage: `url(${loginBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="relative w-full max-w-5xl h-[600px] bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Sliding Panel - Animated Gradient Background */}
        <div
          className="absolute top-0 w-1/2 h-full overflow-hidden transition-all duration-700 ease-in-out z-10"
          style={{
            left: isSignIn ? "0" : "50%",
          }}
        >
          {/* Gradient 1: Sign In state (teal-800 → teal-500) */}
          <div
            className={`absolute inset-0 bg-gradient-to-br from-teal-800 to-teal-500 transition-opacity duration-700 ease-in-out ${
              isSignIn ? "opacity-100" : "opacity-0"
            }`}
            style={{ willChange: "opacity" }}
          ></div>

          {/* Gradient 2: Sign Up state (teal-500 → teal-800) */}
          <div
            className={`absolute inset-0 bg-gradient-to-br from-teal-500 to-teal-800 transition-opacity duration-700 ease-in-out ${
              isSignIn ? "opacity-0" : "opacity-100"
            }`}
            style={{ willChange: "opacity" }}
          ></div>

          {/* Content (shared for both states) */}
          <div className="relative z-10 h-full flex flex-col items-center justify-center text-white p-12">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-8">
              <ScriboLogo size={48} />
              <span className="text-2xl font-bold">Scribo Notes</span>
            </div>

            {isSignIn ? (
              <>
                <h2 className="text-4xl font-bold mb-4">Good to See You!</h2>
                <p className="text-center text-white/90 mb-8 max-w-xs">
                  New to Scribo? Create an account to get started
                </p>
                <button
                  onClick={handleSwitchToSignUp}
                  className="px-12 py-3 border-2 border-white rounded-full font-semibold hover:bg-white hover:text-teal-500 transition-all duration-300"
                >
                  SIGN UP
                </button>
              </>
            ) : (
              <>
                <h2 className="text-4xl font-bold mb-4">Join Scribo!</h2>
                <p className="text-center text-white/90 mb-8 max-w-xs">
                  Already have an account? Sign in to continue
                </p>
                <button
                  onClick={handleSwitchToSignIn}
                  className="px-12 py-3 border-2 border-white rounded-full font-semibold hover:bg-white hover:text-teal-500 transition-all duration-300"
                >
                  SIGN IN
                </button>
              </>
            )}
          </div>
        </div>

        {/* Sign In Form */}
        <div
          className={`absolute top-0 w-1/2 h-full transition-all duration-700 ease-in-out ${
            isSignIn ? "right-0 opacity-100" : "right-full opacity-0"
          }`}
        >
          <div className="h-full flex flex-col items-center justify-center p-12">
            <h2 className="text-3xl font-bold text-teal-500 mb-2">
              Sign in to Scribo
            </h2>

            {/* Form */}
            <form
              onSubmit={loginForm.handleSubmit(onLoginSubmit)}
              className="w-full max-w-sm space-y-4 mt-6"
            >
              <div>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    placeholder="Email"
                    className="w-full pl-12 pr-4 py-3 bg-gray-100 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    {...loginForm.register("email")}
                  />
                </div>
                {loginForm.formState.errors.email && (
                  <p className="mt-1 text-sm text-red-600">
                    {loginForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    className="w-full pl-12 pr-12 py-3 bg-gray-100 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    {...loginForm.register("password")}
                  />
                  <button
                    type="button"
                    className="absolute right-4 top-1/2 -translate-y-1/2"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
                {loginForm.formState.errors.password && (
                  <p className="mt-1 text-sm text-red-600">
                    {loginForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              {error && isSignIn && !hasRegistrationError && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg"
                >
                  {error}
                </motion.div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-teal-500 text-white rounded-full font-semibold hover:bg-teal-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </span>
                ) : (
                  "SIGN IN"
                )}
              </button>

              <GoogleSignInButton />
            </form>
          </div>
        </div>

        {/* Sign Up Form */}
        <div
          className={`absolute top-0 w-1/2 h-full transition-all duration-700 ease-in-out ${
            isSignIn ? "left-full opacity-0" : "left-0 opacity-100"
          }`}
        >
          <div className="h-full flex flex-col items-center justify-center p-12">
            <h2 className="text-3xl font-bold text-teal-500 mb-2">
              Create Account
            </h2>

            {/* Form */}
            <form
              onSubmit={registerForm.handleSubmit(onRegisterSubmit)}
              className="w-full max-w-sm space-y-4 mt-6"
            >
              <div>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Full Name"
                    className="w-full pl-12 pr-4 py-3 bg-gray-100 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    {...registerForm.register("name")}
                  />
                </div>
                {registerForm.formState.errors.name && (
                  <p className="mt-1 text-sm text-red-600">
                    {registerForm.formState.errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    placeholder="Email"
                    className="w-full pl-12 pr-4 py-3 bg-gray-100 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    {...registerForm.register("email")}
                  />
                </div>
                {registerForm.formState.errors.email && (
                  <p className="mt-1 text-sm text-red-600">
                    {registerForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    className="w-full pl-12 pr-12 py-3 bg-gray-100 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    {...registerForm.register("password")}
                  />
                  <button
                    type="button"
                    className="absolute right-4 top-1/2 -translate-y-1/2"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
                {registerForm.formState.errors.password && (
                  <p className="mt-1 text-sm text-red-600">
                    {registerForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              <div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm Password"
                    className="w-full pl-12 pr-12 py-3 bg-gray-100 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    {...registerForm.register("confirmPassword")}
                  />
                  <button
                    type="button"
                    className="absolute right-4 top-1/2 -translate-y-1/2"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
                {registerForm.formState.errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">
                    {registerForm.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>

              {error && (hasRegistrationError || !isSignIn) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg"
                >
                  {error}
                </motion.div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-teal-500 text-white rounded-full font-semibold hover:bg-teal-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </span>
                ) : (
                  "SIGN UP"
                )}
              </button>

              <GoogleSignInButton />
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SlidingAuthPage;
