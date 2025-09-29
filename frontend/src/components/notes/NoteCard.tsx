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
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
  onTogglePin: (id: string) => void;
  onToggleArchive: (id: string) => void;
}

const NoteCard = ({
  note,
  onEdit,
  onDelete,
  onTogglePin,
  onToggleArchive,
}: NoteCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        className={`h-full hover:shadow-lg transition-shadow ${
          note.isPinned ? "border-yellow-400 border-2" : ""
        }`}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-lg text-gray-900 line-clamp-1">
                {note.title}
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                {formatDistanceToNow(new Date(note.updatedAt), {
                  addSuffix: true,
                })}
              </p>
            </div>

            <div className="flex items-center space-x-1">
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
                  <DropdownMenuItem onClick={() => onEdit(note)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onTogglePin(note._id)}>
                    <Pin className="h-4 w-4 mr-2" />
                    {note.isPinned ? "Unpin" : "Pin"}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onToggleArchive(note._id)}>
                    <Archive className="h-4 w-4 mr-2" />
                    {note.isArchived ? "Unarchive" : "Archive"}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onDelete(note._id)}
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

        <CardContent className="pb-4">
          <p className="text-sm text-gray-600 line-clamp-3 whitespace-pre-wrap">
            {note.content}
          </p>

          {note.tags && note.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {note.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default NoteCard;
