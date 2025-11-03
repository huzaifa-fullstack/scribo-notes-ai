import { toast as sonnerToast } from "sonner";

interface ToastProps {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
}

export const useToast = () => {
  const toast = ({ title, description, variant }: ToastProps) => {
    // Check if dark mode is active
    const isDark = document.documentElement.classList.contains("dark");

    // Theme-aware colors
    const colors = isDark
      ? {
          bg: "#1f2937", // gray-800
          text: "#ffffff",
          descText: "#d1d5db", // gray-300
          successBorder: "#10b981", // green-500
          errorBorder: "#ef4444", // red-500
        }
      : {
          bg: "#ffffff",
          text: "#1f2937",
          descText: "#6b7280", // gray-500
          successBorder: "#10b981",
          errorBorder: "#ef4444",
        };

    const styledDescription = description ? (
      <span style={{ color: colors.descText, fontWeight: "400" }}>
        {description}
      </span>
    ) : undefined;

    if (variant === "destructive") {
      sonnerToast.error(title || "Error", {
        description: styledDescription,
        style: {
          background: colors.bg,
          color: colors.text,
          border: `2px solid ${colors.errorBorder}`,
          fontSize: "16px",
          fontWeight: "600",
          boxShadow: isDark
            ? "0 10px 25px rgba(0, 0, 0, 0.5)"
            : "0 10px 25px rgba(0, 0, 0, 0.15)",
        },
      });
    } else {
      sonnerToast.success(title || "Success", {
        description: styledDescription,
        style: {
          background: colors.bg,
          color: colors.text,
          border: `2px solid ${colors.successBorder}`,
          fontSize: "16px",
          fontWeight: "600",
          boxShadow: isDark
            ? "0 10px 25px rgba(0, 0, 0, 0.5)"
            : "0 10px 25px rgba(0, 0, 0, 0.15)",
        },
      });
    }
  };

  return { toast };
};
