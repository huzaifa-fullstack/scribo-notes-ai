import { useState, useMemo, useCallback } from "react";
import type { Note } from "../types/note";

const ITEMS_PER_PAGE = 9;

interface UsePaginationProps {
  notes: Note[];
  itemsPerPage?: number;
}

export const usePagination = ({
  notes,
  itemsPerPage = ITEMS_PER_PAGE,
}: UsePaginationProps) => {
  const [currentPage, setCurrentPage] = useState(1);

  // Separate pinned and regular notes
  const { pinnedNotes, regularNotes } = useMemo(() => {
    const pinned = notes.filter((note) => note.isPinned);
    const regular = notes.filter((note) => !note.isPinned);
    return { pinnedNotes: pinned, regularNotes: regular };
  }, [notes]);

  // Calculate pagination for regular notes only
  const { totalPages, paginatedRegularNotes } = useMemo(() => {
    const total = Math.ceil(regularNotes.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginated = regularNotes.slice(startIndex, endIndex);

    return {
      totalPages: total || 1,
      paginatedRegularNotes: paginated,
    };
  }, [regularNotes, currentPage, itemsPerPage]);

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
  }, []);

  return {
    currentPage,
    totalPages,
    pinnedNotes,
    regularNotes: paginatedRegularNotes,
    goToPage,
    resetPage,
  };
};
