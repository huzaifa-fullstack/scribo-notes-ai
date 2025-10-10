import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { useToast } from "../components/ui/use-toast";

const AuthCallbackPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const setAuthData = useAuthStore((state) => state.setAuthData);

  useEffect(() => {
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
    <div className="min-h-screen flex items-center justify-center">
      <LoadingSpinner size="lg" />
    </div>
  );
};

export default AuthCallbackPage;
