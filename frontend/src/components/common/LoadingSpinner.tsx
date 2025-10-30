interface LoadingSpinnerProps {
  className?: string;
}

const LoadingSpinner = ({ className = "" }: LoadingSpinnerProps) => {
  return (
    <div className={`flex items-center justify-center gap-1.5 ${className}`}>
      <div
        className="h-4 w-4 bg-cyan-500 rounded-full animate-bounce"
        style={{ animationDelay: "0ms" }}
      ></div>
      <div
        className="h-4 w-4 bg-cyan-500 rounded-full animate-bounce"
        style={{ animationDelay: "150ms" }}
      ></div>
      <div
        className="h-4 w-4 bg-cyan-500 rounded-full animate-bounce"
        style={{ animationDelay: "300ms" }}
      ></div>
    </div>
  );
};

export default LoadingSpinner;
