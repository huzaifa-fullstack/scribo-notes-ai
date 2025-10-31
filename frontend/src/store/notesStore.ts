import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import api from "../services/api";
import type { NotesStore, CreateNoteData, UpdateNoteData } from "../types/note";

export const useNotesStore = create<NotesStore>()(
  persist(
    (set) => ({
      notes: [],
      recycleNotes: [],
      isLoading: false,
      error: null,

      fetchNotes: async () => {
        set({ isLoading: true, error: null });

        try {
          const response = await api.get("/notes?archived=true");
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

      // Fetch deleted notes (recycle bin)
      fetchRecycleBin: async (page = 1, limit = 100) => {
        set({ isLoading: true, error: null });

        try {
          const response = await api.get(
            `/notes/recycle-bin?page=${page}&limit=${limit}`
          );
          const deleted = response.data.data || response.data.notes || [];
          set({ recycleNotes: deleted, isLoading: false });
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.error || "Failed to fetch recycle bin";
          set({ error: errorMessage, isLoading: false });
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
          // Soft delete - move to recycle bin
          const response = await api.delete(`/notes/${id}`);
          const deletedNote = response.data.data || response.data.note;

          set((state) => ({
            notes: state.notes.map((note) =>
              note._id === id ? deletedNote : note
            ),
            // add to recycleNotes if not present
            recycleNotes: [
              deletedNote,
              ...state.recycleNotes.filter((n) => n._id !== id),
            ],
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

      restoreNote: async (id: string) => {
        set({ isLoading: true, error: null });

        try {
          // Restore note from recycle bin
          const response = await api.put(`/notes/${id}/restore`);
          const restoredNote = response.data.data || response.data.note;

          set((state) => ({
            // if note exists in notes list, update it; otherwise prepend
            notes: state.notes.some((n) => n._id === id)
              ? state.notes.map((note) =>
                  note._id === id ? restoredNote : note
                )
              : [restoredNote, ...state.notes],
            // remove from recycleNotes
            recycleNotes: state.recycleNotes.filter((note) => note._id !== id),
            isLoading: false,
          }));
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.error || "Failed to restore note";
          set({
            error: errorMessage,
            isLoading: false,
          });
          throw error;
        }
      },

      permanentlyDeleteNote: async (id: string) => {
        set({ isLoading: true, error: null });

        try {
          await api.delete(`/notes/${id}/permanent`);

          set((state) => ({
            notes: state.notes.filter((note) => note._id !== id),
            recycleNotes: state.recycleNotes.filter((note) => note._id !== id),
            isLoading: false,
          }));
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.error || "Failed to permanently delete note";
          set({
            error: errorMessage,
            isLoading: false,
          });
          throw error;
        }
      },

      emptyRecycleBin: async () => {
        set({ isLoading: true, error: null });

        try {
          // Call backend endpoint to empty recycle bin
          await api.delete("/notes/recycle-bin/empty");

          set((state) => ({
            notes: state.notes.filter((note) => !note.isDeleted),
            recycleNotes: [],
            isLoading: false,
          }));
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.error || "Failed to empty recycle bin";
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

      clearNotes: () => {
        set({ notes: [], recycleNotes: [], error: null });
      },
    }),
    {
      name: "notes-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        notes: state.notes,
        recycleNotes: state.recycleNotes,
      }),
    }
  )
);
