import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuthStore } from "./store/authStore";
import SlidingAuthPage from "./components/auth/SlidingAuthPage";
import DashboardPage from "./pages/DashboardPage";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";
import RecycleBinPage from "./pages/RecycleBinPage";
import AuthCallbackPage from "./pages/AuthCallbackPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import VerifyEmailPage from "./pages/VerifyEmailPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import TermsOfServicePage from "./pages/TermsOfServicePage";
import LoadingSpinner from "./components/common/LoadingSpinner";
import { Toaster } from "./components/ui/toaster";
import { ThemeProvider } from "./context/ThemeContext";
import { useTheme } from "./context/ThemeContext";

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuthStore();
  const { theme } = useTheme();
  const isDarkMode = theme === "dark";

  if (isLoading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center bg-gradient-to-br ${
          isDarkMode
            ? "from-gray-900 via-gray-950 to-gray-900"
            : "from-blue-50 via-white to-purple-50"
        }`}
      >
        <div className="text-center">
          <LoadingSpinner />
          <p
            className={`mt-4 text-sm animate-pulse ${
              isDarkMode ? "text-gray-300" : "text-gray-600"
            }`}
          >
            Signing out...
          </p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/auth" replace />;
};

// Public Route Component (redirect if already authenticated)
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuthStore();
  const { theme } = useTheme();
  const isDarkMode = theme === "dark";

  if (isLoading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center bg-gradient-to-br ${
          isDarkMode
            ? "from-gray-900 via-gray-950 to-gray-900"
            : "from-blue-50 via-white to-purple-50"
        }`}
      >
        <div className="text-center">
          <LoadingSpinner />
          <p
            className={`mt-4 text-sm animate-pulse ${
              isDarkMode ? "text-gray-300" : "text-gray-600"
            }`}
          >
            Loading...
          </p>
        </div>
      </div>
    );
  }

  return !isAuthenticated ? (
    <>{children}</>
  ) : (
    <Navigate to="/dashboard" replace />
  );
};

function App() {
  const { getCurrentUser, isLoading } = useAuthStore();
  const [minLoadingTime, setMinLoadingTime] = useState(true);

  useEffect(() => {
    // Check if user is authenticated on app load
    const startTime = Date.now();
    getCurrentUser().then(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 2000 - elapsed);
      // Wait remaining time to ensure minimum 2s loading display
      setTimeout(() => setMinLoadingTime(false), remaining);
    });
  }, [getCurrentUser]);

  const AppLoader = () => {
    const { theme } = useTheme();
    const isDarkMode = theme === "dark";
    return (
      <div
        className={`min-h-screen flex items-center justify-center bg-gradient-to-br ${
          isDarkMode
            ? "from-gray-900 via-gray-950 to-gray-900"
            : "from-blue-50 via-white to-purple-50"
        } animate-fadeIn`}
      >
        <div className="text-center">
          <LoadingSpinner />
          <p
            className={`mt-4 text-sm animate-pulse ${
              isDarkMode ? "text-gray-300" : "text-gray-600"
            }`}
          >
            Loading...
          </p>
        </div>
      </div>
    );
  };

  return (
    <ThemeProvider>
      {isLoading || minLoadingTime ? (
        <AppLoader />
      ) : (
        <Router>
          <div className="min-h-screen">
            <Routes>
              {/* Single Auth Route for both Login and Register */}
              <Route
                path="/auth"
                element={
                  <PublicRoute>
                    <SlidingAuthPage />
                  </PublicRoute>
                }
              />

              {/* Keep old routes for backward compatibility - redirect to /auth */}
              <Route path="/login" element={<Navigate to="/auth" replace />} />
              <Route
                path="/register"
                element={<Navigate to="/auth" replace />}
              />

              {/* Auth Callback Route */}
              <Route path="/auth/callback" element={<AuthCallbackPage />} />

              {/* Password Reset Routes (Public) */}
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />

              {/* Email Verification Route (Public - can be accessed with or without auth) */}
              <Route path="/verify-email" element={<VerifyEmailPage />} />

              {/* Legal Pages (Public) */}
              <Route path="/privacy" element={<PrivacyPolicyPage />} />
              <Route path="/terms" element={<TermsOfServicePage />} />

              {/* Protected Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/recycle-bin"
                element={
                  <ProtectedRoute>
                    <RecycleBinPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <SettingsPage />
                  </ProtectedRoute>
                }
              />

              {/* Default Redirects */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>

            <Toaster position="top-center" />
          </div>
        </Router>
      )}
    </ThemeProvider>
  );
}

export default App;
