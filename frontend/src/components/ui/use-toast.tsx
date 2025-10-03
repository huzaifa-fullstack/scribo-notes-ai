import * as React from "react";

interface ToastProps {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
}

// Simple toast context for basic functionality
const ToastContext = React.createContext<{
  toast: (props: ToastProps) => void;
}>({
  toast: () => {},
});

export const useToast = () => {
  const context = React.useContext(ToastContext);
  if (!context) {
    // Return a simple fallback that uses browser alert for now
    return {
      toast: ({ title, description }: ToastProps) => {
        alert(`${title}${description ? ": " + description : ""}`);
      },
    };
  }
  return context;
};

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const toast = React.useCallback(({ title, description }: ToastProps) => {
    // Simple implementation - in a real app you'd show a proper toast
    console.log("Toast:", { title, description });
    // For now, just use a simple notification
    if (title) {
      alert(`${title}${description ? ": " + description : ""}`);
    }
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>{children}</ToastContext.Provider>
  );
};
