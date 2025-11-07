import { motion } from "framer-motion";
import { Check, X, Sparkles, Copy, ArrowRight } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { toast } from "sonner";

interface AIResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  original?: string;
  result: string;
  onAccept: () => void;
  onReject: () => void;
  type: "grammar" | "summary" | "generate" | "enhance" | "tone" | "tags";
  metadata?: any;
}

const AIResultModal = ({
  isOpen,
  onClose,
  title,
  original,
  result,
  onAccept,
  onReject,
  type,
  metadata,
}: AIResultModalProps) => {
  const { theme } = useTheme();
  const isDarkMode = theme === "dark";

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    toast.success("Copied to clipboard!");
  };

  const renderContent = () => {
    if (type === "tags") {
      // For tags, result is JSON stringified array
      try {
        const tags = JSON.parse(result);
        return (
          <div className="space-y-3">
            <div>
              <h4
                className={`text-sm font-medium mb-2 ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Suggested Tags
              </h4>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag: any, index: number) => (
                  <motion.span
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                      isDarkMode
                        ? "bg-purple-900/30 text-purple-300 border border-purple-700"
                        : "bg-purple-50 text-purple-700 border border-purple-200"
                    }`}
                  >
                    {tag.tag || tag}
                    {tag.confidence && (
                      <span className="ml-1.5 text-xs opacity-60">
                        {tag.confidence}%
                      </span>
                    )}
                  </motion.span>
                ))}
              </div>
            </div>
            {metadata?.keywords && metadata.keywords.length > 0 && (
              <div>
                <h4
                  className={`text-sm font-medium mb-2 ${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Keywords
                </h4>
                <div className="flex flex-wrap gap-2">
                  {metadata.keywords.map((keyword: string, index: number) => (
                    <span
                      key={index}
                      className={`px-2.5 py-1 rounded text-xs ${
                        isDarkMode
                          ? "bg-gray-700 text-gray-300"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      } catch (e) {
        return <p className="text-sm">{result}</p>;
      }
    }

    if (type === "summary") {
      return (
        <div className="space-y-4">
          {original && (
            <div>
              <h4
                className={`text-sm font-medium mb-2 flex items-center gap-2 ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Original ({original.length} chars)
              </h4>
              <div
                className={`p-3 rounded-lg text-sm max-h-40 overflow-y-auto ${
                  isDarkMode
                    ? "bg-gray-800 text-gray-300"
                    : "bg-gray-50 text-gray-700"
                }`}
              >
                {original}
              </div>
            </div>
          )}
          <ArrowRight
            className={`mx-auto ${
              isDarkMode ? "text-purple-400" : "text-purple-600"
            }`}
          />
          <div>
            <h4
              className={`text-sm font-medium mb-2 flex items-center gap-2 ${
                isDarkMode ? "text-gray-300" : "text-gray-700"
              }`}
            >
              <Sparkles className="h-4 w-4" />
              Summary ({result.length} chars)
              {metadata?.compressionRatio && (
                <span
                  className={`text-xs ${
                    isDarkMode ? "text-purple-400" : "text-purple-600"
                  }`}
                >
                  {metadata.compressionRatio}% shorter
                </span>
              )}
            </h4>
            <div
              className={`p-3 rounded-lg text-sm ${
                isDarkMode
                  ? "bg-purple-900/20 text-gray-200 border border-purple-700"
                  : "bg-purple-50 text-gray-800 border border-purple-200"
              }`}
            >
              {result}
            </div>
          </div>
        </div>
      );
    }

    if (original) {
      // Show before/after comparison
      return (
        <div className="space-y-4">
          <div>
            <h4
              className={`text-sm font-medium mb-2 ${
                isDarkMode ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Original
            </h4>
            <div
              className={`p-3 rounded-lg text-sm max-h-40 overflow-y-auto ${
                isDarkMode
                  ? "bg-gray-800 text-gray-300"
                  : "bg-gray-50 text-gray-700"
              }`}
            >
              {original}
            </div>
          </div>
          <ArrowRight
            className={`mx-auto ${
              isDarkMode ? "text-purple-400" : "text-purple-600"
            }`}
          />
          <div>
            <h4
              className={`text-sm font-medium mb-2 flex items-center gap-2 ${
                isDarkMode ? "text-gray-300" : "text-gray-700"
              }`}
            >
              <Sparkles className="h-4 w-4" />
              AI Suggestion
            </h4>
            <div
              className={`p-3 rounded-lg text-sm max-h-60 overflow-y-auto ${
                isDarkMode
                  ? "bg-purple-900/20 text-gray-200 border border-purple-700"
                  : "bg-purple-50 text-gray-800 border border-purple-200"
              }`}
            >
              {result}
            </div>
          </div>
        </div>
      );
    }

    // Just show result (for generate action)
    return (
      <div
        className={`p-4 rounded-lg text-sm max-h-96 overflow-y-auto ${
          isDarkMode
            ? "bg-purple-900/20 text-gray-200 border border-purple-700"
            : "bg-purple-50 text-gray-800 border border-purple-200"
        }`}
      >
        {result}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={`max-w-2xl max-h-[90vh] overflow-hidden flex flex-col ${
          isDarkMode
            ? "bg-gray-900 border-gray-700"
            : "bg-white border-gray-200"
        }`}
      >
        <DialogHeader className="space-y-3">
          <DialogTitle
            className={`flex items-center gap-2 text-lg ${
              isDarkMode ? "text-purple-400" : "text-purple-600"
            }`}
          >
            <Sparkles className="h-5 w-5" />
            {title}
          </DialogTitle>
          <DialogDescription
            className={`${
              isDarkMode ? "text-gray-400" : "text-gray-600"
            } text-sm leading-relaxed`}
          >
            Review the AI suggestion and choose to accept or reject
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-2">{renderContent()}</div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-4 border-t border-gray-700">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className={`w-full sm:w-auto ${
              isDarkMode ? "text-gray-400 hover:text-gray-200" : ""
            }`}
          >
            <Copy className="h-4 w-4 mr-1" />
            Copy
          </Button>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button
              type="button"
              variant="outline"
              onClick={onReject}
              className={`w-full sm:w-auto ${
                isDarkMode
                  ? "border-gray-600 hover:bg-gray-800 text-gray-300"
                  : ""
              }`}
            >
              <X className="h-4 w-4 mr-0" />
              Reject
            </Button>
            <Button
              type="button"
              onClick={onAccept}
              className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Check className="h-4 w-4 mr-0" />
              Accept
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AIResultModal;
