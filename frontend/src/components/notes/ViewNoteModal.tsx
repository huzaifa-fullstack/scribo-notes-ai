import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import type { Note } from "../../types/note";
import { formatDistanceToNow } from "date-fns";
import { Pin, Archive, Calendar, Tag } from "lucide-react";

interface ViewNoteModalProps {
  open: boolean;
  note: Note | null;
  onClose: () => void;
}

const ViewNoteModal = ({ open, note, onClose }: ViewNoteModalProps) => {
  if (!note) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900 pr-8">
            {note.title}
          </DialogTitle>
          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 pt-3 border-b pb-3">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              <span>
                {formatDistanceToNow(new Date(note.updatedAt), {
                  addSuffix: true,
                })}
              </span>
            </div>
            {note.isPinned && (
              <div className="flex items-center gap-1.5 text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full">
                <Pin className="h-3.5 w-3.5 fill-yellow-600" />
                <span className="text-xs font-medium">Pinned</span>
              </div>
            )}
            {note.isArchived && (
              <div className="flex items-center gap-1.5 text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                <Archive className="h-3.5 w-3.5" />
                <span className="text-xs font-medium">Archived</span>
              </div>
            )}
          </div>
        </DialogHeader>

        <div className="mt-6 space-y-6">
          {/* Note Content */}
          <div className="prose prose-sm max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-strong:text-gray-900 prose-em:text-gray-600">
            <div
              className="text-gray-700 leading-7 text-base"
              dangerouslySetInnerHTML={{ __html: note.content }}
            />
          </div>

          {/* Tags Section */}
          {note.tags && note.tags.length > 0 && (
            <div className="pt-4 border-t">
              <div className="flex items-center gap-2 mb-3">
                <Tag className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Tags</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {note.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-sm px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full border border-blue-200 font-medium"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="pt-4 border-t text-xs text-gray-500 space-y-1">
            <p>Created: {new Date(note.createdAt).toLocaleString()}</p>
            <p>Last Updated: {new Date(note.updatedAt).toLocaleString()}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewNoteModal;
