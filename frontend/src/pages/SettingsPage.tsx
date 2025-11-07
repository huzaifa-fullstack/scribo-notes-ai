import { useState } from "react";
import { ArrowLeft, Moon, Sun, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "../components/ui/button";
import { useAuthStore } from "../store/authStore";
import { useNotesStore } from "../store/notesStore";
import UserDropdown from "../components/layout/UserDropdown";
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

const SettingsPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { logout } = useAuthStore();
  const { clearNotes } = useNotesStore();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDarkModeToggle = (checked: boolean) => {
    setIsDarkMode(checked);
    // TODO: Implement actual dark mode
    toast({
      title: checked ? "Dark Mode Enabled" : "Light Mode Enabled",
      description: "Dark mode functionality will be implemented soon.",
    });
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await deleteAccount();

      // Clear local storage
      clearNotes();

      toast({
        title: "Account Deleted",
        description: "Your account and all data have been permanently deleted.",
      });

      // Logout and redirect to home
      setTimeout(() => {
        logout();
        navigate("/");
      }, 1500);
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.response?.data?.error ||
          "Failed to delete account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteAllNotes = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteAllNotes();

      // Clear notes from local state
      clearNotes();

      toast({
        title: "All Notes Deleted",
        description:
          result.message || "All your notes have been permanently deleted.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.response?.data?.error ||
          "Failed to delete notes. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-teal-50/20">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl shadow-sm border-b border-teal-100/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-shrink min-w-0 max-w-[65%] sm:max-w-none">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/dashboard")}
                className="flex-shrink-0 hover:bg-teal-50 hover:text-teal-700 transition-all duration-300 -ml-2"
              >
                <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
              <div className="min-w-0">
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                  Settings
                </h1>
                <p className="text-xs sm:text-sm mt-1.5 text-gray-600">
                  Manage your app preferences
                </p>
              </div>
            </div>
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

      {/* Main Content */}
      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      >
        <div className="space-y-6">
          {/* Appearance */}
          <Card className="border-teal-100/50 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="border-b border-teal-100/30">
              <CardTitle className="text-lg text-teal-700">
                Appearance
              </CardTitle>
              <CardDescription>
                Customize how the app looks and feels
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 bg-teal-50/30 rounded-lg border border-teal-200/50 hover:border-teal-300 transition-colors duration-300">
                <div className="flex items-center gap-3">
                  {isDarkMode ? (
                    <Moon className="h-5 w-5 text-teal-700" />
                  ) : (
                    <Sun className="h-5 w-5 text-teal-700" />
                  )}
                  <div>
                    <p className="font-medium text-gray-900">Dark Mode</p>
                    <p className="text-sm text-gray-500">
                      Switch between light and dark theme
                    </p>
                  </div>
                </div>
                <Switch
                  checked={isDarkMode}
                  onCheckedChange={handleDarkModeToggle}
                  className="data-[state=unchecked]:bg-gray-200 data-[state=checked]:bg-teal-600"
                />
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-red-200 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="border-b border-red-200/50">
              <CardTitle className="text-lg text-red-600">
                Danger Zone
              </CardTitle>
              <CardDescription>
                Irreversible actions - proceed with caution
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Delete All Notes */}
              <div className="flex items-center justify-between p-4 bg-red-50/50 rounded-lg border border-red-200/50 hover:border-red-300 transition-colors duration-300">
                <div className="flex items-center gap-3">
                  <Trash2 className="h-5 w-5 text-red-600" />
                  <div>
                    <p className="font-medium text-gray-900">
                      Delete All Notes
                    </p>
                    <p className="text-sm text-gray-500">
                      Permanently delete all your notes
                    </p>
                  </div>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      size="sm"
                      disabled={isDeleting}
                      className="bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                    >
                      Delete All Notes
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Delete all your notes?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently
                        delete all your notes.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel disabled={isDeleting}>
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteAllNotes}
                        disabled={isDeleting}
                        className="bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
                      >
                        {isDeleting ? "Deleting..." : "Yes, Delete All Notes"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>

              {/* Delete Account */}
              <div className="flex items-center justify-between p-4 bg-red-50/50 rounded-lg border border-red-200/50 hover:border-red-300 transition-colors duration-300">
                <div className="flex items-center gap-3">
                  <Trash2 className="h-5 w-5 text-red-600" />
                  <div>
                    <p className="font-medium text-gray-900">Delete Account</p>
                    <p className="text-sm text-gray-500">
                      Permanently delete your account and all your data
                    </p>
                  </div>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      className="bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
                      size="sm"
                      disabled={isDeleting}
                    >
                      Delete Account
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Are you absolutely sure?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently
                        delete your account and remove all your data from our
                        servers including all your notes, tags, and preferences.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel disabled={isDeleting}>
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteAccount}
                        disabled={isDeleting}
                        className="bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
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
    </div>
  );
};

export default SettingsPage;
