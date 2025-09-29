import { create } from "zustand";
import api from "../services/api";
import type { NotesStore, CreateNoteData, UpdateNoteData } from "../types/note";

export const useNotesStore = create<NotesStore>((set) => ({
  notes: [],
  isLoading: false,
  error: null,

  fetchNotes: async () => {
    set({ isLoading: true, error: null });

    try {
      const response = await api.get("/notes");
      set({
        notes: response.data.notes || response.data.data || [],
        isLoading: false,
      });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error || "Failed to fetch notes";
      set({
        error: errorMessage,
        isLoading: false,
      });
      throw error;
    }
  },

  createNote: async (data: CreateNoteData) => {
    set({ isLoading: true, error: null });

    try {
      const response = await api.post("/notes", data);
      const newNote = response.data.note || response.data.data;

      set((state) => ({
        notes: [newNote, ...state.notes],
        isLoading: false,
      }));

      return newNote;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error || "Failed to create note";
      set({
        error: errorMessage,
        isLoading: false,
      });
      throw error;
    }
  },

  updateNote: async (id: string, data: UpdateNoteData) => {
    set({ isLoading: true, error: null });

    try {
      const response = await api.put(`/notes/${id}`, data);
      const updatedNote = response.data.note || response.data.data;

      set((state) => ({
        notes: state.notes.map((note) =>
          note._id === id ? updatedNote : note
        ),
        isLoading: false,
      }));

      return updatedNote;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error || "Failed to update note";
      set({
        error: errorMessage,
        isLoading: false,
      });
      throw error;
    }
  },

  deleteNote: async (id: string) => {
    set({ isLoading: true, error: null });

    try {
      await api.delete(`/notes/${id}`);

      set((state) => ({
        notes: state.notes.filter((note) => note._id !== id),
        isLoading: false,
      }));
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error || "Failed to delete note";
      set({
        error: errorMessage,
        isLoading: false,
      });
      throw error;
    }
  },

  togglePin: async (id: string) => {
    try {
      const response = await api.put(`/notes/${id}/pin`);
      const updatedNote = response.data.note || response.data.data;

      set((state) => ({
        notes: state.notes.map((note) =>
          note._id === id ? updatedNote : note
        ),
      }));
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error || "Failed to toggle pin";
      set({ error: errorMessage });
      throw error;
    }
  },

  toggleArchive: async (id: string) => {
    try {
      const response = await api.put(`/notes/${id}/archive`);
      const updatedNote = response.data.note || response.data.data;

      set((state) => ({
        notes: state.notes.map((note) =>
          note._id === id ? updatedNote : note
        ),
      }));
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error || "Failed to toggle archive";
      set({ error: errorMessage });
      throw error;
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));
