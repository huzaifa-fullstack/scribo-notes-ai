import { useState, useEffect, useRef } from "react";
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
import OceanBackground from "../components/common/OceanBackground";
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
  const isInitialMount = useRef(true);

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
  // Pass unique filter key to maintain separate pagination for different filter states
  const filterKey = `${filterArchived ? "archived" : "active"}_${
    searchQuery.trim() || "all"
  }`;

  const {
    currentPage,
    totalPages,
    pinnedNotes,
    regularNotes,
    goToPage,
    resetPage,
  } = usePagination({
    notes: filteredNotes,
    filterKey,
  });

  // Reset to page 1 only when user actively changes filters (not on mount)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
    } else {
      resetPage();
    }
  }, [searchQuery, filterArchived, resetPage]);

  // Reset to page 1 when pinned notes count changes (pin/unpin operations)
  // This ensures user doesn't stay on a page that might be empty after pin/unpin
  useEffect(() => {
    if (!isInitialMount.current && pinnedNotes.length !== 0) {
      // Only reset if we're not on page 1 and notes have been loaded
      if (currentPage > 1 && filteredNotes.length > 0) {
        resetPage();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pinnedNotes.length]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-teal-50/20 relative">
      <OceanBackground isDark={false} />
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl shadow-sm border-b border-teal-100/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex-shrink min-w-0 max-w-[65%] sm:max-w-none">
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                Dashboard
              </h1>
              <p className="text-xs sm:text-sm mt-1.5 text-gray-600">
                Welcome back, {user?.name}! 👋
              </p>
            </div>
            {/* Desktop: UserDropdown + Logout */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <UserDropdown />
              <Button
                onClick={logout}
                variant="outline"
                className="bg-white/90 hover:bg-red-50 border-red-200 text-red-600 hover:text-red-700 hover:border-red-300 backdrop-blur-sm transition-all duration-300 hover:shadow-md font-medium text-xs sm:text-sm px-2 sm:px-4"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-8">
        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/90 border-gray-200 hover:border-teal-300 focus:border-teal-400 focus:ring-teal-400/20 backdrop-blur-sm transition-all duration-300 shadow-sm"
            />
          </div>
          <div className="flex gap-1.5 flex-shrink-0">
            <Button
              variant="outline"
              onClick={() => setFilterArchived(!filterArchived)}
              className={`px-2.5 sm:px-4 text-sm ${
                filterArchived
                  ? "bg-teal-600 text-white hover:bg-teal-700 border-teal-600 shadow-lg shadow-teal-200"
                  : "bg-white/90 hover:bg-teal-50 border-teal-200 text-teal-700 hover:text-teal-800 hover:border-teal-300"
              } backdrop-blur-sm transition-all duration-300 hover:shadow-md font-medium`}
            >
              <Filter className="h-4 w-4 mr-0" />
              {filterArchived ? "Archived" : "Active"}
            </Button>
            <Button
              variant="outline"
              onClick={handleBulkExportImport}
              className="px-2.5 sm:px-4 text-sm bg-white/90 hover:bg-cyan-50 border-cyan-200 text-cyan-700 hover:text-cyan-800 hover:border-cyan-300 backdrop-blur-sm transition-all duration-300 hover:shadow-md font-medium whitespace-nowrap"
            >
              <Download className="h-4 w-4 mr-0" />
              Export/Import
            </Button>
            {!filterArchived && (
              <Button
                onClick={() => setCreateModalOpen(true)}
                className="px-3 sm:px-5 text-sm bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white border-0 transition-all duration-300 hover:scale-105 font-medium whitespace-nowrap"
              >
                <Plus className="h-4 w-4 mr-0" />
                New Note
              </Button>
            )}
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 transition-colors duration-300"></div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredNotes.length === 0 && (
          <div className="text-center py-16">
            <div className="mb-6 inline-block relative">
              <Plus
                className="h-20 w-20 text-teal-600 animate-bounce"
                style={{ animationDuration: "1.5s" }}
              />
            </div>
            <h3 className="text-xl font-bold mb-2 bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
              {searchQuery
                ? "No notes found"
                : filterArchived
                ? "No archived notes"
                : "No notes yet"}
            </h3>
            <p className="mb-6 text-gray-600 max-w-md mx-auto">
              {searchQuery
                ? "Try a different search term"
                : filterArchived
                ? "Archive notes to see them here"
                : "Create your first note to get started"}
            </p>
            {!searchQuery && !filterArchived && (
              <Button
                onClick={() => setCreateModalOpen(true)}
                className="px-6 py-3 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white border-0 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 font-medium text-base"
              >
                <Plus className="h-4 w-4 mr-0" />
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
                <h2 className="text-lg font-semibold mb-4 flex items-center text-gray-900 transition-colors duration-300">
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
                        isDark={false}
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
                  <h2 className="text-lg font-semibold mb-4 text-gray-900 transition-colors duration-300">
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
                        isDark={false}
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
        key={selectedNote?._id || "new"}
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
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Move to Recycle Bin?</AlertDialogTitle>
            <AlertDialogDescription>
              This note will be moved to the recycle bin and automatically
              deleted after 30 days. You can restore it from the recycle bin
              before then.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => setNoteToDelete(null)}
              className="bg-white/90 hover:bg-gray-50 border-gray-300 text-gray-700 hover:text-gray-900 transition-all duration-300"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white transition-all duration-300"
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
              className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-medium px-6 transition-all duration-300"
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
