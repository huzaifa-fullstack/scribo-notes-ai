const express = require('express');
const router = express.Router();
const {
    getProfile,
    updateProfile,
    changePassword,
    uploadAvatar,
    deleteAvatar,
    getUserStats
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

module.exports = router;
