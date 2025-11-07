const express = require('express');
const passport = require('passport');
const {
    register,
    login,
    getMe,
    updateProfile,
    logout,
    googleCallback,
    forgotPassword,
    resetPassword,
    sendVerificationEmail,
    verifyEmail,
    resendVerificationEmail
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Traditional auth routes
router.post('/register', register);
router.post('/login', login);

// Password reset routes (public)
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Email verification routes
router.post('/send-verification', protect, sendVerificationEmail); // Protected - user must be logged in
router.get('/verify-email/:token', verifyEmail); // Public - can verify from email link
router.post('/resend-verification', protect, resendVerificationEmail); // Protected - user must be logged in

// Google OAuth routes
router.get(
    '/google',
    passport.authenticate('google', {
        scope: ['profile', 'email']
    })
);

router.get(
    '/google/callback',
    passport.authenticate('google', {
        failureRedirect: '/login',
        session: false
    }),
    googleCallback
);

// Protected routes
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.post('/logout', protect, logout);

module.exports = router;