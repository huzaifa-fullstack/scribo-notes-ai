import { useState } from "react";
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
              ? "text-gray-400 hover:bg-gray-700 hover:text-gray-300"
              : "text-gray-600 hover:bg-gray-200 hover:text-gray-700"
          }`}
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 mr-0 animate-spin" />
              <span className="ml-1 text-xs font-medium">AI</span>
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-0" />
              <span className="ml-1 text-xs font-medium">AI</span>
            </>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        className={`w-56 ${
          isDarkMode
            ? "bg-gray-800 border-gray-700"
            : "bg-white border-gray-200"
        }`}
      >
        <DropdownMenuLabel
          className={`flex items-center gap-1.5 text-xs py-1.5 ${
            isDarkMode ? "text-purple-400" : "text-purple-600"
          }`}
        >
          <Sparkles className="h-3.5 w-3.5" />
          AI Assistant
        </DropdownMenuLabel>
        <DropdownMenuSeparator
          className={isDarkMode ? "bg-gray-700" : "bg-gray-200"}
        />

        {selectedText && (
          <div
            className={`px-2 py-1 mb-0.5 text-[10px] leading-tight ${
              isDarkMode ? "text-gray-400" : "text-gray-600"
            }`}
          >
            ✨ {selectedText.length} chars selected
          </div>
        )}

        {!selectedText && (
          <div
            className={`px-2 py-1 mb-0.5 text-[10px] leading-tight ${
              isDarkMode ? "text-gray-400" : "text-gray-600"
            }`}
          >
            💡 Will process all content
          </div>
        )}

        {aiActions.map((action) => {
          const Icon = action.icon;

          return (
            <DropdownMenuItem
              key={action.id}
              onClick={() => handleAction(action.id)}
              className={`flex items-start gap-2 py-1.5 cursor-pointer ${
                isDarkMode
                  ? "hover:bg-gray-700 focus:bg-gray-700"
                  : "hover:bg-gray-100 focus:bg-gray-100"
              }`}
            >
              <Icon
                className={`h-3.5 w-3.5 mt-0.5 flex-shrink-0 ${
                  isDarkMode ? "text-purple-400" : "text-purple-600"
                }`}
              />
              <div className="flex-1 min-w-0">
                <div
                  className={`font-medium text-xs leading-tight ${
                    isDarkMode ? "text-gray-200" : "text-gray-900"
                  }`}
                >
                  {action.label}
                </div>
                <div
                  className={`text-[10px] mt-0.5 leading-tight ${
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
