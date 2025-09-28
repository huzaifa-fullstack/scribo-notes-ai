import { useAuthStore } from "../store/authStore";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  FileText,
  LogOut,
  User,
  Plus,
  PinIcon,
  Archive,
  Clock,
} from "lucide-react";
import { motion } from "framer-motion";

const DashboardPage = () => {
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
  };

  const handleCreateNote = () => {
    // TODO: Navigate to create note page or open modal
    console.log("Create note clicked");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-3"
            >
              <div className="p-2 bg-blue-600 rounded-lg">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">Notes App</h1>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-4"
            >
              <div className="hidden sm:flex items-center space-x-2 px-3 py-2 bg-gray-50 rounded-lg">
                <User className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-700 font-medium">
                  {user?.name}
                </span>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                  Online
                </span>
              </div>
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2 hover:bg-red-50 hover:text-red-600 hover:border-red-300"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </motion.div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Welcome Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold text-gray-900">
              Welcome back, {user?.name}!
            </h2>
            <p className="text-gray-600 mt-2 text-lg">
              Here's what you've been working on. Ready to capture some new
              ideas?
            </p>
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Total Notes
                </CardTitle>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="h-4 w-4 text-blue-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">0</div>
                <p className="text-xs text-gray-500 flex items-center mt-1">
                  <span className="text-green-600">+0</span>
                  <span className="ml-1">from last week</span>
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Pinned Notes
                </CardTitle>
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <PinIcon className="h-4 w-4 text-yellow-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">0</div>
                <p className="text-xs text-gray-500">Important notes pinned</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Archived
                </CardTitle>
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Archive className="h-4 w-4 text-gray-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">0</div>
                <p className="text-xs text-gray-500">Notes in archive</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Last Activity
                </CardTitle>
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Clock className="h-4 w-4 text-purple-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">--</div>
                <p className="text-xs text-gray-500">No recent activity</p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Empty State - Create First Note */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex justify-center"
          >
            <Card className="w-full max-w-2xl border-2 border-dashed border-gray-300 bg-gradient-to-br from-blue-50 to-purple-50">
              <CardContent className="flex flex-col items-center justify-center py-16 px-8">
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.4 }}
                  className="p-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-6 shadow-lg"
                >
                  <Plus className="h-12 w-12 text-white" />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="text-center space-y-4"
                >
                  <h3 className="text-2xl font-bold text-gray-900">
                    Create your first note
                  </h3>
                  <p className="text-gray-600 text-lg max-w-md">
                    Start organizing your thoughts and ideas. Your first note is
                    just a click away.
                  </p>
                  <div className="pt-4">
                    <Button
                      onClick={handleCreateNote}
                      size="lg"
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-8 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    >
                      <Plus className="h-5 w-5 mr-2" />
                      Create Your First Note
                    </Button>
                  </div>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Tips Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="bg-white rounded-xl border border-gray-200 p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Quick Tips
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">
                    Rich Text Editor
                  </h4>
                  <p className="text-sm text-gray-600">
                    Format your notes with bold, italic, lists, and more.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <PinIcon className="h-4 w-4 text-yellow-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">
                    Pin Important Notes
                  </h4>
                  <p className="text-sm text-gray-600">
                    Keep your most important notes at the top.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Archive className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">
                    Organize & Search
                  </h4>
                  <p className="text-sm text-gray-600">
                    Archive old notes and use search to find anything quickly.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
