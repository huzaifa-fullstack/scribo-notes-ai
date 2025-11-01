import { motion } from "framer-motion";
import {
  Pin,
  Archive,
  Edit,
  Trash2,
  MoreVertical,
  Download,
} from "lucide-react";
import type { Note } from "../../types/note";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { formatDistanceToNow } from "date-fns";
import { getNoteColorScheme } from "../../utils/noteColors";

interface NoteCardProps {
  note: Note;
  onView: (note: Note) => void;
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
  onTogglePin: (id: string) => void;
  onToggleArchive: (id: string) => void;
  onExport: (noteId: string) => void;
  isDark?: boolean;
}

const NoteCard = ({
  note,
  onView,
  onEdit,
  onDelete,
  onTogglePin,
  onToggleArchive,
  onExport,
  isDark = false,
}: NoteCardProps) => {
  const handleDropdownClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  // Get color scheme based on tags and dark mode
  const colorScheme = getNoteColorScheme(note.tags, note._id, isDark);

  // For pinned notes, we'll use a special yellow border but keep the tag-based background
  const pinnedBorderClass = note.isPinned
    ? `border-2 ${
        isDark
          ? "border-yellow-500 shadow-lg shadow-yellow-900/30"
          : "border-yellow-400 shadow-lg shadow-yellow-100"
      }`
    : `border ${colorScheme.border} ${colorScheme.borderHover} shadow-md ${colorScheme.shadow} ${colorScheme.shadowHover}`;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 10 }}
      whileHover={{ scale: 1.02, y: -4 }}
      transition={{
        layout: { duration: 0.3, type: "spring", stiffness: 300, damping: 25 },
        duration: 0.25,
        ease: [0.4, 0, 0.2, 1],
      }}
      className="h-full"
    >
      <Card
        className={`h-full flex flex-col hover:shadow-xl transition-all cursor-pointer group ${pinnedBorderClass} ${colorScheme.background} ${colorScheme.backgroundHover} backdrop-blur-sm`}
        onClick={() => onView(note)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3
                className={`font-semibold text-lg overflow-hidden text-ellipsis line-clamp-1 ${colorScheme.text}`}
                style={{
                  display: "-webkit-box",
                  WebkitLineClamp: 1,
                  WebkitBoxOrient: "vertical",
                  wordBreak: "break-all",
                }}
                title={note.title}
              >
                {note.title}
              </h3>
              <p className={`text-xs mt-1 ${colorScheme.text} opacity-70`}>
                {formatDistanceToNow(new Date(note.updatedAt), {
                  addSuffix: true,
                })}
              </p>
            </div>

            <div
              className="flex items-center space-x-1 flex-shrink-0"
              onClick={handleDropdownClick}
            >
              {note.isPinned && (
                <Pin
                  className={`h-4 w-4 ${
                    isDark
                      ? "text-yellow-400 fill-yellow-400"
                      : "text-yellow-600 fill-yellow-600"
                  }`}
                />
              )}
              {note.isArchived && (
                <Archive
                  className={`h-4 w-4 ${
                    isDark ? "text-gray-400" : "text-gray-600"
                  }`}
                />
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`h-8 w-8 p-0 relative rounded-md ${
                      isDark ? "hover:bg-gray-700" : "hover:bg-teal-50"
                    } transition-colors duration-150`}
                  >
                    <MoreVertical
                      className={`h-4 w-4 ${
                        isDark ? "text-gray-300" : "text-gray-700"
                      }`}
                    />
                    <span
                      className={`absolute -top-1 -right-1 w-2 h-2 rounded-full ${
                        isDark ? "bg-teal-500" : "bg-teal-400"
                      } opacity-0 hover:opacity-100 transition-opacity duration-150 pointer-events-none`}
                    ></span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className={`min-w-[160px] ${
                    isDark
                      ? "bg-gray-800 border-gray-700"
                      : "bg-white border-gray-100"
                  } rounded-md shadow-lg p-1`}
                >
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(note);
                    }}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md ${
                      isDark
                        ? "hover:bg-gray-700 hover:text-teal-400 text-gray-200"
                        : "hover:bg-teal-50 hover:text-teal-700"
                    } transition-colors duration-150`}
                  >
                    <Edit className="h-4 w-4 mr-0.5" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onExport(note._id);
                    }}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md ${
                      isDark
                        ? "hover:bg-gray-700 hover:text-teal-400 text-gray-200"
                        : "hover:bg-teal-50 hover:text-teal-700"
                    } transition-colors duration-150`}
                  >
                    <Download className="h-4 w-4 mr-0.5" />
                    Export
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onTogglePin(note._id);
                    }}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md ${
                      isDark
                        ? "hover:bg-gray-700 hover:text-teal-400 text-gray-200"
                        : "hover:bg-teal-50 hover:text-teal-700"
                    } transition-colors duration-150`}
                  >
                    <Pin className="h-4 w-4 mr-0.5" />
                    {note.isPinned ? "Unpin" : "Pin"}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleArchive(note._id);
                    }}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md ${
                      isDark
                        ? "hover:bg-gray-700 hover:text-teal-400 text-gray-200"
                        : "hover:bg-teal-50 hover:text-teal-700"
                    } transition-colors duration-150`}
                  >
                    <Archive className="h-4 w-4 mr-0.5" />
                    {note.isArchived ? "Unarchive" : "Archive"}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(note._id);
                    }}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md ${
                      isDark
                        ? "text-red-400 hover:bg-red-900/30 hover:text-red-300"
                        : "text-red-600 hover:bg-red-50 hover:text-red-700"
                    } transition-colors duration-150`}
                  >
                    <Trash2 className="h-4 w-4 mr-0.5" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pb-4 flex-1 flex flex-col">
          {/* Fixed height content area */}
          <div className="flex-1 min-h-[80px] max-h-[80px] overflow-hidden">
            <div
              className={`text-sm prose prose-sm max-w-none line-clamp-3 ${colorScheme.text} opacity-80`}
              dangerouslySetInnerHTML={{ __html: note.content }}
            />
          </div>

          {/* Fixed height tags area */}
          <div className="h-8 mt-3">
            {note.tags && note.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {note.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className={`text-xs px-2 py-0.5 rounded-full truncate max-w-[80px] font-medium transition-colors ${colorScheme.tagBackground} ${colorScheme.tagText}`}
                  >
                    #{tag}
                  </span>
                ))}
                {note.tags.length > 3 && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      isDark
                        ? "bg-gray-700/50 text-gray-400"
                        : "bg-gray-100 text-gray-600 group-hover:bg-gray-200"
                    }`}
                  >
                    +{note.tags.length - 3}
                  </span>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default NoteCard;
