import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ArrowLeft,
  Camera,
  Save,
  Mail,
  User as UserIcon,
  Calendar,
  Shield,
  Clock,
  FileText,
  Pin,
  Archive,
  Tag,
  Eye,
  EyeOff,
} from "lucide-react";
import { useAuthStore } from "../store/authStore";
import { useNotesStore } from "../store/notesStore";
import { useTheme } from "../context/ThemeContext";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import UserDropdown from "../components/layout/UserDropdown";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Label } from "../components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../components/ui/form";
import { useToast } from "../components/ui/use-toast";
import { motion } from "framer-motion";
import {
  updateProfile,
  changePassword,
  uploadAvatar,
} from "../services/profileService";
import LogoutAnimation from "../components/common/LogoutAnimation";

// Password change validation schema
const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .regex(/[A-Z]/, "Password must contain at least one capital letter")
      .regex(
        /[!@#$%^&*(),.?":{}|<>]/,
        "Password must contain at least one special character"
      ),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type PasswordChangeData = z.infer<typeof passwordChangeSchema>;

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { notes } = useNotesStore();
  const { toast } = useToast();
  const { theme } = useTheme();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar || "");
  const [isUploading, setIsUploading] = useState(false);

  // Change Password State
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showLogoutAnimation, setShowLogoutAnimation] = useState(false);

  const isDarkMode = theme === "dark";

  // React Hook Form for password change
  const passwordForm = useForm<PasswordChangeData>({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Calculate statistics
  const totalNotes = notes.length;
  const pinnedNotes = notes.filter((note) => note.isPinned).length;
  const archivedNotes = notes.filter((note) => note.isArchived).length;
  const activeNotes = notes.filter((note) => !note.isArchived).length;

  // Get unique tags count
  const allTags = notes.flatMap((note) => note.tags || []);
  const uniqueTags = new Set(allTags).size;

  const handleLogout = () => {
    setShowLogoutAnimation(true);
    setTimeout(() => {
      logout();
    }, 3000);
  };

  const handleSave = async () => {
    try {
      // Call API to update user profile
      await updateProfile({ name, avatar: avatarUrl });

      toast({
        title: "Profile updated!",
        description: "Your profile has been updated successfully.",
      });

      setIsEditing(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.response?.data?.error ||
          "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleChangePassword = async (data: PasswordChangeData) => {
    try {
      // Call API to change password
      await changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });

      toast({
        title: "Password changed!",
        description: "Your password has been updated successfully.",
      });

      // Reset form and close modal
      passwordForm.reset();
      setIsChangingPassword(false);
      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
    } catch (error: any) {
      // Handle specific error cases
      const errorMessage =
        error.response?.data?.error ||
        "Failed to change password. Please try again.";

      // If the backend says the current password is incorrect, show an
      // inline field error for the current password instead of a toast.
      if (
        errorMessage.toLowerCase().includes("incorrect") ||
        errorMessage.toLowerCase().includes("current password")
      ) {
        passwordForm.setError("currentPassword", {
          type: "manual",
          message: errorMessage,
        });
        // keep the entered value so the user can correct it; do not clear silently
        return;
      }

      // For other errors, show a destructive toast
      toast({
        title: "Error",
        description: errorMessage,
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

    setIsUploading(true);

    // Convert file to base64
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const base64String = reader.result as string;

        // Upload to server (which will upload to Cloudinary)
        const response = await uploadAvatar(base64String);

        // Update avatar URL with Cloudinary URL
        setAvatarUrl(response.data.avatar);

        toast({
          title: "Avatar uploaded!",
          description: "Your profile picture has been updated.",
        });
      } catch (error: any) {
        toast({
          title: "Upload failed",
          description:
            error.response?.data?.error ||
            "Failed to upload avatar. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsDataURL(file);
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

  // Dynamic theme classes
  const themeClasses = {
    bg: isDarkMode
      ? "bg-slate-950"
      : "bg-gradient-to-br from-gray-50 via-blue-50/30 to-teal-50/20",
    header: isDarkMode
      ? "bg-gray-900/80 border-teal-600/30"
      : "bg-white/80 border-teal-100/50",
    headerText: isDarkMode ? "text-white" : "text-gray-900",
    headerSubtext: isDarkMode ? "text-gray-400" : "text-gray-600",
    headerGradient: isDarkMode
      ? "from-teal-400 to-cyan-400"
      : "from-teal-600 to-cyan-600",
    card: isDarkMode
      ? "bg-gray-900 border-gray-700"
      : "bg-white border-teal-100/50",
    cardTitle: isDarkMode ? "text-teal-400" : "text-teal-700",
    cardText: isDarkMode ? "text-white" : "text-gray-900",
    cardSubtext: isDarkMode ? "text-gray-400" : "text-gray-500",
    statBox: isDarkMode
      ? "bg-gray-800 border-gray-700"
      : "bg-teal-50 border-teal-100",
    statText: isDarkMode ? "text-gray-100" : "text-gray-900",
    statSubtext: isDarkMode ? "text-gray-400" : "text-gray-600",
    statIcon: isDarkMode ? "text-teal-400" : "text-teal-600",
    input: isDarkMode
      ? "bg-gray-800 border-gray-600 text-white"
      : "bg-white border-gray-200",
    inputDisabled: isDarkMode
      ? "bg-gray-800/50 text-gray-300"
      : "bg-gray-50 text-gray-500",
    button: isDarkMode
      ? "border-gray-600 text-teal-400 hover:bg-gray-800"
      : "border-teal-300 text-teal-600 hover:bg-teal-50",
    buttonHover: isDarkMode
      ? "hover:text-teal-300 hover:border-teal-500"
      : "hover:text-teal-700 hover:border-teal-400",
    avatarRing: isDarkMode ? "ring-teal-600/50" : "ring-teal-200",
    labelText: isDarkMode ? "text-teal-400" : "text-teal-700",
    iconColor: isDarkMode ? "text-teal-400" : "text-teal-500",
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
                    : "hover:bg-teal-50 text-gray-900"
                } hover:text-teal-700 transition-all duration-300 -ml-2`}
              >
                <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
              <div className="min-w-0">
                <h1
                  className={`text-2xl sm:text-3xl font-bold ${
                    isDarkMode ? "text-teal-400" : "text-teal-600"
                  }`}
                >
                  Profile
                </h1>
                <p
                  className={`text-xs sm:text-sm mt-1.5 ${themeClasses.headerSubtext}`}
                >
                  Manage your account settings
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
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card
              className={`${themeClasses.card} shadow-lg hover:shadow-xl transition-shadow duration-300 border`}
            >
              <CardHeader
                className={`border-b ${
                  isDarkMode ? "border-gray-700" : "border-teal-100/30"
                }`}
              >
                <CardTitle className={`text-lg ${themeClasses.cardTitle}`}>
                  Profile Information
                </CardTitle>
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
                        className={`w-24 h-24 rounded-full object-cover ring-4 ${themeClasses.avatarRing}`}
                      />
                    ) : (
                      <div
                        className={`w-24 h-24 rounded-full bg-gradient-to-br from-teal-600 to-teal-400 flex items-center justify-center text-white font-bold text-2xl ring-4 ${themeClasses.avatarRing}`}
                      >
                        {getInitials(name)}
                      </div>
                    )}

                    {isEditing && (
                      <label
                        htmlFor="avatar-upload"
                        className="absolute bottom-0 right-0 bg-teal-600 text-white p-2 rounded-full cursor-pointer hover:bg-teal-700 transition-colors shadow-lg"
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
                    <h3
                      className={`text-lg font-semibold ${themeClasses.cardText}`}
                    >
                      {user?.name}
                    </h3>
                    <p className={`text-sm ${themeClasses.cardSubtext}`}>
                      {user?.email}
                    </p>
                    {!isEditing && (
                      <Button
                        variant="outline"
                        size="sm"
                        className={`mt-3 ${themeClasses.button} ${themeClasses.buttonHover} transition-colors duration-300`}
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
                    <Label
                      htmlFor="name"
                      className={`flex items-center gap-2 ${themeClasses.labelText} font-semibold`}
                    >
                      <UserIcon
                        className={`h-4 w-4 ${themeClasses.iconColor}`}
                      />
                      Full Name
                    </Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled={!isEditing}
                      className={
                        !isEditing
                          ? themeClasses.inputDisabled
                          : `${themeClasses.input} ${
                              isDarkMode
                                ? "focus:ring-teal-500 focus:border-teal-500"
                                : "border-teal-200 focus:ring-teal-500 focus:border-teal-500"
                            }`
                      }
                    />
                  </div>

                  {/* Email - Read Only */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="email"
                      className={`flex items-center gap-2 ${themeClasses.labelText} font-semibold`}
                    >
                      <Mail className={`h-4 w-4 ${themeClasses.iconColor}`} />
                      Email Address
                      <span
                        className={`text-xs ${
                          isDarkMode ? "text-gray-500" : "text-gray-400"
                        }`}
                      >
                        (Cannot be changed)
                      </span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={user?.email || ""}
                      disabled
                      className={`${
                        isDarkMode
                          ? "bg-gray-800/50 text-gray-300"
                          : "bg-gray-100 text-gray-500"
                      } cursor-not-allowed`}
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                {isEditing && (
                  <div className="flex gap-3 pt-4">
                    <Button
                      onClick={handleSave}
                      className="flex-1 bg-teal-600 hover:bg-teal-700 text-white transition-colors duration-300"
                    >
                      <Save className="h-4 w-4 mr-0.5" />
                      Save Changes
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsEditing(false);
                        setName(user?.name || "");
                        setAvatarUrl(user?.avatar || "");
                      }}
                      className={`${themeClasses.button} ${themeClasses.buttonHover} transition-colors duration-300`}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Your Notes Statistics */}
            <Card
              className={`${themeClasses.card} shadow-lg hover:shadow-xl transition-shadow duration-300 border`}
            >
              <CardHeader
                className={`border-b ${
                  isDarkMode ? "border-gray-700" : "border-teal-100/30"
                }`}
              >
                <CardTitle className={`text-lg ${themeClasses.cardTitle}`}>
                  Your Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {/* Total Notes */}
                  <div
                    className={`${themeClasses.statBox} rounded-lg p-4 border ${
                      isDarkMode
                        ? "hover:border-teal-500"
                        : "hover:border-teal-300"
                    } transition-colors duration-300`}
                  >
                    <div
                      className={`flex items-center gap-2 ${themeClasses.statIcon} mb-2`}
                    >
                      <FileText className="h-4 w-4" />
                      <span className="text-sm font-medium">Total</span>
                    </div>
                    <p
                      className={`text-3xl font-bold ${themeClasses.statIcon}`}
                    >
                      {totalNotes}
                    </p>
                  </div>

                  {/* Active Notes */}
                  <div
                    className={`${
                      isDarkMode
                        ? "bg-cyan-900/30 border-cyan-700/50 hover:border-cyan-500"
                        : "bg-cyan-50 border-cyan-200/50 hover:border-cyan-300"
                    } rounded-lg p-4 border transition-colors duration-300`}
                  >
                    <div
                      className={`flex items-center gap-2 ${
                        isDarkMode ? "text-cyan-400" : "text-cyan-700"
                      } mb-2`}
                    >
                      <FileText className="h-4 w-4" />
                      <span className="text-sm font-medium">Active</span>
                    </div>
                    <p
                      className={`text-3xl font-bold ${
                        isDarkMode ? "text-cyan-400" : "text-cyan-700"
                      }`}
                    >
                      {activeNotes}
                    </p>
                  </div>

                  {/* Pinned Notes */}
                  <div
                    className={`${
                      isDarkMode
                        ? "bg-amber-900/30 border-amber-700/50 hover:border-amber-500"
                        : "bg-amber-50 border-amber-200/50 hover:border-amber-300"
                    } rounded-lg p-4 border transition-colors duration-300`}
                  >
                    <div
                      className={`flex items-center gap-2 ${
                        isDarkMode ? "text-amber-400" : "text-amber-700"
                      } mb-2`}
                    >
                      <Pin className="h-4 w-4" />
                      <span className="text-sm font-medium">Pinned</span>
                    </div>
                    <p
                      className={`text-3xl font-bold ${
                        isDarkMode ? "text-amber-400" : "text-amber-700"
                      }`}
                    >
                      {pinnedNotes}
                    </p>
                  </div>

                  {/* Archived Notes */}
                  <div
                    className={`${
                      isDarkMode
                        ? "bg-purple-900/30 border-purple-700/50 hover:border-purple-500"
                        : "bg-purple-50 border-purple-200/50 hover:border-purple-300"
                    } rounded-lg p-4 border transition-colors duration-300`}
                  >
                    <div
                      className={`flex items-center gap-2 ${
                        isDarkMode ? "text-purple-400" : "text-purple-700"
                      } mb-2`}
                    >
                      <Archive className="h-4 w-4" />
                      <span className="text-sm font-medium">Archived</span>
                    </div>
                    <p
                      className={`text-3xl font-bold ${
                        isDarkMode ? "text-purple-400" : "text-purple-700"
                      }`}
                    >
                      {archivedNotes}
                    </p>
                  </div>
                </div>

                {/* Unique Tags */}
                <div
                  className={`mt-4 pt-4 border-t ${
                    isDarkMode ? "border-gray-700" : "border-teal-200/50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div
                      className={`flex items-center gap-2 ${themeClasses.statIcon}`}
                    >
                      <Tag className="h-4 w-4" />
                      <span className="text-sm font-medium">Unique Tags</span>
                    </div>
                    <span
                      className={`text-2xl font-bold ${themeClasses.statIcon}`}
                    >
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
            <Card
              className={`${themeClasses.card} shadow-lg hover:shadow-xl transition-shadow duration-300 border`}
            >
              <CardHeader
                className={`border-b ${
                  isDarkMode ? "border-gray-700" : "border-teal-100/30"
                }`}
              >
                <CardTitle className={`text-lg ${themeClasses.cardTitle}`}>
                  Account Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-8 flex-1">
                <div className="flex items-start gap-3">
                  <Calendar
                    className={`h-5 w-5 ${themeClasses.statIcon} mt-0.5`}
                  />
                  <div>
                    <p
                      className={`text-sm font-medium ${themeClasses.cardText}`}
                    >
                      Joined
                    </p>
                    <p className={`text-sm ${themeClasses.cardSubtext}`}>
                      {user?.createdAt ? formatDate(user.createdAt) : "N/A"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock
                    className={`h-5 w-5 ${themeClasses.statIcon} mt-0.5`}
                  />
                  <div>
                    <p
                      className={`text-sm font-medium ${themeClasses.cardText}`}
                    >
                      Last Login
                    </p>
                    <p className={`text-sm ${themeClasses.cardSubtext}`}>
                      {user?.lastLogin ? formatDate(user.lastLogin) : "N/A"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Shield
                    className={`h-5 w-5 ${themeClasses.statIcon} mt-0.5`}
                  />
                  <div>
                    <p
                      className={`text-sm font-medium ${themeClasses.cardText}`}
                    >
                      Account Type
                    </p>
                    <p className={`text-sm ${themeClasses.cardSubtext}`}>
                      Personal
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className={`h-5 w-5 ${themeClasses.statIcon} mt-0.5`} />
                  <div>
                    <p
                      className={`text-sm font-medium ${themeClasses.cardText}`}
                    >
                      Email Status
                    </p>
                    <p className={`text-sm ${themeClasses.cardSubtext}`}>
                      {user?.isEmailVerified ? "Verified" : "Not Verified"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Security Card */}
            <Card
              className={`${themeClasses.card} shadow-lg hover:shadow-xl transition-shadow duration-300 border`}
            >
              <CardHeader
                className={`border-b ${
                  isDarkMode ? "border-gray-700" : "border-teal-100/30"
                }`}
              >
                <div className="flex items-center gap-2">
                  <CardTitle className={`text-lg ${themeClasses.cardTitle}`}>
                    Security
                  </CardTitle>
                  {user?.googleId && (
                    <span
                      className={`text-xs ${
                        isDarkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      (Not available for Google sign-ins)
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {!isChangingPassword ? (
                  <Button
                    variant="outline"
                    className={`w-full justify-start ${themeClasses.button} ${
                      themeClasses.buttonHover
                    } transition-colors duration-300 ${
                      user?.googleId ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    onClick={() =>
                      !user?.googleId && setIsChangingPassword(true)
                    }
                    disabled={!!user?.googleId}
                  >
                    <Shield className="h-4 w-4 mr-1" />
                    Change Password
                  </Button>
                ) : (
                  <Form {...passwordForm}>
                    <form
                      onSubmit={passwordForm.handleSubmit(handleChangePassword)}
                      className="space-y-[1.150rem]"
                    >
                      {/* Current Password */}
                      <FormField
                        control={passwordForm.control}
                        name="currentPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className={themeClasses.labelText}>
                              Current Password
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  {...field}
                                  type={
                                    showCurrentPassword ? "text" : "password"
                                  }
                                  placeholder="Enter current password"
                                  className={`pr-10 ${themeClasses.input} ${
                                    isDarkMode
                                      ? "focus:ring-teal-500 focus:border-teal-500"
                                      : "border-teal-200 focus:ring-teal-500 focus:border-teal-500"
                                  }`}
                                />
                                <button
                                  type="button"
                                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                                  onClick={() =>
                                    setShowCurrentPassword(!showCurrentPassword)
                                  }
                                >
                                  {showCurrentPassword ? (
                                    <EyeOff
                                      className={`h-4 w-4 ${
                                        isDarkMode
                                          ? "text-gray-500"
                                          : "text-gray-400"
                                      }`}
                                    />
                                  ) : (
                                    <Eye
                                      className={`h-4 w-4 ${
                                        isDarkMode
                                          ? "text-gray-500"
                                          : "text-gray-400"
                                      }`}
                                    />
                                  )}
                                </button>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* New Password */}
                      <FormField
                        control={passwordForm.control}
                        name="newPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className={themeClasses.labelText}>
                              New Password
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  {...field}
                                  type={showNewPassword ? "text" : "password"}
                                  placeholder="Enter new password"
                                  className={`pr-10 ${themeClasses.input} ${
                                    isDarkMode
                                      ? "focus:ring-teal-500 focus:border-teal-500"
                                      : "border-teal-200 focus:ring-teal-500 focus:border-teal-500"
                                  }`}
                                />
                                <button
                                  type="button"
                                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                                  onClick={() =>
                                    setShowNewPassword(!showNewPassword)
                                  }
                                >
                                  {showNewPassword ? (
                                    <EyeOff
                                      className={`h-4 w-4 ${
                                        isDarkMode
                                          ? "text-gray-500"
                                          : "text-gray-400"
                                      }`}
                                    />
                                  ) : (
                                    <Eye
                                      className={`h-4 w-4 ${
                                        isDarkMode
                                          ? "text-gray-500"
                                          : "text-gray-400"
                                      }`}
                                    />
                                  )}
                                </button>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Confirm Password */}
                      <FormField
                        control={passwordForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className={themeClasses.labelText}>
                              Confirm Password
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  {...field}
                                  type={
                                    showConfirmPassword ? "text" : "password"
                                  }
                                  placeholder="Confirm new password"
                                  className={`pr-10 ${themeClasses.input} ${
                                    isDarkMode
                                      ? "focus:ring-teal-500 focus:border-teal-500"
                                      : "border-teal-200 focus:ring-teal-500 focus:border-teal-500"
                                  }`}
                                />
                                <button
                                  type="button"
                                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                                  onClick={() =>
                                    setShowConfirmPassword(!showConfirmPassword)
                                  }
                                >
                                  {showConfirmPassword ? (
                                    <EyeOff
                                      className={`h-4 w-4 ${
                                        isDarkMode
                                          ? "text-gray-500"
                                          : "text-gray-400"
                                      }`}
                                    />
                                  ) : (
                                    <Eye
                                      className={`h-4 w-4 ${
                                        isDarkMode
                                          ? "text-gray-500"
                                          : "text-gray-400"
                                      }`}
                                    />
                                  )}
                                </button>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-2">
                        <Button
                          type="submit"
                          className="flex-1 bg-teal-600 hover:bg-teal-700 text-white transition-colors duration-300"
                        >
                          <Save className="h-4 w-4 mr-0.5" />
                          Save Password
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setIsChangingPassword(false);
                            passwordForm.reset();
                          }}
                          className={`${themeClasses.button} ${themeClasses.buttonHover} transition-colors duration-300`}
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </Form>
                )}
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </main>

      {/* Logout Animation */}
      <LogoutAnimation isVisible={showLogoutAnimation} />
    </div>
  );
};

export default ProfilePage;
