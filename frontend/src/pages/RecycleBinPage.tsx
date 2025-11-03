import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Trash2,
  RotateCcw,
  Trash,
  ArrowLeft,
  AlertTriangle,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useNotesStore } from "../store/notesStore";
import { useAuthStore } from "../store/authStore";
import { useTheme } from "../context/ThemeContext";
import UserDropdown from "../components/layout/UserDropdown";
import Pagination from "../components/ui/pagination";
import { Button } from "../components/ui/button";
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
import { Card, CardContent, CardHeader } from "../components/ui/card";
import { formatDistanceToNow, differenceInDays } from "date-fns";
import LogoutAnimation from "../components/common/LogoutAnimation";

const RECYCLE_BIN_RETENTION_DAYS = 30;

const RecycleBinPage = () => {
  const navigate = useNavigate();
  const {
    recycleNotes,
    fetchRecycleBin,
    restoreNote,
    permanentlyDeleteNote,
    emptyRecycleBin,
  } = useNotesStore();
  const { logout } = useAuthStore();
  const { toast } = useToast();
  const { theme } = useTheme();
  const isDarkMode = theme === "dark";

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null);
  const [emptyBinDialogOpen, setEmptyBinDialogOpen] = useState(false);
  const [showLogoutAnimation, setShowLogoutAnimation] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Use recycleNotes from store and auto-delete expired ones
  const deletedNotes = recycleNotes.filter((note) => {
    if (!note.isDeleted || !note.deletedAt) return false;

    const deletedDate = new Date(note.deletedAt);
    const daysInBin = differenceInDays(new Date(), deletedDate);

    // Auto-delete notes older than retention period
    if (daysInBin >= RECYCLE_BIN_RETENTION_DAYS) {
      permanentlyDeleteNote(note._id).catch(console.error);
      return false;
    }

    return true;
  });

  // Simple pagination for recycle bin (no pinned/unpinned separation)
  const ITEMS_PER_PAGE = 9;
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(deletedNotes.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentPageNotes = deletedNotes.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Reset to page 1 when notes change
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [deletedNotes.length, currentPage, totalPages]);

  // Fetch recycle bin data on mount with minimum 2s display time
  useEffect(() => {
    const loadData = async () => {
      const startTime = Date.now();
      try {
        await fetchRecycleBin();
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, 2000 - elapsed);
        // Wait remaining time to ensure minimum 2s loading display
        if (remaining > 0) {
          await new Promise((resolve) => setTimeout(resolve, remaining));
        }
      } catch (error) {
        console.error("Failed to fetch recycle bin:", error);
      } finally {
        setIsInitialLoading(false);
      }
    };
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRestore = async (id: string) => {
    try {
      await restoreNote(id);
      toast({
        title: "Success!",
        description: "Note restored successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to restore note.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteClick = (id: string) => {
    setNoteToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!noteToDelete) return;

    try {
      await permanentlyDeleteNote(noteToDelete);
      toast({
        title: "Success!",
        description: "Note permanently deleted.",
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

  const handleEmptyBinClick = () => {
    setEmptyBinDialogOpen(true);
  };

  const handleEmptyBinConfirm = async () => {
    try {
      await emptyRecycleBin();
      toast({
        title: "Success!",
        description: "Recycle bin emptied successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to empty recycle bin.",
        variant: "destructive",
      });
    } finally {
      setEmptyBinDialogOpen(false);
    }
  };

  const getDaysRemaining = (deletedAt: string) => {
    const deletedDate = new Date(deletedAt);
    const daysInBin = differenceInDays(new Date(), deletedDate);
    return RECYCLE_BIN_RETENTION_DAYS - daysInBin;
  };

  const handleLogout = () => {
    setShowLogoutAnimation(true);
    setTimeout(() => {
      logout();
    }, 3000);
  };

  return (
    <div
      className={`min-h-screen ${isDarkMode ? "bg-slate-950" : "bg-gray-50"}`}
    >
      {/* Header */}
      <header
        className={`${
          isDarkMode
            ? "bg-gray-900/80 border-red-600/30"
            : "bg-white border-gray-200"
        } backdrop-blur-xl shadow-sm border-b sticky top-0 z-50`}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-shrink min-w-0 max-w-[65%] sm:max-w-none">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/dashboard")}
                className={`flex-shrink-0 ${
                  isDarkMode
                    ? "hover:bg-gray-800 text-white"
                    : "hover:bg-gray-100 text-gray-900"
                } transition-all duration-300 -ml-2`}
              >
                <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
              <div className="min-w-0">
                <h1
                  className={`text-2xl sm:text-3xl font-bold ${
                    isDarkMode ? "text-teal-400" : "text-teal-600"
                  }`}
                >
                  Recycle Bin
                </h1>
                <p
                  className={`text-xs sm:text-sm mt-1.5 ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Auto-deleted after {RECYCLE_BIN_RETENTION_DAYS} days
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <UserDropdown />
              <Button
                onClick={handleLogout}
                variant="outline"
                className={`${
                  isDarkMode
                    ? "bg-red-600/20 border-red-600 text-red-500 hover:bg-red-600 hover:text-white"
                    : "bg-white/90 border-red-200 text-red-600 hover:bg-red-600 hover:text-white hover:border-red-600"
                } backdrop-blur-sm transition-all duration-300 hover:shadow-md font-medium text-xs sm:text-sm px-2 sm:px-4`}
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Loading State */}
        {isInitialLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="relative"
            >
              {/* Animated Recycle Bin Icon */}
              <motion.div
                animate={{
                  y: [0, -10, 0],
                  rotate: [0, -5, 5, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <Trash2
                  className={`h-20 w-20 ${
                    isDarkMode ? "text-red-500" : "text-red-600"
                  }`}
                />
              </motion.div>

              {/* Pulsing Ring */}
              <motion.div
                className={`absolute inset-0 border-4 rounded-full ${
                  isDarkMode ? "border-red-500/30" : "border-red-600/30"
                }`}
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 0, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </motion.div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className={`mt-6 text-lg font-medium ${
                isDarkMode ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Loading recycle bin...
            </motion.p>
          </div>
        ) : (
          <>
            {/* Actions Bar */}
            {deletedNotes.length > 0 && (
              <div className="mb-6 flex justify-between items-center">
                <div
                  className={`text-sm ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  {deletedNotes.length}{" "}
                  {deletedNotes.length === 1 ? "note" : "notes"} in recycle bin
                </div>
                <Button
                  variant="outline"
                  onClick={handleEmptyBinClick}
                  className={`gap-2 ${
                    isDarkMode
                      ? "bg-red-600/20 border-red-600 text-red-500 hover:bg-red-600/30"
                      : "bg-red-50 hover:bg-red-100 border-red-200 text-red-600 hover:text-red-700 hover:border-red-300"
                  } transition-all duration-300`}
                >
                  <Trash className="h-4 w-4" />
                  Empty Recycle Bin
                </Button>
              </div>
            )}

            {/* Empty State */}
            {deletedNotes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Trash2
                  className={`h-24 w-24 ${
                    isDarkMode ? "text-gray-700" : "text-gray-300"
                  } mb-4`}
                />
                <h2
                  className={`text-2xl font-semibold ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  } mb-2`}
                >
                  Recycle Bin is Empty
                </h2>
                <p className="text-gray-500 text-center max-w-md">
                  Deleted notes will appear here and will be automatically
                  removed after {RECYCLE_BIN_RETENTION_DAYS} days.
                </p>
              </div>
            ) : (
              /* Notes Grid */
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <AnimatePresence mode="popLayout">
                    {currentPageNotes.map((note) => (
                      <motion.div
                        key={note._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.2 }}
                        className="h-full"
                      >
                        <Card
                          className={`h-full flex flex-col ${
                            isDarkMode
                              ? "bg-gray-900 border-red-900/50 hover:shadow-lg hover:shadow-red-900/20"
                              : "bg-white border-red-200 hover:shadow-lg"
                          } transition-shadow`}
                        >
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <h3
                                  className={`font-semibold text-lg ${
                                    isDarkMode ? "text-white" : "text-gray-900"
                                  } truncate`}
                                >
                                  {note.title}
                                </h3>
                                <p
                                  className={`text-xs ${
                                    isDarkMode
                                      ? "text-gray-400"
                                      : "text-gray-500"
                                  } mt-1`}
                                >
                                  Deleted{" "}
                                  {note.deletedAt &&
                                    formatDistanceToNow(
                                      new Date(note.deletedAt),
                                      {
                                        addSuffix: true,
                                      }
                                    )}
                                </p>
                                {note.deletedAt && (
                                  <p
                                    className={`text-xs ${
                                      isDarkMode
                                        ? "text-red-500"
                                        : "text-red-600"
                                    } mt-1 flex items-center gap-1`}
                                  >
                                    <AlertTriangle className="h-3 w-3" />
                                    {getDaysRemaining(note.deletedAt)}{" "}
                                    {getDaysRemaining(note.deletedAt) === 1
                                      ? "day"
                                      : "days"}{" "}
                                    remaining
                                  </p>
                                )}
                              </div>
                            </div>
                          </CardHeader>

                          <CardContent className="pb-4 flex-1 flex flex-col">
                            <div className="flex-1 min-h-[80px] max-h-[80px] overflow-hidden mb-4">
                              <div
                                className={`text-sm ${
                                  isDarkMode ? "text-gray-400" : "text-gray-600"
                                } prose prose-sm max-w-none line-clamp-3`}
                                dangerouslySetInnerHTML={{
                                  __html: note.content,
                                }}
                              />
                            </div>

                            {note.tags && note.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mb-4">
                                {note.tags.slice(0, 3).map((tag) => (
                                  <span
                                    key={tag}
                                    className={`px-2 py-1 ${
                                      isDarkMode
                                        ? "bg-gray-800 text-gray-300"
                                        : "bg-gray-100 text-gray-600"
                                    } rounded-full text-xs`}
                                  >
                                    {tag}
                                  </span>
                                ))}
                                {note.tags.length > 3 && (
                                  <span
                                    className={`px-2 py-1 ${
                                      isDarkMode
                                        ? "text-gray-400"
                                        : "text-gray-500"
                                    } text-xs`}
                                  >
                                    +{note.tags.length - 3} more
                                  </span>
                                )}
                              </div>
                            )}

                            <div className="flex gap-2 mt-auto">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRestore(note._id)}
                                className={`flex-1 gap-1 ${
                                  isDarkMode
                                    ? "bg-teal-600/20 border-teal-600 text-teal-400 hover:bg-teal-600/30"
                                    : "bg-white/90 hover:bg-teal-50 border-teal-200 text-teal-700 hover:text-teal-800"
                                } transition-all duration-300`}
                              >
                                <RotateCcw className="h-3 w-3" />
                                Restore
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteClick(note._id)}
                                className={`flex-1 gap-1 ${
                                  isDarkMode
                                    ? "bg-red-600/20 border-red-600 text-red-500 hover:bg-red-600/30"
                                    : "bg-white/90 hover:bg-red-50 border-red-200 text-red-600 hover:text-red-700 hover:border-red-300"
                                } transition-all duration-300`}
                              >
                                <Trash className="h-3 w-3" />
                                Delete Forever
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {/* Pagination */}
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={goToPage}
                />
              </>
            )}
          </>
        )}
      </main>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent
          className={
            isDarkMode
              ? "bg-gray-900 border-gray-700"
              : "bg-white border-gray-200"
          }
        >
          <AlertDialogHeader>
            <AlertDialogTitle
              className={isDarkMode ? "text-white" : "text-gray-900"}
            >
              Permanently Delete Note?
            </AlertDialogTitle>
            <AlertDialogDescription
              className={isDarkMode ? "text-gray-400" : "text-gray-600"}
            >
              This action cannot be undone. This note will be permanently
              deleted and cannot be restored.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className={
                isDarkMode
                  ? "bg-gray-800 text-white border-gray-600 hover:bg-gray-700"
                  : "bg-white/90 hover:bg-gray-50 border-gray-300 text-gray-700 hover:text-gray-900"
              }
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white transition-all duration-300"
            >
              Delete Forever
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Empty Bin Confirmation Dialog */}
      <AlertDialog
        open={emptyBinDialogOpen}
        onOpenChange={setEmptyBinDialogOpen}
      >
        <AlertDialogContent
          className={
            isDarkMode
              ? "bg-gray-900 border-gray-700"
              : "bg-white border-gray-200"
          }
        >
          <AlertDialogHeader>
            <AlertDialogTitle
              className={isDarkMode ? "text-white" : "text-gray-900"}
            >
              Empty Recycle Bin?
            </AlertDialogTitle>
            <AlertDialogDescription
              className={isDarkMode ? "text-gray-400" : "text-gray-600"}
            >
              This will permanently delete all {deletedNotes.length} notes in
              the recycle bin. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className={
                isDarkMode
                  ? "bg-gray-800 text-white border-gray-600 hover:bg-gray-700"
                  : "bg-white/90 hover:bg-gray-50 border-gray-300 text-gray-700 hover:text-gray-900"
              }
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleEmptyBinConfirm}
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white transition-all duration-300"
            >
              Empty Recycle Bin
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Logout Animation */}
      <LogoutAnimation isVisible={showLogoutAnimation} />
    </div>
  );
};

export default RecycleBinPage;
