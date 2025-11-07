import api from "./api";

export interface ProfileData {
  name?: string;
  avatar?: string;
}

export interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
}

export interface UserStats {
  totalNotes: number;
  pinnedNotes: number;
  archivedNotes: number;
  activeNotes: number;
  totalTags: number;
  categories?: Record<string, number>;
  priorities?: Record<string, number>;
  colors?: Record<string, number>;
  allTags?: Record<string, number>;
}

export interface ProfileResponse {
  success: boolean;
  data: {
    user: {
      _id: string;
      name: string;
      email: string;
      avatar?: string;
      role: string;
      isEmailVerified: boolean;
      lastLogin: string;
      createdAt: string;
      updatedAt: string;
    };
    stats: UserStats;
  };
}

// Get user profile with statistics
export const getProfile = async () => {
  const response = await api.get<ProfileResponse>("/profile");
  return response.data;
};

// Update user profile
export const updateProfile = async (data: ProfileData) => {
  const response = await api.put("/profile", data);
  return response.data;
};

// Change password
export const changePassword = async (data: PasswordChangeData) => {
  const response = await api.put("/profile/password", data);
  return response.data;
};

// Upload avatar
export const uploadAvatar = async (avatar: string) => {
  const response = await api.post("/profile/avatar", { avatar });
  return response.data;
};

// Delete avatar
export const deleteAvatar = async () => {
  const response = await api.delete("/profile/avatar");
  return response.data;
};

// Get user statistics
export const getUserStats = async () => {
  const response = await api.get<{ success: boolean; data: UserStats }>(
    "/profile/stats"
  );
  return response.data;
};

// Delete all notes
export const deleteAllNotes = async () => {
  const response = await api.delete("/profile/notes");
  return response.data;
};

// Delete account
export const deleteAccount = async () => {
  const response = await api.delete("/profile/account");
  return response.data;
};
