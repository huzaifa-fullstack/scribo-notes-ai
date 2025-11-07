import { useState } from "react";
import { MessageSquare, Loader2 } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Label } from "../ui/label";

interface ToneAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdjust: (tone: string) => void;
  isProcessing: boolean;
  selectedText: string;
}

const ToneAdjustmentModal = ({
  isOpen,
  onClose,
  onAdjust,
  isProcessing,
  selectedText,
}: ToneAdjustmentModalProps) => {
  const { theme } = useTheme();
  const isDarkMode = theme === "dark";
  const [tone, setTone] = useState("professional");

  const toneOptions = [
    {
      value: "professional",
      label: "Professional",
      description: "Clear, formal, and business-appropriate",
      emoji: "💼",
    },
    {
      value: "casual",
      label: "Casual",
      description: "Friendly, relaxed, and conversational",
      emoji: "😊",
    },
    {
      value: "formal",
      label: "Formal",
      description: "Very polished and academic",
      emoji: "🎓",
    },
    {
      value: "enthusiastic",
      label: "Enthusiastic",
      description: "Energetic and positive",
      emoji: "🎉",
    },
  ];

  const handleAdjust = () => {
    onAdjust(tone);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={`max-w-xl max-h-[90vh] overflow-y-auto ${
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
            <MessageSquare className="h-5 w-5" />
            Adjust Tone
          </DialogTitle>
          <DialogDescription
            className={`${
              isDarkMode ? "text-gray-400" : "text-gray-600"
            } text-sm leading-relaxed`}
          >
            Choose how you want your text to sound
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Selected Text Preview */}
          <div className="space-y-2">
            <Label
              className={`text-sm font-medium ${
                isDarkMode ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Selected Text
            </Label>
            <div
              className={`p-3 rounded-lg text-sm max-h-32 overflow-y-auto ${
                isDarkMode
                  ? "bg-gray-800 text-gray-300 border border-gray-700"
                  : "bg-gray-50 text-gray-700 border border-gray-200"
              }`}
            >
              {selectedText}
            </div>
          </div>

          {/* Tone Options */}
          <div className="space-y-2">
            <Label className={isDarkMode ? "text-gray-300" : "text-gray-700"}>
              Select Tone
            </Label>
            <div className="grid grid-cols-2 gap-3">
              {toneOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setTone(option.value)}
                  disabled={isProcessing}
                  className={`p-3 rounded-lg text-left transition-all ${
                    tone === option.value
                      ? "bg-purple-600 text-white ring-2 ring-purple-500"
                      : isDarkMode
                      ? "bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-600"
                      : "bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{option.emoji}</span>
                    <span className="font-medium text-sm">{option.label}</span>
                  </div>
                  <p
                    className={`text-xs ${
                      tone === option.value
                        ? "text-purple-100"
                        : isDarkMode
                        ? "text-gray-400"
                        : "text-gray-600"
                    }`}
                  >
                    {option.description}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4 border-t border-gray-700">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isProcessing}
            className={`w-full sm:w-auto ${
              isDarkMode
                ? "border-gray-600 hover:bg-gray-800 text-gray-300"
                : ""
            }`}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleAdjust}
            disabled={isProcessing}
            className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-0 animate-spin" />
                Adjusting...
              </>
            ) : (
              <>
                <MessageSquare className="h-4 w-4 mr-0" />
                Adjust Tone
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ToneAdjustmentModal;
