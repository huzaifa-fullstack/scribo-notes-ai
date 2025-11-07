import { useNavigate } from "react-router-dom";
import { User, Settings, Trash2, ChevronDown } from "lucide-react";
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
import { useTheme } from "../../context/ThemeContext";

const UserDropdown = () => {
  const { user } = useAuthStore();
  const { theme } = useTheme();
  const isDarkMode = theme === "dark";
  const navigate = useNavigate();

  const handleProfileClick = () => {
    navigate("/profile");
  };

  const handleSettingsClick = () => {
    navigate("/settings");
  };

  const handleRecycleBinClick = () => {
    navigate("/recycle-bin");
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
          className={`flex items-center gap-2 px-2 sm:px-3 ${
            isDarkMode ? "hover:bg-gray-800" : "hover:bg-teal-50"
          } transition-all duration-300 rounded-md`}
        >
          {/* User Avatar - Show Google profile pic if available, otherwise initials */}
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={user.name || "User"}
              referrerPolicy="no-referrer"
              crossOrigin="anonymous"
              className={`w-8 h-8 rounded-full object-cover ring-2 ${
                isDarkMode ? "ring-teal-700" : "ring-teal-200"
              }`}
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
            className={`w-8 h-8 rounded-full bg-gradient-to-br from-teal-600 to-cyan-600 flex items-center justify-center text-white font-semibold text-sm ring-2 ${
              isDarkMode ? "ring-teal-700" : "ring-teal-200"
            } ${user?.avatar ? "hidden" : ""}`}
          >
            {user?.name ? getInitials(user.name) : "U"}
          </div>
          {/* User Name (hidden on mobile) */}
          <span
            className={`hidden sm:inline text-sm font-medium ${
              isDarkMode ? "text-gray-200" : "text-gray-700"
            }`}
          >
            {user?.name || "User"}
          </span>
          <ChevronDown
            className={`h-4 w-4 ${
              isDarkMode ? "text-gray-400" : "text-gray-500"
            }`}
          />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className={`w-56 ${
          isDarkMode
            ? "bg-gray-900 border-gray-700"
            : "bg-white border-gray-200"
        }`}
      >
        {/* User Info */}
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p
              className={`text-sm font-medium ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              {user?.name}
            </p>
            <p
              className={`text-xs ${
                isDarkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              {user?.email}
            </p>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator
          className={isDarkMode ? "bg-gray-700" : "bg-gray-200"}
        />

        {/* Profile & Settings */}
        <DropdownMenuItem
          onClick={handleProfileClick}
          className={`cursor-pointer ${
            isDarkMode
              ? "text-gray-300 hover:bg-gray-800 hover:text-teal-400"
              : "text-gray-700 hover:bg-teal-50 hover:text-teal-700"
          } transition-all duration-300`}
        >
          <User className="mr-0.5 h-4 w-4" />
          <span>View Profile</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={handleSettingsClick}
          className={`cursor-pointer ${
            isDarkMode
              ? "text-gray-300 hover:bg-gray-800 hover:text-teal-400"
              : "text-gray-700 hover:bg-teal-50 hover:text-teal-700"
          } transition-all duration-300`}
        >
          <Settings className="mr-0.5 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>

        {/* Recycle Bin */}
        <DropdownMenuItem
          onClick={handleRecycleBinClick}
          className={`cursor-pointer ${
            isDarkMode
              ? "text-gray-300 hover:bg-gray-800 hover:text-red-400"
              : "text-gray-700 hover:bg-red-50 hover:text-red-700"
          } transition-all duration-300`}
        >
          <Trash2 className="mr-0.5 h-4 w-4" />
          <span>Recycle Bin</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserDropdown;
