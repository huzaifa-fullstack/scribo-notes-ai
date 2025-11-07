import { ArrowLeft, Moon, Sun, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "../components/ui/button";
import { useAuthStore } from "../store/authStore";
import { useNotesStore } from "../store/notesStore";
import UserDropdown from "../components/layout/UserDropdown";
import { useTheme } from "../context/ThemeContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Switch } from "../components/ui/switch";
import { useToast } from "../components/ui/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../components/ui/alert-dialog";
import { deleteAllNotes, deleteAccount } from "../services/profileService";
import { useState } from "react";
import LogoutAnimation from "../components/common/LogoutAnimation";

const SettingsPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { logout } = useAuthStore();
  const { fetchNotes } = useNotesStore();
  const { theme, toggleTheme } = useTheme();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showLogoutAnimation, setShowLogoutAnimation] = useState(false);

  const isDarkMode = theme === "dark";

  const handleDarkModeToggle = (checked: boolean) => {
    toggleTheme();
    // Delay toast to allow theme to update first
    setTimeout(() => {
      toast({
        title: checked ? "Dark Mode Enabled" : "Light Mode Enabled",
        description: "Theme updated successfully!",
      });
    }, 100);
  };

  const handleDeleteAccount = async () => {
    try {
      setIsDeleting(true);
      await deleteAccount();

      // Set flag in localStorage to show toast on login page
      localStorage.setItem("accountDeleted", "true");

      // Immediate logout and redirect
      logout();
      navigate("/login");
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to delete account",
        variant: "destructive",
      });
      setIsDeleting(false);
    }
  };

  const handleDeleteAllNotes = async () => {
    try {
      setIsDeleting(true);
      await deleteAllNotes();
      toast({
        title: "All Notes Deleted",
        description: "All your notes have been permanently deleted.",
      });
      // Refresh notes in the store
      await fetchNotes();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete notes",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Dynamic theme classes
  const themeClasses = {
    bg: isDarkMode ? "bg-slate-950" : "bg-gray-50",
    header: isDarkMode
      ? "bg-gray-900/80 border-teal-600/30"
      : "bg-white border-gray-200",
    headerText: isDarkMode ? "text-white" : "text-gray-900",
    headerSubtext: isDarkMode ? "text-gray-400" : "text-gray-500",
    card: isDarkMode
      ? "bg-gray-900 border-gray-700"
      : "bg-white border-gray-200",
    cardTitle: isDarkMode ? "text-white" : "text-gray-900",
    cardDescription: isDarkMode ? "text-gray-400" : "text-gray-600",
    box: isDarkMode
      ? "bg-gray-800 border-gray-700"
      : "bg-gray-50 border-gray-200",
    boxText: isDarkMode ? "text-white" : "text-gray-900",
    boxSubtext: isDarkMode ? "text-gray-400" : "text-gray-600",
    icon: isDarkMode ? "text-teal-400" : "text-teal-600",
    button: isDarkMode
      ? "border-gray-600 text-teal-400 hover:bg-gray-800"
      : "border-teal-200 text-teal-600 hover:bg-teal-50",
    buttonHover: isDarkMode
      ? "hover:border-teal-500 hover:text-teal-300"
      : "hover:border-teal-400 hover:text-teal-700",
  };

  return (
    <div className={`min-h-screen ${themeClasses.bg}`}>
      {/* Header */}
      <header
        className={`${themeClasses.header} backdrop-blur-xl shadow-sm border-b sticky top-0 z-50`}
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
                  Settings
                </h1>
                <p
                  className={`text-xs sm:text-sm mt-1.5 ${themeClasses.headerSubtext}`}
                >
                  Manage your app preferences
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <UserDropdown />
              <Button
                onClick={() => {
                  setShowLogoutAnimation(true);
                  setTimeout(() => {
                    logout();
                  }, 3000);
                }}
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
      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      >
        <div className="space-y-6">
          {/* Appearance */}
          <Card
            className={`${themeClasses.card} shadow-lg hover:shadow-xl transition-shadow duration-300`}
          >
            <CardHeader
              className={`border-b ${
                isDarkMode ? "border-gray-700" : "border-gray-200"
              }`}
            >
              <CardTitle className={`text-lg ${themeClasses.cardTitle}`}>
                Appearance
              </CardTitle>
              <CardDescription className={themeClasses.cardDescription}>
                Customize how the app looks and feels
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className={`flex items-center justify-between gap-3 p-3 sm:p-4 ${
                  themeClasses.box
                } rounded-lg border ${
                  isDarkMode ? "hover:border-teal-600" : "hover:border-teal-400"
                } transition-colors duration-300`}
              >
                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                  {isDarkMode ? (
                    <Moon
                      className={`h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 ${themeClasses.icon}`}
                    />
                  ) : (
                    <Sun
                      className={`h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 ${themeClasses.icon}`}
                    />
                  )}
                  <div className="min-w-0">
                    <p
                      className={`font-medium text-sm sm:text-base ${themeClasses.boxText}`}
                    >
                      Dark Mode
                    </p>
                    <p
                      className={`text-xs sm:text-sm ${themeClasses.boxSubtext}`}
                    >
                      Switch between light and dark theme
                    </p>
                  </div>
                </div>
                <Switch
                  checked={isDarkMode}
                  onCheckedChange={handleDarkModeToggle}
                  className={`flex-shrink-0 ${
                    isDarkMode
                      ? "data-[state=checked]:bg-teal-600"
                      : "data-[state=unchecked]:bg-gray-300 data-[state=checked]:bg-teal-600"
                  }`}
                />
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card
            className={`${
              isDarkMode
                ? "bg-gray-900 border-red-900/50"
                : "bg-white border-red-200"
            } shadow-lg hover:shadow-xl transition-shadow duration-300`}
          >
            <CardHeader
              className={`border-b ${
                isDarkMode ? "border-red-900/50" : "border-red-200"
              }`}
            >
              <CardTitle
                className={`text-lg ${
                  isDarkMode ? "text-red-500" : "text-red-600"
                }`}
              >
                Danger Zone
              </CardTitle>
              <CardDescription
                className={isDarkMode ? "text-gray-400" : "text-gray-600"}
              >
                Irreversible actions - proceed with caution
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Delete All Notes */}
              <div
                className={`flex items-center justify-between gap-3 p-3 sm:p-4 ${
                  themeClasses.box
                } rounded-lg border ${
                  isDarkMode
                    ? "border-red-900/50 hover:border-red-700"
                    : "border-red-200 hover:border-red-400"
                } transition-colors duration-300`}
              >
                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                  <Trash2
                    className={`h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 ${
                      isDarkMode ? "text-red-500" : "text-red-600"
                    }`}
                  />
                  <div className="min-w-0">
                    <p
                      className={`font-medium text-sm sm:text-base ${themeClasses.boxText}`}
                    >
                      Delete All Notes
                    </p>
                    <p
                      className={`text-xs sm:text-sm ${themeClasses.boxSubtext}`}
                    >
                      Permanently delete all your notes
                    </p>
                  </div>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      size="sm"
                      className={`flex-shrink-0 text-xs sm:text-sm px-2 sm:px-4 h-8 sm:h-9 w-20 sm:w-44 ${
                        isDarkMode
                          ? "bg-red-600 text-white hover:bg-red-700"
                          : "bg-red-600 text-white hover:bg-red-700"
                      }`}
                    >
                      <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 sm:mr-1.5" />
                      <span className="hidden sm:inline">Delete All Notes</span>
                      <span className="sm:hidden">Delete</span>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent
                    className={
                      isDarkMode
                        ? "bg-gray-900 border-gray-700"
                        : "bg-white border-gray-200"
                    }
                  >
                    <AlertDialogHeader>
                      <AlertDialogTitle className={themeClasses.cardTitle}>
                        Delete all your notes?
                      </AlertDialogTitle>
                      <AlertDialogDescription
                        className={themeClasses.cardDescription}
                      >
                        This action cannot be undone. This will permanently
                        delete all your notes.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel
                        className={
                          isDarkMode
                            ? "bg-gray-800 text-white border-gray-600"
                            : "bg-white text-gray-900 border-gray-200"
                        }
                      >
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteAllNotes}
                        disabled={isDeleting}
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        {isDeleting ? "Deleting..." : "Yes, Delete All Notes"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>

              {/* Delete Account */}
              <div
                className={`flex items-center justify-between gap-3 p-3 sm:p-4 ${
                  themeClasses.box
                } rounded-lg border ${
                  isDarkMode
                    ? "border-red-900/50 hover:border-red-700"
                    : "border-red-200 hover:border-red-400"
                } transition-colors duration-300`}
              >
                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                  <Trash2
                    className={`h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 ${
                      isDarkMode ? "text-red-500" : "text-red-600"
                    }`}
                  />
                  <div className="min-w-0">
                    <p
                      className={`font-medium text-sm sm:text-base ${themeClasses.boxText}`}
                    >
                      Delete Account
                    </p>
                    <p
                      className={`text-xs sm:text-sm ${themeClasses.boxSubtext}`}
                    >
                      Permanently delete your account and all your data
                    </p>
                  </div>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      className={`flex-shrink-0 text-xs sm:text-sm px-2 sm:px-4 h-8 sm:h-9 w-20 sm:w-44 bg-red-600 hover:bg-red-700 text-white`}
                      size="sm"
                    >
                      <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 sm:mr-1.5" />
                      <span className="hidden sm:inline">Delete Account</span>
                      <span className="sm:hidden">Delete</span>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent
                    className={
                      isDarkMode
                        ? "bg-gray-900 border-gray-700"
                        : "bg-white border-gray-200"
                    }
                  >
                    <AlertDialogHeader>
                      <AlertDialogTitle className={themeClasses.cardTitle}>
                        Are you absolutely sure?
                      </AlertDialogTitle>
                      <AlertDialogDescription
                        className={themeClasses.cardDescription}
                      >
                        This action cannot be undone. This will permanently
                        delete your account and remove all your data from our
                        servers including all your notes, tags, and preferences.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel
                        className={
                          isDarkMode
                            ? "bg-gray-800 text-white border-gray-600"
                            : "bg-white text-gray-900 border-gray-200"
                        }
                      >
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteAccount}
                        disabled={isDeleting}
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        {isDeleting ? "Deleting..." : "Yes, Delete My Account"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.main>

      {/* Logout Animation */}
      <LogoutAnimation isVisible={showLogoutAnimation} />
    </div>
  );
};

export default SettingsPage;
