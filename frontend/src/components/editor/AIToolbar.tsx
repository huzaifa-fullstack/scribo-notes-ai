import { useState } from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  Check,
  FileText,
  Wand2,
  Tags,
  MessageSquare,
  Lightbulb,
  Loader2,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import type { AIActionType } from "../../types/ai";

interface AIToolbarProps {
  onAction: (action: AIActionType, data?: any) => void;
  isProcessing: boolean;
  selectedText: string;
}

const AIToolbar = ({
  onAction,
  isProcessing,
  selectedText,
}: AIToolbarProps) => {
  const { theme } = useTheme();
  const isDarkMode = theme === "dark";
  const [isOpen, setIsOpen] = useState(false);

  const aiActions = [
    {
      id: "fix-grammar" as AIActionType,
      label: "Fix Grammar & Spelling",
      icon: Check,
      description: "Correct grammar and spelling errors",
      requiresSelection: false,
    },
    {
      id: "summarize" as AIActionType,
      label: "Summarize",
      icon: FileText,
      description: "Create a concise summary",
      requiresSelection: false,
    },
    {
      id: "enhance" as AIActionType,
      label: "Enhance Content",
      icon: Wand2,
      description: "Improve and expand your writing",
      requiresSelection: false,
    },
    {
      id: "suggest-tags" as AIActionType,
      label: "Suggest Tags",
      icon: Tags,
      description: "Get smart tag suggestions",
      requiresSelection: false,
    },
    {
      id: "adjust-tone" as AIActionType,
      label: "Adjust Tone",
      icon: MessageSquare,
      description: "Change tone (professional, casual, etc.)",
      requiresSelection: false,
    },
    {
      id: "generate" as AIActionType,
      label: "Generate Content",
      icon: Lightbulb,
      description: "Create content from scratch",
      requiresSelection: false,
    },
  ];

  const handleAction = (actionId: AIActionType) => {
    setIsOpen(false);
    onAction(actionId);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={isProcessing}
          className={`relative group ${
            isDarkMode
              ? "hover:bg-purple-900/20 hover:text-purple-400"
              : "hover:bg-purple-50 hover:text-purple-600"
          }`}
        >
          {isProcessing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              <motion.div
                className="absolute inset-0 rounded-md"
                initial={false}
                animate={{
                  boxShadow: isOpen
                    ? isDarkMode
                      ? "0 0 20px rgba(168, 85, 247, 0.4)"
                      : "0 0 20px rgba(147, 51, 234, 0.3)"
                    : "none",
                }}
                transition={{ duration: 0.2 }}
              />
            </>
          )}
          <span className="ml-1.5 text-xs font-medium">AI</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        className={`w-64 ${
          isDarkMode
            ? "bg-gray-800 border-gray-700"
            : "bg-white border-gray-200"
        }`}
      >
        <DropdownMenuLabel
          className={`flex items-center gap-2 ${
            isDarkMode ? "text-purple-400" : "text-purple-600"
          }`}
        >
          <Sparkles className="h-4 w-4" />
          AI Assistant
        </DropdownMenuLabel>
        <DropdownMenuSeparator
          className={isDarkMode ? "bg-gray-700" : "bg-gray-200"}
        />

        {selectedText && (
          <div
            className={`px-2 py-1.5 mb-1 text-xs ${
              isDarkMode ? "text-gray-400" : "text-gray-600"
            }`}
          >
            ✨ {selectedText.length} characters selected (will process selected
            text only)
          </div>
        )}

        {!selectedText && (
          <div
            className={`px-2 py-1.5 mb-1 text-xs ${
              isDarkMode ? "text-gray-400" : "text-gray-600"
            }`}
          >
            💡 Tip: Will process all content (or select text first)
          </div>
        )}

        {aiActions.map((action) => {
          const Icon = action.icon;

          return (
            <DropdownMenuItem
              key={action.id}
              onClick={() => handleAction(action.id)}
              className={`flex items-start gap-3 py-2.5 cursor-pointer ${
                isDarkMode
                  ? "hover:bg-gray-700 focus:bg-gray-700"
                  : "hover:bg-gray-100 focus:bg-gray-100"
              }`}
            >
              <Icon
                className={`h-4 w-4 mt-0.5 flex-shrink-0 ${
                  isDarkMode ? "text-purple-400" : "text-purple-600"
                }`}
              />
              <div className="flex-1 min-w-0">
                <div
                  className={`font-medium text-sm ${
                    isDarkMode ? "text-gray-200" : "text-gray-900"
                  }`}
                >
                  {action.label}
                </div>
                <div
                  className={`text-xs mt-0.5 ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  {action.description}
                </div>
              </div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default AIToolbar;
