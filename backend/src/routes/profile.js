const express = require('express');
const router = express.Router();
const {
    getProfile,
    updateProfile,
    changePassword,
    uploadAvatar,
    deleteAvatar,
    getUserStats,
    deleteAllNotes,
    deleteAccount
} = require('../controllers/profileController');
const { protect } = require('../middleware/auth');

// All routes are protected (require authentication)
router.use(protect);

// Profile routes
router.route('/')
    .get(getProfile)
    .put(updateProfile);

// Password change
router.put('/password', changePassword);

// Avatar management
router.route('/avatar')
    .post(uploadAvatar)
    .delete(deleteAvatar);

// User statistics
router.get('/stats', getUserStats);

// Settings - Danger Zone
router.delete('/notes', deleteAllNotes);  // Delete all notes
router.delete('/account', deleteAccount);  // Delete account

module.exports = router;
