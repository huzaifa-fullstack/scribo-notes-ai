import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { useToast } from "../components/ui/use-toast";
import { useTheme } from "../context/ThemeContext";

const AuthCallbackPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { theme } = useTheme();
  const isDarkMode = theme === "dark";
  const setAuthData = useAuthStore((state) => state.setAuthData);
  const hasProcessed = useRef(false);

  useEffect(() => {
    // Prevent multiple executions (React Strict Mode in dev)
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const token = searchParams.get("token");
    const error = searchParams.get("error");

    if (error) {
      toast({
        title: "Authentication Failed",
        description: "Unable to sign in with Google. Please try again.",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    if (token) {
      // Store token and fetch user data
      localStorage.setItem("token", token);

      // Fetch user profile
      fetch(`${import.meta.env.VITE_API_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setAuthData(token, data.user);
            toast({
              title: "Welcome!",
              description: "Successfully signed in with Google.",
            });
            navigate("/dashboard");
          }
        })
        .catch(() => {
          navigate("/login");
        });
    } else {
      navigate("/login");
    }
  }, [searchParams, navigate, toast, setAuthData]);

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
          Completing sign in...
        </p>
      </div>
    </div>
  );
};

export default AuthCallbackPage;
