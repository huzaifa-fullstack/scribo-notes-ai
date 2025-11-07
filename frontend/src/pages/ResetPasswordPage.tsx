import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Lock,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../components/ui/form";
import { useToast } from "../components/ui/use-toast";
import OceanBackground from "../components/common/OceanBackground";
import { useTheme } from "../context/ThemeContext";
import { resetPassword } from "../services/api";

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(
        /[!@#$%^&*(),.?":{}|<>]/,
        "Password must contain at least one special character"
      ),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

const ResetPasswordPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [tokenError, setTokenError] = useState(false);

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { theme } = useTheme();
  const isDarkMode = theme === "dark";

  const token = searchParams.get("token");

  useEffect(() => {
    // Check if token exists in URL
    if (!token) {
      setTokenError(true);
      toast({
        title: "Invalid Link",
        description: "This password reset link is invalid or has expired.",
        variant: "destructive",
      });
    }
  }, [token, toast]);

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      toast({
        title: "Error",
        description:
          "No reset token found. Please request a new password reset link.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await resetPassword(token, data.password);

      setResetSuccess(true);
      toast({
        title: "Success!",
        description: "Your password has been reset successfully.",
      });

      // Redirect to login page after 3 seconds
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error ||
        "Failed to reset password. Please try again.";

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });

      // If token is invalid/expired, show error state
      if (
        errorMessage.toLowerCase().includes("invalid") ||
        errorMessage.toLowerCase().includes("expired")
      ) {
        setTokenError(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Dynamic theme classes
  const themeClasses = {
    bg: isDarkMode
      ? "bg-slate-950"
      : "bg-gradient-to-br from-gray-50 via-blue-50/30 to-teal-50/20",
    card: isDarkMode
      ? "bg-gray-900 border-gray-700"
      : "bg-white border-teal-100/50",
    cardText: isDarkMode ? "text-white" : "text-gray-900",
    cardSubtext: isDarkMode ? "text-gray-400" : "text-gray-600",
    input: isDarkMode
      ? "bg-gray-800 border-gray-600 text-white placeholder:text-gray-500"
      : "bg-white border-gray-200 text-gray-900 placeholder:text-gray-500",
    buttonBg: isDarkMode
      ? "bg-teal-600 hover:bg-teal-700"
      : "bg-teal-600 hover:bg-teal-700",
    iconColor: isDarkMode ? "text-teal-400" : "text-teal-600",
    errorBox: isDarkMode
      ? "bg-red-900/30 border-red-700"
      : "bg-red-50 border-red-200",
    errorText: isDarkMode ? "text-red-300" : "text-red-700",
    successBox: isDarkMode
      ? "bg-teal-900/30 border-teal-700"
      : "bg-teal-50 border-teal-200",
    successText: isDarkMode ? "text-teal-300" : "text-teal-700",
  };

  // Token Error State
  if (tokenError) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center px-4 py-12 ${themeClasses.bg} relative`}
      >
        <OceanBackground isDark={isDarkMode} />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md relative z-10"
        >
          <div
            className={`${themeClasses.card} backdrop-blur-xl shadow-2xl rounded-2xl p-8 border`}
          >
            <div className="text-center space-y-6">
              <div
                className={`p-6 rounded-xl border-2 ${themeClasses.errorBox}`}
              >
                <AlertCircle
                  className={`h-16 w-16 mx-auto mb-4 ${themeClasses.errorText}`}
                />
                <h3
                  className={`text-xl font-semibold mb-2 ${themeClasses.cardText}`}
                >
                  Invalid or Expired Link
                </h3>
                <p className={`text-sm ${themeClasses.cardSubtext}`}>
                  This password reset link is invalid or has expired. Please
                  request a new one.
                </p>
              </div>

              <div className="space-y-3">
                <Link to="/forgot-password">
                  <Button
                    className={`w-full ${themeClasses.buttonBg} text-white`}
                  >
                    Request New Reset Link
                  </Button>
                </Link>
                <Link to="/login">
                  <Button
                    variant="outline"
                    className={`w-full ${
                      isDarkMode
                        ? "border-gray-600 text-gray-300 hover:bg-gray-800"
                        : "border-teal-300 text-teal-600 hover:bg-teal-50"
                    }`}
                  >
                    Back to Login
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Success State
  if (resetSuccess) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center px-4 py-12 ${themeClasses.bg} relative`}
      >
        <OceanBackground isDark={isDarkMode} />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md relative z-10"
        >
          <div
            className={`${themeClasses.card} backdrop-blur-xl shadow-2xl rounded-2xl p-8 border`}
          >
            <div className="text-center space-y-6">
              <div
                className={`p-6 rounded-xl border-2 ${themeClasses.successBox}`}
              >
                <CheckCircle2
                  className={`h-16 w-16 mx-auto mb-4 ${themeClasses.successText}`}
                />
                <h3
                  className={`text-xl font-semibold mb-2 ${themeClasses.cardText}`}
                >
                  Password Reset Successful!
                </h3>
                <p className={`text-sm ${themeClasses.cardSubtext} mb-4`}>
                  Your password has been changed successfully.
                </p>
                <p
                  className={`text-sm ${themeClasses.successText} font-medium`}
                >
                  Redirecting you to login page...
                </p>
              </div>
              <div className="flex items-center justify-center">
                <Loader2
                  className={`h-6 w-6 animate-spin ${themeClasses.iconColor}`}
                />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen flex items-center justify-center px-4 py-12 ${themeClasses.bg} relative`}
    >
      <OceanBackground isDark={isDarkMode} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Main Card */}
        <div
          className={`${themeClasses.card} backdrop-blur-xl shadow-2xl rounded-2xl p-8 border`}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div
              className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${
                isDarkMode ? "bg-teal-500/20" : "bg-teal-100"
              } mb-4`}
            >
              <Lock className={`h-8 w-8 ${themeClasses.iconColor}`} />
            </div>
            <h1 className={`text-3xl font-bold ${themeClasses.cardText} mb-2`}>
              Reset Password
            </h1>
            <p className={`text-sm ${themeClasses.cardSubtext}`}>
              Enter your new password below
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={themeClasses.cardText}>
                      New Password
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock
                          className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${themeClasses.cardSubtext}`}
                        />
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter new password"
                          className={`pl-10 pr-10 h-12 ${themeClasses.input} focus:ring-2 focus:ring-teal-500/20`}
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${themeClasses.cardSubtext} hover:${themeClasses.iconColor} transition-colors`}
                        >
                          {showPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                    <p className={`text-xs ${themeClasses.cardSubtext} mt-1`}>
                      Must be 6+ characters with uppercase and special character
                    </p>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={themeClasses.cardText}>
                      Confirm Password
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock
                          className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${themeClasses.cardSubtext}`}
                        />
                        <Input
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirm new password"
                          className={`pl-10 pr-10 h-12 ${themeClasses.input} focus:ring-2 focus:ring-teal-500/20`}
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${themeClasses.cardSubtext} hover:${themeClasses.iconColor} transition-colors`}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={isLoading}
                className={`w-full h-12 ${themeClasses.buttonBg} text-white font-semibold rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Resetting Password...
                  </>
                ) : (
                  <>
                    <Lock className="mr-0 h-5 w-5" />
                    Reset Password
                  </>
                )}
              </Button>
            </form>
          </Form>
        </div>

        {/* Footer */}
        <p className={`text-center mt-6 text-sm ${themeClasses.cardSubtext}`}>
          Remember your password?{" "}
          <Link
            to="/login"
            className={`font-semibold ${
              isDarkMode
                ? "text-teal-400 hover:text-teal-300"
                : "text-teal-600 hover:text-teal-700"
            } hover:underline`}
          >
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default ResetPasswordPage;
