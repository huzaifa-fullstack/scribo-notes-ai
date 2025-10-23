import { useState } from "react";
import {
  User,
  Settings,
  Moon,
  Trash2,
  AlertTriangle,
  ChevronDown,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { useAuthStore } from "../../store/authStore";

const UserDropdown = () => {
  const { user } = useAuthStore();
  const [isDarkMode, setIsDarkMode] = useState(false);

  const handleProfileClick = () => {
    console.log("Navigate to profile");
    // TODO: Navigate to profile page
  };

  const handleSettingsClick = () => {
    console.log("Navigate to settings");
    // TODO: Navigate to settings page
  };

  const handleDarkModeToggle = () => {
    setIsDarkMode(!isDarkMode);
    console.log("Toggle dark mode:", !isDarkMode);
    // TODO: Implement dark mode
  };

  const handleRecycleBinClick = () => {
    console.log("Navigate to recycle bin");
    // TODO: Navigate to recycle bin
  };

  const handleDeleteAllNotes = () => {
    console.log("Delete all notes");
    // TODO: Implement delete all notes with confirmation
  };

  const handleDeleteAccount = () => {
    console.log("Delete account");
    // TODO: Implement delete account with confirmation
  };

  // Get user initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center gap-2 px-2 sm:px-3"
        >
          {/* User Avatar - Show Google profile pic if available, otherwise initials */}
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={user.name || "User"}
              referrerPolicy="no-referrer"
              crossOrigin="anonymous"
              className="w-8 h-8 rounded-full object-cover ring-2 ring-gray-200"
              onError={(e) => {
                // If image fails to load, hide it and show initials
                console.log("Image failed to load, showing initials");
                e.currentTarget.style.display = "none";
                const fallback = e.currentTarget
                  .nextElementSibling as HTMLElement;
                if (fallback) {
                  fallback.classList.remove("hidden");
                }
              }}
            />
          ) : null}
          {/* Fallback to initials if no avatar or if image fails */}
          <div
            className={`w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm ring-2 ring-gray-200 ${
              user?.avatar ? "hidden" : ""
            }`}
          >
            {user?.name ? getInitials(user.name) : "U"}
          </div>
          {/* User Name (hidden on mobile) */}
          <span className="hidden sm:inline text-sm font-medium text-gray-700">
            {user?.name || "User"}
          </span>
          <ChevronDown className="h-4 w-4 text-gray-500" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        {/* User Info */}
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium text-gray-900">{user?.name}</p>
            <p className="text-xs text-gray-500">{user?.email}</p>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {/* Profile & Settings */}
        <DropdownMenuItem
          onClick={handleProfileClick}
          className="cursor-pointer"
        >
          <User className="mr-2 h-4 w-4" />
          <span>View Profile</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={handleSettingsClick}
          className="cursor-pointer"
        >
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>

        {/* Dark Mode Toggle */}
        <DropdownMenuItem
          onClick={handleDarkModeToggle}
          className="cursor-pointer"
        >
          <Moon className="mr-2 h-4 w-4" />
          <span>Dark Mode</span>
          <span className="ml-auto text-xs text-gray-500">
            {isDarkMode ? "On" : "Off"}
          </span>
        </DropdownMenuItem>

        {/* Recycle Bin */}
        <DropdownMenuItem
          onClick={handleRecycleBinClick}
          className="cursor-pointer"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          <span>Recycle Bin</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Danger Zone */}
        <DropdownMenuLabel className="text-xs text-gray-500">
          Danger Zone
        </DropdownMenuLabel>

        <DropdownMenuItem
          onClick={handleDeleteAllNotes}
          className="cursor-pointer text-orange-600 focus:text-orange-600"
        >
          <AlertTriangle className="mr-2 h-4 w-4" />
          <span>Delete All Notes</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={handleDeleteAccount}
          className="cursor-pointer text-red-600 focus:text-red-600"
        >
          <AlertTriangle className="mr-2 h-4 w-4" />
          <span>Delete Account</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserDropdown;
