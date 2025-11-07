import { useEditor, EditorContent } from "@tiptap/react";
import { useEffect } from "react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
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

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

const RichTextEditor = ({
  content,
  onChange,
  placeholder = "Start writing...",
}: RichTextEditorProps) => {
  const { theme } = useTheme();
  const isDarkMode = theme === "dark";

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder,
      }),
      Link.configure({
        openOnClick: false,
      }),
      Highlight,
      TextStyle,
      Color,
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
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
      </div>

      {/* Editor Content */}
      <div className={`p-4 ${isDarkMode ? "bg-gray-800" : "bg-white"}`}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

export default RichTextEditor;
