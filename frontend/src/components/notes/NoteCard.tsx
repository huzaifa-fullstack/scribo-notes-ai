import { motion } from "framer-motion";
import { Pin, Archive, Edit, Trash2, MoreVertical } from "lucide-react";
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
}

const NoteCard = ({
  note,
  onView,
  onEdit,
  onDelete,
  onTogglePin,
  onToggleArchive,
}: NoteCardProps) => {
  const handleDropdownClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className="h-full"
    >
      <Card
        className={`h-full flex flex-col hover:shadow-lg transition-shadow cursor-pointer ${
          note.isPinned ? "border-yellow-400 border-2" : ""
        }`}
        onClick={() => onView(note)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg text-gray-900 truncate">
                {note.title}
              </h3>
              <p className="text-xs text-gray-500 mt-1">
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
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(note);
                    }}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onTogglePin(note._id);
                    }}
                  >
                    <Pin className="h-4 w-4 mr-2" />
                    {note.isPinned ? "Unpin" : "Pin"}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleArchive(note._id);
                    }}
                  >
                    <Archive className="h-4 w-4 mr-2" />
                    {note.isArchived ? "Unarchive" : "Archive"}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(note._id);
                    }}
                    className="text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
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
              className="text-sm text-gray-600 prose prose-sm max-w-none line-clamp-3"
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
                    className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full truncate max-w-[80px]"
                  >
                    #{tag}
                  </span>
                ))}
                {note.tags.length > 3 && (
                  <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
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
