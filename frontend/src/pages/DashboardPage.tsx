import { useState, useEffect } from "react";
import { Plus, Search, Filter, Download, Pin } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { useNotesStore } from "../store/notesStore";
import { useAuthStore } from "../store/authStore";
import { usePagination } from "../hooks/usePagination";
import NoteCard from "../components/notes/NoteCard";
import CreateNoteModal from "../components/notes/CreateNoteModal";
import EditNoteModal from "../components/notes/EditNoteModal";
import ViewNoteModal from "../components/notes/ViewNoteModal";
import ExportImportModal from "../components/notes/ExportImportModal";
import UserDropdown from "../components/layout/UserDropdown";
import Pagination from "../components/ui/pagination";
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
  const [pinLimitDialogOpen, setPinLimitDialogOpen] = useState(false);

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
        description:
          "Note moved to recycle bin. It will be automatically deleted after 30 days.",
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
    const note = notes.find((n) => n._id === id);
    if (!note) return;

    // Check if trying to pin and already have 6 pinned notes
    if (!note.isPinned) {
      const currentPinnedCount = notes.filter(
        (n) => n.isPinned && !n.isDeleted && !n.isArchived
      ).length;

      if (currentPinnedCount >= 6) {
        setPinLimitDialogOpen(true);
        return;
      }
    }

    try {
      await togglePin(id);
      toast({
        title: "Success!",
        description: note.isPinned ? "Note unpinned." : "Note pinned.",
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

  const handleExportNote = (noteId: string) => {
    setExportNoteId(noteId);
    setExportImportModalOpen(true);
  };

  const handleBulkExportImport = () => {
    setExportNoteId(null);
    setExportImportModalOpen(true);
  };

  const handleImportSuccess = () => {
    fetchNotes(); // Refresh notes after import
  };

  const filteredNotes = notes.filter((note) => {
    // Exclude deleted notes from dashboard
    if (note.isDeleted) return false;

    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      note.title.toLowerCase().includes(searchLower) ||
      note.content.toLowerCase().includes(searchLower) ||
      (note.tags &&
        note.tags.some((tag) => tag.toLowerCase().includes(searchLower)));
    const matchesArchived = filterArchived ? note.isArchived : !note.isArchived;
    return matchesSearch && matchesArchived;
  });

  // Use pagination hook - shows ALL pinned notes, then paginated regular notes
  const {
    currentPage,
    totalPages,
    pinnedNotes,
    regularNotes,
    goToPage,
    resetPage,
  } = usePagination({
    notes: filteredNotes,
  });

  // Reset to page 1 when filters change
  useEffect(() => {
    resetPage();
  }, [searchQuery, filterArchived, resetPage]);

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
            {/* Desktop: UserDropdown + Logout */}
            <div className="flex items-center gap-2">
              <UserDropdown />
              <Button onClick={logout} variant="outline">
                Logout
              </Button>
            </div>
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
              variant="outline"
              onClick={() => setFilterArchived(!filterArchived)}
              className={`px-3 ${
                filterArchived
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : ""
              }`}
            >
              <Filter className="h-4 w-4 mr-0.5" />
              {filterArchived ? "Archived" : "Active"}
            </Button>
            <Button
              variant="outline"
              onClick={handleBulkExportImport}
              className="px-3"
            >
              <Download className="h-4 w-4 mr-0.5" />
              Export/Import
            </Button>
            {!filterArchived && (
              <Button
                variant="outline"
                onClick={() => setCreateModalOpen(true)}
                className="px-3"
              >
                <Plus className="h-4 w-4 mr-0.5" />
                New Note
              </Button>
            )}
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
                : filterArchived
                ? "Archive notes to see them here"
                : "Create your first note to get started"}
            </p>
            {!searchQuery && !filterArchived && (
              <Button onClick={() => setCreateModalOpen(true)}>
                <Plus className="h-4 w-4 mr-1.5" />
                Create Note
              </Button>
            )}
          </div>
        )}

        {/* Notes Grid */}
        {!isLoading && filteredNotes.length > 0 && (
          <div className="space-y-8">
            {/* Pinned Notes - Always show ALL pinned notes */}
            {pinnedNotes.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="text-yellow-600 mr-2">📌</span>
                  Pinned Notes
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <AnimatePresence mode="popLayout">
                    {pinnedNotes.map((note) => (
                      <NoteCard
                        key={note._id}
                        note={note}
                        onView={handleView}
                        onEdit={handleEdit}
                        onDelete={handleDeleteClick}
                        onTogglePin={handleTogglePin}
                        onToggleArchive={handleToggleArchive}
                        onExport={handleExportNote}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {/* Regular Notes - Paginated */}
            {regularNotes.length > 0 && (
              <div>
                {pinnedNotes.length > 0 && (
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Other Notes
                  </h2>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <AnimatePresence mode="popLayout">
                    {regularNotes.map((note) => (
                      <NoteCard
                        key={note._id}
                        note={note}
                        onView={handleView}
                        onEdit={handleEdit}
                        onDelete={handleDeleteClick}
                        onTogglePin={handleTogglePin}
                        onToggleArchive={handleToggleArchive}
                        onExport={handleExportNote}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Pagination - Only show for regular notes */}
        {!isLoading && regularNotes.length > 0 && totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={goToPage}
          />
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

      <ExportImportModal
        open={exportImportModalOpen}
        onClose={() => {
          setExportImportModalOpen(false);
          setExportNoteId(null);
        }}
        noteId={exportNoteId}
        onImportSuccess={handleImportSuccess}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Move to Recycle Bin?</AlertDialogTitle>
            <AlertDialogDescription>
              This note will be moved to the recycle bin and automatically
              deleted after 30 days. You can restore it from the recycle bin
              before then.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setNoteToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              Move to Recycle Bin
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Pin Limit Dialog */}
      <AlertDialog
        open={pinLimitDialogOpen}
        onOpenChange={setPinLimitDialogOpen}
      >
        <AlertDialogContent className="bg-white max-w-md">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-yellow-100 rounded-full">
                <Pin className="h-6 w-6 text-yellow-600" />
              </div>
              <AlertDialogTitle className="text-xl">
                Pin Limit Reached!
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-base leading-relaxed pt-2">
              <div className="space-y-2">
                <p className="text-gray-700">
                  You've reached the maximum of{" "}
                  <span className="font-semibold text-yellow-600">
                    6 pinned notes
                  </span>
                  .
                </p>
                <p className="text-gray-600">
                  Please unpin a note first to pin this one. Pinned notes appear
                  at the top for quick access.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={() => setPinLimitDialogOpen(false)}
              className="bg-yellow-600 hover:bg-yellow-700 text-white font-medium px-6"
            >
              Got it!
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DashboardPage;
