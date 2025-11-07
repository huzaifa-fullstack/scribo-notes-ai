import { useState, useMemo, useCallback, useEffect } from "react";
import type { Note } from "../types/note";

const ITEMS_PER_PAGE = 9;
const STORAGE_KEY = "notes_pagination_page";

interface UsePaginationProps {
  notes: Note[];
  itemsPerPage?: number;
  filterKey?: string; // Unique key for different filter combinations
}

export const usePagination = ({
  notes,
  itemsPerPage = ITEMS_PER_PAGE,
  filterKey = "default",
}: UsePaginationProps) => {
  // Generate storage key based on filter
  const storageKey = `${STORAGE_KEY}_${filterKey}`;

  // Initialize page from localStorage or default to 1
  const [currentPage, setCurrentPage] = useState(() => {
    try {
      const savedPage = localStorage.getItem(storageKey);
      return savedPage ? parseInt(savedPage, 10) : 1;
    } catch {
      return 1;
    }
  });

  // Separate pinned and regular notes
  const { pinnedNotes, regularNotes } = useMemo(() => {
    const pinned = notes.filter((note) => note.isPinned);
    const regular = notes.filter((note) => !note.isPinned);
    return { pinnedNotes: pinned, regularNotes: regular };
  }, [notes]);

  // Calculate pagination for regular notes only
  const { totalPages, paginatedRegularNotes } = useMemo(() => {
    const total = Math.ceil(regularNotes.length / itemsPerPage);

    // Ensure currentPage is valid for the current note count
    let validPage = currentPage;
    if (currentPage > total && total > 0) {
      validPage = 1;
      setCurrentPage(1);
      try {
        localStorage.setItem(storageKey, "1");
      } catch (e) {
        console.error("Failed to save page to localStorage:", e);
      }
    }

    const startIndex = (validPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginated = regularNotes.slice(startIndex, endIndex);

    return {
      totalPages: total || 1,
      paginatedRegularNotes: paginated,
    };
  }, [regularNotes, currentPage, itemsPerPage, storageKey]);

  // Save page to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, currentPage.toString());
    } catch (e) {
      console.error("Failed to save page to localStorage:", e);
    }
  }, [currentPage, storageKey]);

  const goToPage = useCallback(
    (page: number) => {
      const maxPages = Math.ceil(regularNotes.length / itemsPerPage) || 1;
      if (page >= 1 && page <= maxPages) {
        setCurrentPage(page);
        // Scroll to top of the page
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    },
    [regularNotes.length, itemsPerPage]
  );

  const resetPage = useCallback(() => {
    setCurrentPage(1);
    try {
      localStorage.setItem(storageKey, "1");
    } catch (e) {
      console.error("Failed to reset page in localStorage:", e);
    }
  }, [storageKey]);

  return {
    currentPage,
    totalPages,
    pinnedNotes,
    regularNotes: paginatedRegularNotes,
    goToPage,
    resetPage,
  };
};
