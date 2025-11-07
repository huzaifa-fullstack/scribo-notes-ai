import { useEditor, EditorContent } from "@tiptap/react";
import { useEffect, useState } from "react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Highlight from "@tiptap/extension-highlight";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import {
  Bold,
  Italic,
  Undo,
  Redo,
  Code,
  Strikethrough,
  Highlighter,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import AIToolbar from "./AIToolbar";
import AIResultModal from "./AIResultModal";
import GenerateContentModal from "./GenerateContentModal";
import ToneAdjustmentModal from "./ToneAdjustmentModal";
import * as aiService from "../../services/aiService";
import { toast } from "sonner";
import type { AIActionType } from "../../types/ai";

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  onTagsSuggested?: (tags: string[]) => void;
}

const RichTextEditor = ({
  content,
  onChange,
  placeholder = "Start writing...",
  onTagsSuggested,
}: RichTextEditorProps) => {
  const { theme } = useTheme();
  const isDarkMode = theme === "dark";

  // AI state management
  const [isProcessing, setIsProcessing] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showToneModal, setShowToneModal] = useState(false);
  const [textForToneAdjustment, setTextForToneAdjustment] = useState(""); // Store text for tone adjustment
  const [aiResult, setAiResult] = useState<{
    type: "grammar" | "summary" | "generate" | "enhance" | "tone" | "tags";
    title: string;
    original?: string;
    result: string;
    metadata?: any;
  } | null>(null);
  const [selectedText, setSelectedText] = useState("");

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder,
      }),
      Highlight,
      TextStyle,
      Color,
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    onSelectionUpdate: ({ editor }) => {
      const { from, to } = editor.state.selection;
      const text = editor.state.doc.textBetween(from, to, " ");
      setSelectedText(text);
    },
    editorProps: {
      attributes: {
        class: isDarkMode
          ? "prose prose-sm sm:prose lg:prose-lg xl:prose-xl prose-invert focus:outline-none min-h-[200px] max-w-none text-white"
          : "prose prose-sm sm:prose lg:prose-lg xl:prose-xl focus:outline-none min-h-[200px] max-w-none",
      },
    },
    immediatelyRender: false,
  });

  // Sync editor content when prop changes (fixes blank edit issue)
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  // AI Action Handlers
  const handleAIAction = async (action: AIActionType) => {
    if (!editor) return;

    // Generate Content and Suggest Tags don't need text - they open modals or work on all content
    if (action === "generate") {
      setShowGenerateModal(true);
      return;
    }

    if (action === "adjust-tone") {
      // For tone adjustment, use selected text or all content
      const text = selectedText || editor.getText();
      if (!text.trim()) {
        toast.error("No content to process");
        return;
      }
      // Store the text for tone adjustment
      setTextForToneAdjustment(text);
      setShowToneModal(true);
      return;
    }

    // For other actions, use selected text if available, otherwise use all content
    const text = selectedText || editor.getText();

    if (!text.trim()) {
      toast.error("No content to process");
      return;
    }

    try {
      setIsProcessing(true);

      switch (action) {
        case "fix-grammar":
          await handleGrammarCorrection(text);
          break;
        case "summarize":
          await handleSummarize(text);
          break;
        case "enhance":
          await handleEnhance(text);
          break;
        case "suggest-tags":
          await handleSuggestTags(text);
          break;
      }
    } catch (error: any) {
      toast.error(error.message || "AI processing failed");
      setIsProcessing(false);
    }
  };

  const handleGrammarCorrection = async (text: string) => {
    const result = await aiService.correctGrammar(text);
    setIsProcessing(false);

    if (result.changes) {
      setAiResult({
        type: "grammar",
        title: "Grammar & Spelling Correction",
        original: result.original,
        result: result.corrected,
      });
      setShowResultModal(true);
    } else {
      toast.success("No grammar errors found!");
    }
  };

  const handleSummarize = async (text: string) => {
    const result = await aiService.summarizeText({ text });
    setIsProcessing(false);
    setAiResult({
      type: "summary",
      title: "Note Summary",
      original: result.original,
      result: result.summary,
      metadata: { compressionRatio: result.compressionRatio },
    });
    setShowResultModal(true);
  };

  const handleEnhance = async (text: string) => {
    const result = await aiService.enhanceContent({
      text,
      style: "professional",
    });
    setIsProcessing(false);
    setAiResult({
      type: "enhance",
      title: "Enhanced Content",
      original: result.original,
      result: result.enhanced,
    });
    setShowResultModal(true);
  };

  const handleSuggestTags = async (text: string) => {
    const result = await aiService.suggestTags({ text });
    setIsProcessing(false);
    setAiResult({
      type: "tags",
      title: "Suggested Tags",
      result: JSON.stringify(result.allSuggestions),
      metadata: { keywords: result.keywords },
    });
    setShowResultModal(true);
  };

  const handleGenerateContent = async (context: string, options: any) => {
    try {
      setIsProcessing(true);
      const result = await aiService.generateContent({ context, ...options });
      setIsProcessing(false);
      setShowGenerateModal(false);
      setAiResult({
        type: "generate",
        title: "Generated Content",
        result: result.generated,
      });
      setShowResultModal(true);
    } catch (error: any) {
      toast.error(error.message || "Content generation failed");
      setIsProcessing(false);
    }
  };

  const handleAdjustTone = async (tone: string) => {
    try {
      setIsProcessing(true);
      const result = await aiService.adjustTone({
        text: textForToneAdjustment,
        tone: tone as "professional" | "casual" | "formal" | "enthusiastic",
      });
      setIsProcessing(false);
      setShowToneModal(false);
      setAiResult({
        type: "tone",
        title: `Tone Adjusted (${tone})`,
        original: result.original,
        result: result.adjusted,
      });
      setShowResultModal(true);
    } catch (error: any) {
      toast.error(error.message || "Tone adjustment failed");
      setIsProcessing(false);
    }
  };

  const handleAcceptAI = () => {
    if (!aiResult || !editor) return;

    if (aiResult.type === "tags") {
      // For tags, call the callback
      try {
        const tags = JSON.parse(aiResult.result);
        const tagNames = tags.map((t: any) => t.tag || t);
        if (onTagsSuggested) {
          onTagsSuggested(tagNames);
        }
        toast.success("Tags suggested!");
      } catch (e) {
        toast.error("Failed to process tags");
      }
    } else if (aiResult.original) {
      // We have original text, so we should replace it with the AI result
      const currentContent = editor.getText();

      // Find and replace the original text with the AI result
      if (currentContent.includes(aiResult.original)) {
        const newContent = currentContent.replace(
          aiResult.original,
          aiResult.result
        );
        editor.commands.setContent(newContent);
        toast.success("AI suggestion applied!");
      } else {
        // If original text not found (content changed), just insert the result
        editor.commands.setContent(aiResult.result);
        toast.success("AI suggestion applied!");
      }
    } else {
      // Insert at cursor or replace all content
      if (aiResult.type === "generate") {
        editor.commands.setContent(aiResult.result);
      } else {
        editor.commands.insertContent(aiResult.result);
      }
      toast.success("AI suggestion applied!");
    }

    setShowResultModal(false);
    setAiResult(null);
  };

  const handleRejectAI = () => {
    setShowResultModal(false);
    setAiResult(null);
    toast.info("AI suggestion rejected");
  };

  if (!editor) {
    return null;
  }

  const MenuButton = ({ onClick, active, children }: any) => (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (editor && !editor.isDestroyed) {
          onClick();
        }
      }}
      className={`p-2 rounded transition-colors ${
        active
          ? isDarkMode
            ? "bg-gray-700 text-teal-400"
            : "bg-gray-200 text-blue-600"
          : isDarkMode
          ? "text-gray-400 hover:bg-gray-700"
          : "text-gray-600 hover:bg-gray-200"
      }`}
    >
      {children}
    </button>
  );

  return (
    <div
      className={`border rounded-lg overflow-hidden ${
        isDarkMode ? "border-gray-600 bg-gray-800" : "border-gray-300 bg-white"
      }`}
    >
      {/* Toolbar */}
      <div
        className={`border-b p-2 flex flex-wrap gap-1 ${
          isDarkMode
            ? "bg-gray-900 border-gray-600"
            : "bg-gray-50 border-gray-300"
        }`}
      >
        <MenuButton
          onClick={() => {
            if (editor && !editor.isDestroyed) {
              editor.chain().focus().toggleBold().run();
            }
          }}
          active={editor.isActive("bold")}
        >
          <Bold className="h-4 w-4" />
        </MenuButton>

        <MenuButton
          onClick={() => {
            if (editor && !editor.isDestroyed) {
              editor.chain().focus().toggleItalic().run();
            }
          }}
          active={editor.isActive("italic")}
        >
          <Italic className="h-4 w-4" />
        </MenuButton>

        <MenuButton
          onClick={() => {
            if (editor && !editor.isDestroyed) {
              editor.chain().focus().toggleStrike().run();
            }
          }}
          active={editor.isActive("strike")}
        >
          <Strikethrough className="h-4 w-4" />
        </MenuButton>

        <div className="w-px bg-gray-300 mx-1" />

        <MenuButton
          onClick={() => {
            if (editor && !editor.isDestroyed) {
              editor.chain().focus().toggleCodeBlock().run();
            }
          }}
          active={editor.isActive("codeBlock")}
        >
          <Code className="h-4 w-4" />
        </MenuButton>

        <MenuButton
          onClick={() => {
            if (editor && !editor.isDestroyed) {
              editor.chain().focus().toggleHighlight().run();
            }
          }}
          active={editor.isActive("highlight")}
        >
          <Highlighter className="h-4 w-4" />
        </MenuButton>

        <div className="w-px bg-gray-300 mx-1" />

        <MenuButton
          onClick={() => {
            if (editor && !editor.isDestroyed) {
              editor.chain().focus().undo().run();
            }
          }}
        >
          <Undo className="h-4 w-4" />
        </MenuButton>

        <MenuButton
          onClick={() => {
            if (editor && !editor.isDestroyed) {
              editor.chain().focus().redo().run();
            }
          }}
        >
          <Redo className="h-4 w-4" />
        </MenuButton>

        <div className="w-px bg-gray-300 mx-1" />

        {/* AI Toolbar */}
        <AIToolbar
          onAction={handleAIAction}
          isProcessing={isProcessing}
          selectedText={selectedText}
        />
      </div>

      {/* Editor Content */}
      <div className={`p-4 ${isDarkMode ? "bg-gray-800" : "bg-white"}`}>
        <EditorContent editor={editor} />
      </div>

      {/* AI Modals */}
      {aiResult && (
        <AIResultModal
          isOpen={showResultModal}
          onClose={() => setShowResultModal(false)}
          title={aiResult.title}
          original={aiResult.original}
          result={aiResult.result}
          onAccept={handleAcceptAI}
          onReject={handleRejectAI}
          type={aiResult.type}
          metadata={aiResult.metadata}
        />
      )}

      <GenerateContentModal
        isOpen={showGenerateModal}
        onClose={() => setShowGenerateModal(false)}
        onGenerate={handleGenerateContent}
        isProcessing={isProcessing}
      />

      <ToneAdjustmentModal
        isOpen={showToneModal}
        onClose={() => setShowToneModal(false)}
        onAdjust={handleAdjustTone}
        isProcessing={isProcessing}
        selectedText={selectedText}
      />
    </div>
  );
};

export default RichTextEditor;
