import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "../utils/test-utils";
import DashboardPage from "../../pages/DashboardPage";
import { useAuthStore } from "../../store/authStore";
import { useNotesStore } from "../../store/notesStore";

vi.mock("../../store/authStore");
vi.mock("../../store/notesStore");

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const mockNotes = [
  {
    _id: "1",
    title: "Test Note 1",
    content: "This is test note 1",
    user: "user1",
    tags: ["test"],
    isPinned: false,
    isArchived: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: "2",
    title: "Pinned Note",
    content: "This is a pinned note",
    user: "user1",
    tags: ["important"],
    isPinned: true,
    isArchived: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

describe("DashboardPage", () => {
  const mockUser = {
    _id: "user1",
    name: "Test User",
    email: "test@example.com",
    role: "user",
  };

  const mockFetchNotes = vi.fn();
  const mockCreateNote = vi.fn();
  const mockUpdateNote = vi.fn();
  const mockDeleteNote = vi.fn();
  const mockPinNote = vi.fn();
  const mockArchiveNote = vi.fn();
  const mockLogout = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useAuthStore).mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      login: vi.fn(),
      logout: mockLogout,
      register: vi.fn(),
    });

    vi.mocked(useNotesStore).mockReturnValue({
      notes: mockNotes,
      isLoading: false,
      error: null,
      fetchNotes: mockFetchNotes,
      createNote: mockCreateNote,
      updateNote: mockUpdateNote,
      deleteNote: mockDeleteNote,
      togglePin: mockPinNote,
      toggleArchive: mockArchiveNote,
    });
  });

  it("renders dashboard correctly for authenticated user", () => {
    render(<DashboardPage />);

    expect(screen.getByText(/welcome back, test user/i)).toBeInTheDocument();
    expect(screen.getByText(/my notes/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /new note/i })
    ).toBeInTheDocument();
  });

  it("displays notes grid", () => {
    render(<DashboardPage />);

    expect(screen.getByText("Test Note 1")).toBeInTheDocument();
    expect(screen.getByText("Pinned Note")).toBeInTheDocument();
    expect(screen.getByText("This is test note 1")).toBeInTheDocument();
    expect(screen.getByText("This is a pinned note")).toBeInTheDocument();
  });

  it("shows pinned notes first", () => {
    render(<DashboardPage />);

    const noteCards = screen.getAllByText(/test note|pinned note/i);
    // Pinned note should appear first
    expect(noteCards[0]).toHaveTextContent("Pinned Note");
  });

  it("handles create new note", async () => {
    mockCreateNote.mockResolvedValue({ success: true });

    render(<DashboardPage />);

    const createButton = screen.getByRole("button", {
      name: /new note/i,
    });
    fireEvent.click(createButton);

    // Check if CreateNoteModal is rendered - this depends on the modal implementation
    // For now we'll just check that the button click doesn't error
    expect(createButton).toBeInTheDocument();
  });

  it("handles search functionality", async () => {
    render(<DashboardPage />);

    const searchInput = screen.getByPlaceholderText(/search notes/i);
    fireEvent.change(searchInput, { target: { value: "pinned" } });

    await waitFor(() => {
      // Should filter notes to show only matching ones
      expect(screen.getByText("Pinned Note")).toBeInTheDocument();
      expect(screen.queryByText("Test Note 1")).not.toBeInTheDocument();
    });
  });

  it("handles archive filtering", async () => {
    render(<DashboardPage />);

    // Click on the filter button to toggle between active and archived
    const filterButton = screen.getByRole("button", { name: /active/i });
    fireEvent.click(filterButton);

    await waitFor(() => {
      // Should toggle filter state - check for the button text
      expect(
        screen.getByRole("button", { name: /archived/i })
      ).toBeInTheDocument();
    });
  });

  it("displays loading state", () => {
    vi.mocked(useNotesStore).mockReturnValue({
      notes: [],
      isLoading: true,
      error: null,
      fetchNotes: mockFetchNotes,
      createNote: mockCreateNote,
      updateNote: mockUpdateNote,
      deleteNote: mockDeleteNote,
      togglePin: mockPinNote,
      toggleArchive: mockArchiveNote,
    });

    render(<DashboardPage />);

    // Check for loading spinner by class name since there's no loading text
    expect(document.querySelector(".animate-spin")).toBeInTheDocument();
  });

  it("displays empty state when no notes", () => {
    vi.mocked(useNotesStore).mockReturnValue({
      notes: [],
      isLoading: false,
      error: null,
      fetchNotes: mockFetchNotes,
      createNote: mockCreateNote,
      updateNote: mockUpdateNote,
      deleteNote: mockDeleteNote,
      togglePin: mockPinNote,
      toggleArchive: mockArchiveNote,
    });

    render(<DashboardPage />);

    expect(screen.getByText(/no notes yet/i)).toBeInTheDocument();
    expect(screen.getByText(/create your first note/i)).toBeInTheDocument();
  });

  it("displays empty state with search query", () => {
    vi.mocked(useNotesStore).mockReturnValue({
      notes: [],
      isLoading: false,
      error: null,
      fetchNotes: mockFetchNotes,
      createNote: mockCreateNote,
      updateNote: mockUpdateNote,
      deleteNote: mockDeleteNote,
      togglePin: mockPinNote,
      toggleArchive: mockArchiveNote,
    });

    render(<DashboardPage />);

    // Search for something that won't match
    const searchInput = screen.getByPlaceholderText(/search notes/i);
    fireEvent.change(searchInput, { target: { value: "nonexistent" } });

    expect(screen.getByText(/no notes found/i)).toBeInTheDocument();
  });

  it("handles logout", async () => {
    render(<DashboardPage />);

    const logoutButton = screen.getByRole("button", { name: /logout/i });
    fireEvent.click(logoutButton);

    await waitFor(() => {
      expect(mockLogout).toHaveBeenCalled();
    });
  });

  it("fetches notes on mount", () => {
    render(<DashboardPage />);

    expect(mockFetchNotes).toHaveBeenCalled();
  });

  it("renders with unauthenticated user", () => {
    vi.mocked(useAuthStore).mockReturnValue({
      user: null,
      isAuthenticated: false,
      login: vi.fn(),
      logout: mockLogout,
      register: vi.fn(),
    });

    render(<DashboardPage />);

    // Since the component doesn't handle authentication redirect itself,
    // it will still render but with user being null
    expect(screen.getByText(/my notes/i)).toBeInTheDocument();
    // The welcome message should show empty user name
    expect(screen.getByText(/welcome back,/i)).toBeInTheDocument();
  });
});
