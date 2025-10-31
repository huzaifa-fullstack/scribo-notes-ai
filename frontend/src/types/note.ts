export interface Note {
  _id: string;
  title: string;
  content: string;
  user: string;
  tags?: string[];
  isPinned: boolean;
  isArchived: boolean;
  isDeleted?: boolean;
  deletedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNoteData {
  title: string;
  content: string;
  tags?: string[];
}

export interface UpdateNoteData {
  title?: string;
  content?: string;
  tags?: string[];
}

export interface NotesStore {
  notes: Note[];
  recycleNotes: Note[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchNotes: () => Promise<void>;
  fetchRecycleBin: (page?: number, limit?: number) => Promise<void>;
  createNote: (data: CreateNoteData) => Promise<Note>;
  updateNote: (id: string, data: UpdateNoteData) => Promise<Note>;
  deleteNote: (id: string) => Promise<void>;
  restoreNote: (id: string) => Promise<void>;
  permanentlyDeleteNote: (id: string) => Promise<void>;
  emptyRecycleBin: () => Promise<void>;
  togglePin: (id: string) => Promise<void>;
  toggleArchive: (id: string) => Promise<void>;
  clearError: () => void;
  clearNotes: () => void;
}
