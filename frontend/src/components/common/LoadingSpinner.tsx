interface LoadingSpinnerProps {
  className?: string;
}

const LoadingSpinner = ({ className = "" }: LoadingSpinnerProps) => {
  return (
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      <div
        className="h-3 w-3 bg-teal-500 rounded-full animate-bounce shadow-lg"
        style={{ animationDelay: "0ms" }}
      ></div>
      <div
        className="h-3 w-3 bg-teal-500 rounded-full animate-bounce shadow-lg"
        style={{ animationDelay: "150ms" }}
      ></div>
      <div
        className="h-3 w-3 bg-teal-500 rounded-full animate-bounce shadow-lg"
        style={{ animationDelay: "300ms" }}
      ></div>
    </div>
  );
};

export default LoadingSpinner;