const express = require('express');
const {
    getNotes,
    getNote,
    createNote,
    updateNote,
    deleteNote,
    togglePin,
    toggleArchive,
    shareNote,
    unshareNote,
    getNoteStats,
    restoreNote,
    permanentlyDeleteNote,
    emptyRecycleBin,
    getRecycleBin
} = require('../controllers/notesController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes are protected - require authentication
router.use(protect);

// Note statistics route (must come before /:id routes)
router.get('/stats', getNoteStats);

// Recycle bin routes (must come before /:id routes)
router.get('/recycle-bin', getRecycleBin);
router.delete('/recycle-bin/empty', emptyRecycleBin);

// Main CRUD routes
router.route('/')
    .get(getNotes)      // GET /api/notes - Get all notes with filtering
    .post(createNote);  // POST /api/notes - Create new note

router.route('/:id')
    .get(getNote)       // GET /api/notes/:id - Get single note
    .put(updateNote)    // PUT /api/notes/:id - Update note
    .delete(deleteNote); // DELETE /api/notes/:id - Soft delete note (move to recycle bin)

// Note action routes
router.put('/:id/pin', togglePin);              // PUT /api/notes/:id/pin - Toggle pin
router.put('/:id/archive', toggleArchive);      // PUT /api/notes/:id/archive - Toggle archive
router.put('/:id/restore', restoreNote);        // PUT /api/notes/:id/restore - Restore from recycle bin
router.delete('/:id/permanent', permanentlyDeleteNote);  // DELETE /api/notes/:id/permanent - Permanently delete

// Note sharing routes
router.post('/:id/share', shareNote);                          // POST /api/notes/:id/share - Share note
router.delete('/:id/share/:userId', unshareNote);              // DELETE /api/notes/:id/share/:userId - Unshare note

module.exports = router;