import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { Button } from "./button";
import { useTheme } from "../../context/ThemeContext";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) => {
  const { theme } = useTheme();
  const isDarkMode = theme === "dark";

  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 3; // Maximum page numbers to show at once

    if (totalPages <= maxVisible) {
      // Show all pages if total is less than or equal to max
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Calculate start and end of visible range
      let start = Math.max(1, currentPage - 1);
      let end = Math.min(totalPages, start + maxVisible - 1);

      // Adjust start if we're near the end
      if (end - start < maxVisible - 1) {
        start = Math.max(1, end - maxVisible + 1);
      }

      // Add page numbers in the range
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex items-center justify-center gap-1 mt-8">
      {/* Previous Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`h-9 w-9 p-0 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 ${
          isDarkMode
            ? "bg-gray-800 hover:bg-gray-700 border-gray-600 text-gray-300 hover:text-white hover:border-gray-500"
            : "bg-white/90 hover:bg-teal-50 border-teal-200 text-teal-700 hover:text-teal-800 hover:border-teal-300"
        }`}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {/* Page Numbers */}
      {pageNumbers.map((page, index) => {
        if (page === "...") {
          return (
            <div
              key={`ellipsis-${index}`}
              className="h-9 w-9 flex items-center justify-center"
            >
              <MoreHorizontal
                className={`h-4 w-4 ${
                  isDarkMode ? "text-gray-500" : "text-gray-400"
                }`}
              />
            </div>
          );
        }

        const pageNum = page as number;
        const isActive = currentPage === pageNum;
        return (
          <Button
            key={pageNum}
            variant={isActive ? "default" : "outline"}
            size="sm"
            onClick={() => onPageChange(pageNum)}
            className={`h-9 w-9 p-0 font-medium transition-all duration-300 ${
              isActive
                ? "bg-gradient-to-r from-teal-600 to-cyan-600 text-white hover:from-teal-700 hover:to-cyan-700 border-0 shadow-md scale-105"
                : isDarkMode
                ? "bg-gray-800 hover:bg-gray-700 border-gray-600 text-gray-300 hover:text-white hover:border-gray-500"
                : "bg-white/90 hover:bg-teal-50 border-teal-200 text-teal-700 hover:text-teal-800 hover:border-teal-300"
            }`}
          >
            {pageNum}
          </Button>
        );
      })}

      {/* Next Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`h-9 w-9 p-0 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 ${
          isDarkMode
            ? "bg-gray-800 hover:bg-gray-700 border-gray-600 text-gray-300 hover:text-white hover:border-gray-500"
            : "bg-white/90 hover:bg-teal-50 border-teal-200 text-teal-700 hover:text-teal-800 hover:border-teal-300"
        }`}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default Pagination;
