interface LoadingSpinnerProps {
  className?: string;
  size?: string;
}

const LoadingSpinner = ({
  className = "",
  size = "md",
}: LoadingSpinnerProps) => {
  const sizeClass = size === "lg" ? "h-4 w-4" : "h-3 w-3";

  return (
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      <div
        className={`${sizeClass} bg-teal-500 rounded-full animate-bounce shadow-lg`}
        style={{ animationDelay: "0ms" }}
      ></div>
      <div
        className={`${sizeClass} bg-teal-500 rounded-full animate-bounce shadow-lg`}
        style={{ animationDelay: "150ms" }}
      ></div>
      <div
        className={`${sizeClass} bg-teal-500 rounded-full animate-bounce shadow-lg`}
        style={{ animationDelay: "300ms" }}
      ></div>
    </div>
  );
};

export default LoadingSpinner;
