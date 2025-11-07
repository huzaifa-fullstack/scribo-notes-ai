import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
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

interface GenerateContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (context: string, options: any) => void;
  isProcessing: boolean;
}

const GenerateContentModal = ({
  isOpen,
  onClose,
  onGenerate,
  isProcessing,
}: GenerateContentModalProps) => {
  const { theme } = useTheme();
  const isDarkMode = theme === "dark";
  const [context, setContext] = useState("");
  const [style, setStyle] = useState("professional");
  const [length, setLength] = useState("medium");
  const [tone, setTone] = useState("neutral");

  const handleGenerate = () => {
    if (context.trim()) {
      onGenerate(context, { style, length, tone });
    }
  };

  const handleClose = () => {
    if (!isProcessing) {
      setContext("");
      setStyle("professional");
      setLength("medium");
      setTone("neutral");
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent
        className={`max-w-xl ${
          isDarkMode
            ? "bg-gray-900 border-gray-700"
            : "bg-white border-gray-200"
        }`}
      >
        <DialogHeader>
          <DialogTitle
            className={`flex items-center gap-2 ${
              isDarkMode ? "text-purple-400" : "text-purple-600"
            }`}
          >
            <Sparkles className="h-5 w-5" />
            Generate Content with AI
          </DialogTitle>
          <DialogDescription
            className={isDarkMode ? "text-gray-400" : "text-gray-600"}
          >
            Provide a brief context and let AI create detailed content for you
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Context Input */}
          <div className="space-y-2">
            <Label
              htmlFor="context"
              className={isDarkMode ? "text-gray-300" : "text-gray-700"}
            >
              What do you want to write about?
            </Label>
            <textarea
              id="context"
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="E.g., Benefits of cloud computing for small businesses..."
              rows={4}
              className={`w-full px-3 py-2 rounded-lg border text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                isDarkMode
                  ? "bg-gray-800 border-gray-600 text-gray-200 placeholder-gray-500"
                  : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
              }`}
              disabled={isProcessing}
            />
          </div>

          {/* Style Selection */}
          <div className="space-y-2">
            <Label
              htmlFor="style"
              className={isDarkMode ? "text-gray-300" : "text-gray-700"}
            >
              Writing Style
            </Label>
            <select
              id="style"
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                isDarkMode
                  ? "bg-gray-800 border-gray-600 text-gray-200"
                  : "bg-white border-gray-300 text-gray-900"
              }`}
              disabled={isProcessing}
            >
              <option value="professional">Professional</option>
              <option value="casual">Casual</option>
              <option value="academic">Academic</option>
            </select>
          </div>

          {/* Length Selection */}
          <div className="space-y-2">
            <Label
              htmlFor="length"
              className={isDarkMode ? "text-gray-300" : "text-gray-700"}
            >
              Length
            </Label>
            <div className="flex gap-2">
              {["short", "medium", "long"].map((len) => (
                <button
                  key={len}
                  type="button"
                  onClick={() => setLength(len)}
                  disabled={isProcessing}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    length === len
                      ? "bg-purple-600 text-white"
                      : isDarkMode
                      ? "bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-600"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300"
                  }`}
                >
                  {len.charAt(0).toUpperCase() + len.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Tone Selection */}
          <div className="space-y-2">
            <Label
              htmlFor="tone"
              className={isDarkMode ? "text-gray-300" : "text-gray-700"}
            >
              Tone
            </Label>
            <select
              id="tone"
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                isDarkMode
                  ? "bg-gray-800 border-gray-600 text-gray-200"
                  : "bg-white border-gray-300 text-gray-900"
              }`}
              disabled={isProcessing}
            >
              <option value="neutral">Neutral</option>
              <option value="positive">Positive</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-gray-700">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isProcessing}
            className={`${
              isDarkMode
                ? "border-gray-600 hover:bg-gray-800 text-gray-300"
                : ""
            }`}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleGenerate}
            disabled={!context.trim() || isProcessing}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GenerateContentModal;
