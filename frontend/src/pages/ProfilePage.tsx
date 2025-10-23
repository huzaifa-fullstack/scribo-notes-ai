import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Camera,
  Save,
  Mail,
  User as UserIcon,
  Calendar,
  Shield,
  Clock,
  CheckCircle,
  FileText,
  Pin,
  Archive,
  Tag,
} from "lucide-react";
import { useAuthStore } from "../store/authStore";
import { useNotesStore } from "../store/notesStore";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Label } from "../components/ui/label";
import { useToast } from "../components/ui/use-toast";
import { motion } from "framer-motion";

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { notes } = useNotesStore();
  const { toast } = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar || "");
  const [isUploading, setIsUploading] = useState(false);

  // Calculate statistics
  const totalNotes = notes.length;
  const pinnedNotes = notes.filter((note) => note.isPinned).length;
  const archivedNotes = notes.filter((note) => note.isArchived).length;
  const activeNotes = notes.filter((note) => !note.isArchived).length;

  // Get unique tags count
  const allTags = notes.flatMap((note) => note.tags || []);
  const uniqueTags = new Set(allTags).size;

  const handleSave = async () => {
    try {
      // TODO: Implement API call to update user profile
      console.log("Saving profile:", { name, avatarUrl });

      toast({
        title: "Profile updated!",
        description: "Your profile has been updated successfully.",
      });

      setIsEditing(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB.",
        variant: "destructive",
      });
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUploading(true);

      // TODO: Implement file upload to server
      // For now, create a local preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result as string);
      };
      reader.readAsDataURL(file);

      toast({
        title: "Avatar uploaded!",
        description: "Your profile picture has been updated.",
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to upload avatar. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/dashboard")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
              <p className="text-sm text-gray-500 mt-1">
                Manage your account settings
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar Section */}
                <div className="flex items-center gap-6">
                  <div className="relative">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={name}
                        referrerPolicy="no-referrer"
                        className="w-24 h-24 rounded-full object-cover ring-4 ring-gray-200"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-2xl ring-4 ring-gray-200">
                        {getInitials(name)}
                      </div>
                    )}

                    {isEditing && (
                      <label
                        htmlFor="avatar-upload"
                        className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors shadow-lg"
                      >
                        <Camera className="h-4 w-4" />
                        <input
                          id="avatar-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleAvatarUpload}
                          disabled={isUploading}
                        />
                      </label>
                    )}
                  </div>

                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {user?.name}
                    </h3>
                    <p className="text-sm text-gray-500">{user?.email}</p>
                    {!isEditing && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-3"
                        onClick={() => setIsEditing(true)}
                      >
                        Edit Profile
                      </Button>
                    )}
                  </div>
                </div>

                {/* Form Fields */}
                <div className="space-y-4">
                  {/* Name */}
                  <div className="space-y-2">
                    <Label htmlFor="name" className="flex items-center gap-2">
                      <UserIcon className="h-4 w-4 text-gray-500" />
                      Full Name
                    </Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled={!isEditing}
                      className={!isEditing ? "bg-gray-50" : ""}
                    />
                  </div>

                  {/* Email - Read Only */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-500" />
                      Email Address
                      <span className="text-xs text-gray-400">
                        (Cannot be changed)
                      </span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={user?.email || ""}
                      disabled
                      className="bg-gray-100 cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                {isEditing && (
                  <div className="flex gap-3 pt-4">
                    <Button onClick={handleSave} className="flex-1">
                      <Save className="h-4 w-4 mr-1.5" />
                      Save Changes
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsEditing(false);
                        setName(user?.name || "");
                        setAvatarUrl(user?.avatar || "");
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Your Notes Statistics */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Your Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {/* Total Notes */}
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-blue-700 mb-2">
                      <FileText className="h-4 w-4" />
                      <span className="text-sm font-medium">Total</span>
                    </div>
                    <p className="text-3xl font-bold text-blue-700">
                      {totalNotes}
                    </p>
                  </div>

                  {/* Active Notes */}
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-green-700 mb-2">
                      <FileText className="h-4 w-4" />
                      <span className="text-sm font-medium">Active</span>
                    </div>
                    <p className="text-3xl font-bold text-green-700">
                      {activeNotes}
                    </p>
                  </div>

                  {/* Pinned Notes */}
                  <div className="bg-yellow-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-yellow-700 mb-2">
                      <Pin className="h-4 w-4" />
                      <span className="text-sm font-medium">Pinned</span>
                    </div>
                    <p className="text-3xl font-bold text-yellow-700">
                      {pinnedNotes}
                    </p>
                  </div>

                  {/* Archived Notes */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-gray-700 mb-2">
                      <Archive className="h-4 w-4" />
                      <span className="text-sm font-medium">Archived</span>
                    </div>
                    <p className="text-3xl font-bold text-gray-700">
                      {archivedNotes}
                    </p>
                  </div>
                </div>

                {/* Unique Tags */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-purple-700">
                      <Tag className="h-4 w-4" />
                      <span className="text-sm font-medium">Unique Tags</span>
                    </div>
                    <span className="text-2xl font-bold text-purple-700">
                      {uniqueTags}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Account Stats & Info */}
          <div className="space-y-6">
            {/* Account Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Account Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-7">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Joined</p>
                    <p className="text-sm text-gray-500">
                      {user?.createdAt ? formatDate(user.createdAt) : "N/A"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Last Login
                    </p>
                    <p className="text-sm text-gray-500">
                      {user?.lastLogin ? formatDate(user.lastLogin) : "N/A"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-purple-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Account Type
                    </p>
                    <p className="text-sm text-gray-500">Personal</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-emerald-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Email Status
                    </p>
                    <p className="text-sm text-gray-500">
                      {user?.isEmailVerified ? "Verified" : "Not Verified"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Security Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Security</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  disabled
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Change Password
                  <span className="ml-auto text-xs text-gray-400">
                    Coming Soon
                  </span>
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  disabled
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Two-Factor Auth
                  <span className="ml-auto text-xs text-gray-400">
                    Coming Soon
                  </span>
                </Button>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default ProfilePage;
