import { useState, useEffect } from "react";
import { Plus, Search, Filter, Download } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { useNotesStore } from "../store/notesStore";
import { useAuthStore } from "../store/authStore";
import NoteCard from "../components/notes/NoteCard";
import CreateNoteModal from "../components/notes/CreateNoteModal";
import EditNoteModal from "../components/notes/EditNoteModal";
import ViewNoteModal from "../components/notes/ViewNoteModal";
import ExportImportModal from "../components/notes/ExportImportModal";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import type { Note } from "../types/note";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";
import { useToast } from "../components/ui/use-toast";

const DashboardPage = () => {
  const { notes, isLoading, fetchNotes, deleteNote, togglePin, toggleArchive } =
    useNotesStore();
  const { user, logout } = useAuthStore();
  const { toast } = useToast();

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterArchived, setFilterArchived] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewNote, setViewNote] = useState<Note | null>(null);
  const [exportImportModalOpen, setExportImportModalOpen] = useState(false);
  const [exportNoteId, setExportNoteId] = useState<string | null>(null);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const handleEdit = (note: Note) => {
    setSelectedNote(note);
    setEditModalOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setNoteToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!noteToDelete) return;

    try {
      await deleteNote(noteToDelete);
      toast({
        title: "Success!",
        description: "Note deleted successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete note.",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setNoteToDelete(null);
    }
  };

  const handleTogglePin = async (id: string) => {
    try {
      await togglePin(id);
      toast({
        title: "Success!",
        description: "Note pin status updated.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update pin status.",
        variant: "destructive",
      });
    }
  };

  const handleToggleArchive = async (id: string) => {
    try {
      await toggleArchive(id);
      toast({
        title: "Success!",
        description: "Note archive status updated.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update archive status.",
        variant: "destructive",
      });
    }
  };

  const handleView = (note: Note) => {
    setViewNote(note);
    setViewModalOpen(true);
  };

  const handleExport = (noteId?: string) => {
    setExportNoteId(noteId || null);
    setExportImportModalOpen(true);
  };

  const filteredNotes = notes.filter((note) => {
    const matchesSearch =
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesArchived = filterArchived ? note.isArchived : !note.isArchived;
    return matchesSearch && matchesArchived;
  });

  const pinnedNotes = filteredNotes.filter((note) => note.isPinned);
  const regularNotes = filteredNotes.filter((note) => !note.isPinned);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Notes</h1>
              <p className="text-sm text-gray-500 mt-1">
                Welcome back, {user?.name}!
              </p>
            </div>
            <Button onClick={logout} variant="outline">
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-1">
            <Button
              variant={filterArchived ? "default" : "outline"}
              onClick={() => setFilterArchived(!filterArchived)}
              className="px-3"
            >
              <Filter className="h-4 w-4 mr-1" />
              {filterArchived ? "Archived" : "Active"}
            </Button>
            <Button
              variant="outline"
              onClick={() => handleExport()}
              className="px-3"
            >
              <Download className="h-4 w-4 mr-1" />
              Export/Import
            </Button>
            <Button onClick={() => setCreateModalOpen(true)} className="px-3">
              <Plus className="h-4 w-4 mr-1" />
              New Note
            </Button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredNotes.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Plus className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery
                ? "No notes found"
                : filterArchived
                ? "No archived notes"
                : "No notes yet"}
            </h3>
            <p className="text-gray-500 mb-4">
              {searchQuery
                ? "Try a different search term"
                : "Create your first note to get started"}
            </p>
            {!searchQuery && (
              <Button onClick={() => setCreateModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Note
              </Button>
            )}
          </div>
        )}

        {/* Notes Grid */}
        {!isLoading && filteredNotes.length > 0 && (
          <div className="space-y-8">
            {/* Pinned Notes */}
            {pinnedNotes.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="text-yellow-600 mr-2">📌</span>
                  Pinned Notes
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <AnimatePresence>
                    {pinnedNotes.map((note) => (
                      <NoteCard
                        key={note._id}
                        note={note}
                        onView={handleView}
                        onEdit={handleEdit}
                        onDelete={handleDeleteClick}
                        onTogglePin={handleTogglePin}
                        onToggleArchive={handleToggleArchive}
                        onExport={handleExport}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {/* Regular Notes */}
            {regularNotes.length > 0 && (
              <div>
                {pinnedNotes.length > 0 && (
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Other Notes
                  </h2>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <AnimatePresence>
                    {regularNotes.map((note) => (
                      <NoteCard
                        key={note._id}
                        note={note}
                        onView={handleView}
                        onEdit={handleEdit}
                        onDelete={handleDeleteClick}
                        onTogglePin={handleTogglePin}
                        onToggleArchive={handleToggleArchive}
                        onExport={handleExport}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modals */}
      <CreateNoteModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
      />

      <EditNoteModal
        open={editModalOpen}
        note={selectedNote}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedNote(null);
        }}
      />

      <ViewNoteModal
        open={viewModalOpen}
        note={viewNote}
        onClose={() => {
          setViewModalOpen(false);
          setViewNote(null);
        }}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-white border-2 border-gray-200">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-semibold text-gray-900">
              Are you sure?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600">
              This action cannot be undone. This will permanently delete your
              note.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel
              onClick={() => setNoteToDelete(null)}
              className="border-gray-300 hover:bg-gray-50"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Export/Import Modal */}
      <ExportImportModal
        open={exportImportModalOpen}
        noteId={exportNoteId}
        onClose={() => {
          setExportImportModalOpen(false);
          setExportNoteId(null);
        }}
        onImportSuccess={() => fetchNotes()}
      />
    </div>
  );
};

export default DashboardPage;
