import { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Loader2, Mail, ArrowRight } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { useTheme } from "../context/ThemeContext";
import { useAuthStore } from "../store/authStore";
import { verifyEmail } from "../services/profileService";

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { user, setAuthData } = useAuthStore();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"verifying" | "success" | "error">(
    "verifying"
  );
  const [message, setMessage] = useState("");
  const hasVerified = useRef(false); // Prevent double verification

  const isDarkMode = theme === "dark";

  useEffect(() => {
    // Prevent double calls in React Strict Mode
    if (hasVerified.current) {
      return;
    }

    const verify = async () => {
      if (!token) {
        setStatus("error");
        setMessage("No verification token provided.");
        return;
      }

      hasVerified.current = true; // Mark as attempted

      try {
        const response = await verifyEmail(token);

        // Check response structure - backend returns { success: true, message, user }
        if (response && response.success === true) {
          setStatus("success");
          setMessage(response.message || "Email verified successfully!");

          // Immediately update user state with verified user data from response
          if (response.user && user) {
            const currentToken = localStorage.getItem("token");
            if (currentToken) {
              setAuthData(currentToken, {
                ...user,
                isEmailVerified: true,
              });
            }
          }
        } else {
          setStatus("error");
          setMessage(
            response?.error || response?.message || "Verification failed."
          );
        }
      } catch (error: unknown) {
        const err = error as {
          response?: {
            status?: number;
            data?: { error?: string; message?: string };
          };
        };

        // If it's a 400 error but the token was already used (second call in strict mode)
        // and user is already verified, treat as success
        if (err.response?.status === 400 && user?.isEmailVerified) {
          setStatus("success");
          setMessage("Email verified successfully!");
          return;
        }

        setStatus("error");
        setMessage(
          err.response?.data?.error ||
            err.response?.data?.message ||
            "Invalid or expired verification token. Please request a new verification email."
        );
      }
    };

    verify();
  }, [token, user, setAuthData]); // Add dependencies

  // Dynamic theme classes
  const themeClasses = {
    bg: isDarkMode
      ? "bg-slate-950"
      : "bg-gradient-to-br from-gray-50 via-blue-50/30 to-teal-50/20",
    card: isDarkMode
      ? "bg-gray-900 border-gray-700"
      : "bg-white border-teal-100/50",
    text: isDarkMode ? "text-white" : "text-gray-900",
    subtext: isDarkMode ? "text-gray-400" : "text-gray-600",
    successGradient: "from-green-500 to-emerald-500",
    errorGradient: "from-red-500 to-rose-500",
    buttonBg: isDarkMode
      ? "bg-teal-600 hover:bg-teal-700"
      : "bg-teal-600 hover:bg-teal-700",
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut" as const,
      },
    },
  };

  const iconVariants = {
    hidden: { scale: 0, rotate: -180 },
    visible: {
      scale: 1,
      rotate: 0,
      transition: {
        type: "spring" as const,
        stiffness: 200,
        damping: 15,
        delay: 0.2,
      },
    },
  };

  return (
    <div
      className={`min-h-screen ${themeClasses.bg} flex items-center justify-center p-4`}
    >
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-md"
      >
        <Card className={`${themeClasses.card} shadow-2xl border-2`}>
          <CardContent className="p-8 sm:p-12">
            {/* Status Icon */}
            <div className="flex justify-center mb-6">
              <motion.div
                variants={iconVariants}
                initial="hidden"
                animate="visible"
              >
                {status === "verifying" && (
                  <div className="relative">
                    <Loader2 className="h-20 w-20 text-teal-500 animate-spin" />
                    <Mail className="h-10 w-10 text-teal-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                  </div>
                )}
                {status === "success" && (
                  <div
                    className={`bg-gradient-to-br ${themeClasses.successGradient} rounded-full p-4`}
                  >
                    <CheckCircle2 className="h-16 w-16 text-white" />
                  </div>
                )}
                {status === "error" && (
                  <div
                    className={`bg-gradient-to-br ${themeClasses.errorGradient} rounded-full p-4`}
                  >
                    <XCircle className="h-16 w-16 text-white" />
                  </div>
                )}
              </motion.div>
            </div>

            {/* Title */}
            <h1
              className={`text-2xl sm:text-3xl font-bold text-center mb-4 ${themeClasses.text}`}
            >
              {status === "verifying" && "Verifying Email..."}
              {status === "success" && "Email Verified! ✓"}
              {status === "error" && "Verification Failed"}
            </h1>

            {/* Message */}
            <p
              className={`text-center ${themeClasses.subtext} mb-8 text-sm sm:text-base`}
            >
              {message}
            </p>

            {/* Action Buttons */}
            <div className="space-y-3">
              {status === "success" && (
                <>
                  <Button
                    onClick={() => navigate("/dashboard")}
                    className={`w-full ${themeClasses.buttonBg} text-white transition-all duration-300 shadow-lg hover:shadow-xl h-12 text-base font-semibold`}
                  >
                    Go to Dashboard
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                  <Button
                    onClick={() => navigate("/profile")}
                    variant="outline"
                    className={`w-full ${
                      isDarkMode
                        ? "border-gray-600 hover:bg-gray-800"
                        : "border-teal-200 hover:bg-teal-50"
                    } h-12`}
                  >
                    View Profile
                  </Button>
                </>
              )}

              {status === "error" && (
                <>
                  <Button
                    onClick={() => navigate("/profile")}
                    className={`w-full ${themeClasses.buttonBg} text-white transition-all duration-300 shadow-lg hover:shadow-xl h-12 text-base font-semibold`}
                  >
                    Request New Verification Email
                    <Mail className="ml-0.5 h-5 w-5" />
                  </Button>
                  <Button
                    onClick={() => navigate("/dashboard")}
                    variant="outline"
                    className={`w-full ${
                      isDarkMode
                        ? "border-gray-600 hover:bg-gray-800"
                        : "border-teal-200 hover:bg-teal-50"
                    } h-12`}
                  >
                    Go to Dashboard
                  </Button>
                </>
              )}

              {status === "verifying" && (
                <div className="text-center">
                  <p className={`text-sm ${themeClasses.subtext}`}>
                    Please wait while we verify your email address...
                  </p>
                </div>
              )}
            </div>

            {/* Success Badge Info */}
            {status === "success" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className={`mt-6 p-4 rounded-lg ${
                  isDarkMode
                    ? "bg-emerald-950/30 border border-emerald-800/50"
                    : "bg-emerald-50 border border-emerald-200"
                }`}
              >
                <p
                  className={`text-sm text-center ${
                    isDarkMode ? "text-emerald-300" : "text-emerald-700"
                  }`}
                >
                  🎉 You now have the <strong>Verified</strong> badge on your
                  account!
                </p>
              </motion.div>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <p className={`text-center mt-6 text-sm ${themeClasses.subtext}`}>
          Having trouble?{" "}
          <button
            onClick={() => navigate("/profile")}
            className={`${
              isDarkMode ? "text-teal-400" : "text-teal-600"
            } hover:underline font-medium`}
          >
            Go to Profile
          </button>
        </p>
      </motion.div>
    </div>
  );
};

export default VerifyEmailPage;
