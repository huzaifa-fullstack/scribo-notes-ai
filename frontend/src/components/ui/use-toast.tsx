import { toast as sonnerToast } from "sonner";

interface ToastProps {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
}

export const useToast = () => {
  const toast = ({ title, description, variant }: ToastProps) => {
    const styledDescription = description ? (
      <span style={{ color: "#9ca3af", fontWeight: "400" }}>{description}</span>
    ) : undefined;

    if (variant === "destructive") {
      sonnerToast.error(title || "Error", {
        description: styledDescription,
        style: {
          background: "#ffffff",
          color: "#1f2937",
          border: "2px solid #ef4444",
          fontSize: "16px",
          fontWeight: "600",
          boxShadow: "0 10px 25px rgba(0, 0, 0, 0.3)",
        },
      });
    } else {
      sonnerToast.success(title || "Success", {
        description: styledDescription,
        style: {
          background: "#ffffff",
          color: "#1f2937",
          border: "2px solid #10b981",
          fontSize: "16px",
          fontWeight: "600",
          boxShadow: "0 10px 25px rgba(0, 0, 0, 0.3)",
        },
      });
    }
  };

  return { toast };
};
