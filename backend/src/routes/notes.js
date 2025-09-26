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
    getNoteStats
} = require('../controllers/notesController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes are protected - require authentication
router.use(protect);

// Note statistics route (must come before /:id routes)
router.get('/stats', getNoteStats);

// Main CRUD routes
router.route('/')
    .get(getNotes)      // GET /api/notes - Get all notes with filtering
    .post(createNote);  // POST /api/notes - Create new note

router.route('/:id')
    .get(getNote)       // GET /api/notes/:id - Get single note
    .put(updateNote)    // PUT /api/notes/:id - Update note
    .delete(deleteNote); // DELETE /api/notes/:id - Delete note

// Note action routes
router.put('/:id/pin', togglePin);           // PUT /api/notes/:id/pin - Toggle pin
router.put('/:id/archive', toggleArchive);   // PUT /api/notes/:id/archive - Toggle archive

// Note sharing routes
router.post('/:id/share', shareNote);                          // POST /api/notes/:id/share - Share note
router.delete('/:id/share/:userId', unshareNote);              // DELETE /api/notes/:id/share/:userId - Unshare note

module.exports = router;