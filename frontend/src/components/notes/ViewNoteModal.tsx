import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import type { Note } from "../../types/note";
import { formatDistanceToNow } from "date-fns";
import { Pin, Archive, Calendar, Tag } from "lucide-react";
import { getNoteColorScheme } from "../../utils/noteColors";
import { useTheme } from "../../context/ThemeContext";

interface ViewNoteModalProps {
  open: boolean;
  note: Note | null;
  onClose: () => void;
}

const ViewNoteModal = ({ open, note, onClose }: ViewNoteModalProps) => {
  const { theme } = useTheme();
  const isDarkMode = theme === "dark";

  if (!note) return null;

  // Get color scheme based on tags and dark mode
  const colorScheme = getNoteColorScheme(note.tags, note._id, isDarkMode);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className={`sm:max-w-[700px] max-h-[85vh] overflow-y-auto ${
          colorScheme.backgroundSolid
        } ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}
      >
        <DialogHeader>
          <DialogTitle
            className={`text-2xl font-bold pr-8 ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}
          >
            {note.title}
          </DialogTitle>
          <div
            className={`flex flex-wrap items-center gap-3 text-sm pt-3 border-b pb-3 ${
              isDarkMode
                ? "text-gray-400 border-gray-700"
                : "text-gray-500 border-gray-200"
            }`}
          >
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              <span>
                {formatDistanceToNow(new Date(note.updatedAt), {
                  addSuffix: true,
                })}
              </span>
            </div>
            {note.isPinned && (
              <div
                className={`flex items-center gap-1.5 px-2 py-1 rounded-full ${
                  isDarkMode
                    ? "text-teal-400 bg-teal-900/30"
                    : "text-teal-600 bg-teal-50"
                }`}
              >
                <Pin
                  className={`h-3.5 w-3.5 ${
                    isDarkMode ? "fill-teal-400" : "fill-teal-600"
                  }`}
                />
                <span className="text-xs font-medium">Pinned</span>
              </div>
            )}
            {note.isArchived && (
              <div
                className={`flex items-center gap-1.5 px-2 py-1 rounded-full ${
                  isDarkMode
                    ? "text-gray-400 bg-gray-800"
                    : "text-gray-600 bg-gray-100"
                }`}
              >
                <Archive className="h-3.5 w-3.5" />
                <span className="text-xs font-medium">Archived</span>
              </div>
            )}
          </div>
        </DialogHeader>

        <div className="mt-6 space-y-6">
          {/* Note Content */}
          <div
            className={`prose prose-sm max-w-none [&_p]:min-h-[1.5em] ${
              isDarkMode
                ? "prose-invert prose-headings:text-white prose-p:text-white prose-strong:text-white prose-em:text-gray-300 [&_*]:text-white"
                : "prose-headings:text-gray-900 prose-p:text-gray-700 prose-strong:text-gray-900 prose-em:text-gray-600"
            }`}
            dangerouslySetInnerHTML={{ __html: note.content }}
          />

          {/* Tags Section */}
          {note.tags && note.tags.length > 0 && (
            <div
              className={`pt-4 border-t ${
                isDarkMode ? "border-gray-700" : "border-gray-200"
              }`}
            >
              <div className="flex items-center gap-2 mb-3">
                <Tag
                  className={`h-4 w-4 ${
                    isDarkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                />
                <span
                  className={`text-sm font-medium ${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Tags
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {note.tags.map((tag) => (
                  <span
                    key={tag}
                    className={`text-sm px-3 py-1.5 ${colorScheme.tagBackground} ${colorScheme.tagText} rounded-full border ${colorScheme.border} font-medium`}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Metadata */}
          <div
            className={`pt-4 border-t text-xs space-y-1 ${
              isDarkMode
                ? "border-gray-700 text-gray-400"
                : "border-gray-200 text-gray-500"
            }`}
          >
            <p>Created: {new Date(note.createdAt).toLocaleString()}</p>
            <p>Last Updated: {new Date(note.updatedAt).toLocaleString()}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewNoteModal;
