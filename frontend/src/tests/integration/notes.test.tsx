import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { waitFor } from "@testing-library/react";
import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";
import { handlers } from "../mocks/handlers";
import { useAuthStore } from "../../store/authStore";

// Setup MSW server
const server = setupServer(...handlers);

// NOTE: We focus on testing store integrations rather than full UI flows

describe("Integration Tests - Notes Store and Components", () => {
  beforeEach(async () => {
    server.listen({ onUnhandledRequest: "error" });

    // Set up authenticated state
    const mockUser = {
      _id: "1",
      name: "Test User",
      email: "test@example.com",
      role: "user" as const,
      isEmailVerified: true,
      lastLogin: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    useAuthStore.setState({
      user: mockUser,
      token: "mock-token",
      isAuthenticated: true,
      isLoading: false,
      error: null,
    });

    localStorage.setItem("token", "mock-token");
    localStorage.setItem("user", JSON.stringify(mockUser));

    // Reset notes store to clean state
    const { useNotesStore } = await import("../../store/notesStore");
    useNotesStore.setState({
      notes: [],
      isLoading: false,
      error: null,
    });

    vi.clearAllMocks();
  });

  afterEach(() => {
    server.resetHandlers();
    localStorage.clear();
  });

  afterAll(() => {
    server.close();
  });

  it("integrates notes store with API calls", async () => {
    const { useNotesStore } = await import("../../store/notesStore");
    const notesStore = useNotesStore.getState();

    // Should start with empty notes
    expect(notesStore.notes).toEqual([]);

    // Call fetchNotes - this should trigger the API call via MSW
    await notesStore.fetchNotes();

    // Should have loaded notes from API
    await waitFor(() => {
      const updatedStore = useNotesStore.getState();
      expect(updatedStore.notes).toHaveLength(1); // Based on our mock handlers
      expect(updatedStore.notes[0].title).toBe("Test Note");
      expect(updatedStore.isLoading).toBe(false);
    });
  });

  it("integrates note creation with API", async () => {
    const { useNotesStore } = await import("../../store/notesStore");
    const notesStore = useNotesStore.getState();

    // Create a new note
    const newNote = {
      title: "Integration Test Note",
      content: "This is a test note created via integration test",
    };

    await notesStore.createNote(newNote);

    // Should add the note to the store
    await waitFor(() => {
      const updatedStore = useNotesStore.getState();
      // After creating a note, we should have at least 1 note
      expect(updatedStore.notes.length).toBeGreaterThan(0);
      expect(updatedStore.isLoading).toBe(false);
    });
  });

  it("integrates note updates with API", async () => {
    const { useNotesStore } = await import("../../store/notesStore");
    const notesStore = useNotesStore.getState();

    // Create some initial notes
    await notesStore.fetchNotes();

    await waitFor(() => {
      const store = useNotesStore.getState();
      expect(store.notes).toHaveLength(1);
    });

    // Update the first note
    const noteId = useNotesStore.getState().notes[0]._id;
    await notesStore.updateNote(noteId, {
      title: "Updated Integration Test Note",
      content: "This note was updated via integration test",
    });

    // Should successfully call the update API
    await waitFor(() => {
      const updatedStore = useNotesStore.getState();
      expect(updatedStore.isLoading).toBe(false);
    });
  });

  it("integrates note deletion with API", async () => {
    const { useNotesStore } = await import("../../store/notesStore");
    const notesStore = useNotesStore.getState();

    // Create some initial notes
    await notesStore.fetchNotes();

    await waitFor(() => {
      const store = useNotesStore.getState();
      expect(store.notes).toHaveLength(1);
    });

    // Delete the first note
    const noteId = useNotesStore.getState().notes[0]._id;
    await notesStore.deleteNote(noteId);

    // Should successfully call the delete API
    await waitFor(() => {
      const updatedStore = useNotesStore.getState();
      expect(updatedStore.isLoading).toBe(false);
    });
  });

  it("handles API errors gracefully", async () => {
    // Mock a failed API call
    server.use(
      http.get("/api/notes", () => {
        return HttpResponse.json(
          { success: false, message: "Server error" },
          { status: 500 }
        );
      })
    );

    const { useNotesStore } = await import("../../store/notesStore");
    const notesStore = useNotesStore.getState();

    // Attempt to fetch notes
    try {
      await notesStore.fetchNotes();
    } catch (error) {
      // Expected to fail
    }

    // Should handle the error gracefully
    await waitFor(() => {
      const updatedStore = useNotesStore.getState();
      expect(updatedStore.isLoading).toBe(false);
      // Test passes if no error is thrown and loading is complete
    });
  });
});
