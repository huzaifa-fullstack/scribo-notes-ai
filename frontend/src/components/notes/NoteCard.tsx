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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ scale: 1.02, y: -4 }}
      transition={{ duration: 0.2 }}
      className="h-full"
    >
      <Card
        className={`h-full flex flex-col hover:shadow-xl transition-all cursor-pointer group ${
          note.isPinned
            ? "border-2 border-yellow-400 shadow-lg shadow-yellow-100"
            : "border border-gray-200 hover:border-teal-300 shadow-md hover:shadow-teal-100"
        } ${
          isDark
            ? "bg-slate-800/80 hover:bg-slate-800/90 border-slate-700 backdrop-blur-sm"
            : "bg-white/95 backdrop-blur-sm hover:bg-white"
        }`}
        onClick={() => onView(note)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3
                className={`font-semibold text-lg overflow-hidden text-ellipsis line-clamp-1 ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
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
              <p
                className={`text-xs mt-1 ${
                  isDark ? "text-gray-400" : "text-gray-500"
                }`}
              >
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
                <Pin className="h-4 w-4 text-yellow-600 fill-yellow-600" />
              )}
              {note.isArchived && <Archive className="h-4 w-4 text-gray-600" />}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 relative rounded-md hover:bg-teal-50 transition-colors duration-150"
                  >
                    <MoreVertical className="h-4 w-4 text-gray-700" />
                    <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-teal-400 opacity-0 hover:opacity-100 transition-opacity duration-150 pointer-events-none"></span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="min-w-[160px] bg-white border border-gray-100 rounded-md shadow-lg p-1"
                >
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(note);
                    }}
                    className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-teal-50 hover:text-teal-700 transition-colors duration-150"
                  >
                    <Edit className="h-4 w-4 mr-0.5" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onExport(note._id);
                    }}
                    className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-teal-50 hover:text-teal-700 transition-colors duration-150"
                  >
                    <Download className="h-4 w-4 mr-0.5" />
                    Export
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onTogglePin(note._id);
                    }}
                    className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-teal-50 hover:text-teal-700 transition-colors duration-150"
                  >
                    <Pin className="h-4 w-4 mr-0.5" />
                    {note.isPinned ? "Unpin" : "Pin"}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleArchive(note._id);
                    }}
                    className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-teal-50 hover:text-teal-700 transition-colors duration-150"
                  >
                    <Archive className="h-4 w-4 mr-0.5" />
                    {note.isArchived ? "Unarchive" : "Archive"}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(note._id);
                    }}
                    className="flex items-center gap-2 px-3 py-2 rounded-md text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors duration-150"
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
              className={`text-sm prose prose-sm max-w-none line-clamp-3 ${
                isDark ? "text-gray-300" : "text-gray-600"
              }`}
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
                    className={`text-xs px-2 py-0.5 rounded-full truncate max-w-[80px] font-medium transition-colors ${
                      isDark
                        ? "bg-teal-900/50 text-teal-300"
                        : "bg-gradient-to-r from-teal-50 to-cyan-50 text-teal-700 group-hover:from-teal-100 group-hover:to-cyan-100"
                    }`}
                  >
                    #{tag}
                  </span>
                ))}
                {note.tags.length > 3 && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      isDark
                        ? "bg-slate-700/50 text-gray-400"
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
