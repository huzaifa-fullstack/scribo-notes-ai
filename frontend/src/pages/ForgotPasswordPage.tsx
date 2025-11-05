import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
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
import { forgotPassword } from "../services/api";

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

const ForgotPasswordPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { toast } = useToast();
  const { theme } = useTheme();
  const isDarkMode = theme === "dark";

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    try {
      await forgotPassword(data.email);

      setEmailSent(true);
      toast({
        title: "Email sent!",
        description:
          "If an account exists with this email, a password reset link has been sent.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.response?.data?.error ||
          "Failed to send reset email. Please try again.",
        variant: "destructive",
      });
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
    successBox: isDarkMode
      ? "bg-teal-900/30 border-teal-700"
      : "bg-teal-50 border-teal-200",
    successText: isDarkMode ? "text-teal-300" : "text-teal-700",
  };

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
        {/* Back to Login Link */}
        <Link to="/login">
          <Button
            variant="ghost"
            className={`mb-4 ${
              isDarkMode
                ? "text-teal-400 hover:text-teal-300 hover:bg-gray-800"
                : "text-teal-600 hover:text-teal-700 hover:bg-teal-50"
            }`}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Login
          </Button>
        </Link>

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
              <Mail className={`h-8 w-8 ${themeClasses.iconColor}`} />
            </div>
            <h1 className={`text-3xl font-bold ${themeClasses.cardText} mb-2`}>
              Forgot Password?
            </h1>
            <p className={`text-sm ${themeClasses.cardSubtext}`}>
              No worries! Enter your email and we'll send you reset
              instructions.
            </p>
          </div>

          {!emailSent ? (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={themeClasses.cardText}>
                        Email Address
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail
                            className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${themeClasses.cardSubtext}`}
                          />
                          <Input
                            type="email"
                            placeholder="Enter your email"
                            className={`pl-10 h-12 ${themeClasses.input} focus:ring-2 focus:ring-teal-500/20`}
                            {...field}
                          />
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
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="mr-0 h-5 w-5" />
                      Send Reset Link
                    </>
                  )}
                </Button>
              </form>
            </Form>
          ) : (
            /* Success State */
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-6"
            >
              <div
                className={`p-6 rounded-xl border-2 ${themeClasses.successBox}`}
              >
                <CheckCircle2
                  className={`h-16 w-16 mx-auto mb-4 ${themeClasses.iconColor}`}
                />
                <h3
                  className={`text-xl font-semibold mb-2 ${themeClasses.cardText}`}
                >
                  Check Your Email
                </h3>
                <p className={`text-sm ${themeClasses.cardSubtext}`}>
                  We've sent password reset instructions to{" "}
                  <span className={`font-semibold ${themeClasses.successText}`}>
                    {form.getValues("email")}
                  </span>
                </p>
              </div>

              <div className={`text-sm ${themeClasses.cardSubtext} space-y-2`}>
                <p>📬 Check your inbox and spam folder</p>
                <p>⏰ The link will expire in 1 hour</p>
                <p>
                  Didn't receive it?{" "}
                  <button
                    onClick={() => {
                      setEmailSent(false);
                      form.reset();
                    }}
                    className={`${
                      isDarkMode
                        ? "text-teal-400 hover:text-teal-300"
                        : "text-teal-600 hover:text-teal-700"
                    } font-semibold hover:underline`}
                  >
                    Try again
                  </button>
                </p>
              </div>

              <Link to="/login">
                <Button
                  variant="outline"
                  className={`w-full ${
                    isDarkMode
                      ? "border-gray-600 text-gray-300 hover:bg-gray-800"
                      : "border-teal-300 text-teal-600 hover:bg-teal-50"
                  }`}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Login
                </Button>
              </Link>
            </motion.div>
          )}
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

export default ForgotPasswordPage;
