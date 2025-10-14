const express = require('express');
const {
    exportNote,
    exportAllNotes,
    importNotes
} = require('../controllers/exportController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(protect);

// Export routes
router.get('/note/:id/:format', exportNote);
router.get('/notes/:format', exportAllNotes);

// Import route
router.post('/import', importNotes);

module.exports = router;