import { Chrome } from "lucide-react";
import { Button } from "../ui/button";

const GoogleSignInButton = () => {
  const handleGoogleSignIn = () => {
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
    window.location.href = `${apiUrl}/auth/google`;
  };

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full"
      onClick={handleGoogleSignIn}
    >
      <Chrome className="mr-2 h-5 w-5" />
      Continue with Google
    </Button>
  );
};

export default GoogleSignInButton;
