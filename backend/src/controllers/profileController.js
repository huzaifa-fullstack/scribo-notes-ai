const User = require('../models/User');
const Note = require('../models/Note');
const logger = require('../config/logger');
const { uploadImage, deleteImage, extractPublicId } = require('../config/cloudinary');

/**
 * @desc    Get current user profile with statistics
 * @route   GET /api/profile
 * @access  Private
 */
exports.getProfile = async (req, res, next) => {
    try {
        // Get user without password
        const user = await User.findById(req.user.id).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        // Get user's notes statistics
        const notes = await Note.find({ user: req.user.id });

        const stats = {
            totalNotes: notes.length,
            pinnedNotes: notes.filter(note => note.isPinned).length,
            archivedNotes: notes.filter(note => note.isArchived).length,
            activeNotes: notes.filter(note => !note.isArchived).length,
            totalTags: [...new Set(notes.flatMap(note => note.tags || []))].length
        };

        logger.info(`Profile retrieved for user: ${user.email}`);

        res.status(200).json({
            success: true,
            data: {
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    avatar: user.avatar,
                    role: user.role,
                    isEmailVerified: user.isEmailVerified,
                    lastLogin: user.lastLogin,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt
                },
                stats
            }
        });
    } catch (error) {
        logger.error('Get profile error:', error);
        next(error);
    }
};

/**
 * @desc    Update user profile
 * @route   PUT /api/profile
 * @access  Private
 */
exports.updateProfile = async (req, res, next) => {
    try {
        const { name, avatar } = req.body;

        // Find user
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        // Update fields
        if (name !== undefined) {
            if (!name || name.trim().length === 0) {
                return res.status(400).json({
                    success: false,
                    error: 'Name cannot be empty'
                });
            }
            user.name = name.trim();
        }

        if (avatar !== undefined) {
            user.avatar = avatar;
        }

        await user.save();

        logger.info(`Profile updated for user: ${user.email}`);

        res.status(200).json({
            success: true,
            data: {
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    avatar: user.avatar,
                    role: user.role,
                    isEmailVerified: user.isEmailVerified,
                    lastLogin: user.lastLogin,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt
                }
            },
            message: 'Profile updated successfully'
        });
    } catch (error) {
        logger.error('Update profile error:', error);
        next(error);
    }
};

/**
 * @desc    Change user password
 * @route   PUT /api/profile/password
 * @access  Private
 */
exports.changePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;

        // Validation
        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                error: 'Please provide current password and new password'
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                error: 'New password must be at least 6 characters long'
            });
        }

        // Get user with password
        const user = await User.findById(req.user.id).select('+password');

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        // Check if user has a password (might be Google OAuth user)
        if (!user.password) {
            return res.status(400).json({
                success: false,
                error: 'Cannot change password for social login accounts'
            });
        }

        // Verify current password
        const isPasswordCorrect = await user.matchPassword(currentPassword);

        if (!isPasswordCorrect) {
            return res.status(401).json({
                success: false,
                error: 'Current password is incorrect'
            });
        }

        // Check if new password is same as current
        const isSamePassword = await user.matchPassword(newPassword);
        if (isSamePassword) {
            return res.status(400).json({
                success: false,
                error: 'New password must be different from current password'
            });
        }

        // Update password
        user.password = newPassword;
        await user.save();

        logger.info(`Password changed for user: ${user.email}`);

        res.status(200).json({
            success: true,
            message: 'Password changed successfully'
        });
    } catch (error) {
        logger.error('Change password error:', error);
        next(error);
    }
};

/**
 * @desc    Upload user avatar
 * @route   POST /api/profile/avatar
 * @access  Private
 */
exports.uploadAvatar = async (req, res, next) => {
    try {
        const { avatar } = req.body;

        if (!avatar) {
            return res.status(400).json({
                success: false,
                error: 'Please provide avatar data'
            });
        }

        // Basic validation for base64 image
        if (!avatar.startsWith('data:image/')) {
            return res.status(400).json({
                success: false,
                error: 'Invalid image format. Please provide a valid base64 encoded image'
            });
        }

        // Check size (base64 roughly 1.37x larger than original)
        // Allow ~5MB original = ~7MB base64
        const base64Size = avatar.length * 0.75; // Rough estimate
        if (base64Size > 7 * 1024 * 1024) {
            return res.status(400).json({
                success: false,
                error: 'Image size too large. Please upload image smaller than 5MB'
            });
        }

        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        // Delete old avatar from Cloudinary if exists
        if (user.avatar && user.avatar.includes('cloudinary.com')) {
            const oldPublicId = extractPublicId(user.avatar);
            if (oldPublicId) {
                try {
                    await deleteImage(oldPublicId);
                } catch (error) {
                    logger.warn(`Failed to delete old avatar: ${error.message}`);
                    // Continue even if deletion fails
                }
            }
        }

        // Upload new avatar to Cloudinary
        const uploadResult = await uploadImage(
            avatar,
            'scribo-notes/avatars',
            `user_${user._id}` // Use user ID as public_id for easy management
        );

        // Save Cloudinary URL to user
        user.avatar = uploadResult.url;
        await user.save();

        logger.info(`Avatar uploaded to Cloudinary for user: ${user.email}`);

        res.status(200).json({
            success: true,
            data: {
                avatar: user.avatar
            },
            message: 'Avatar uploaded successfully'
        });
    } catch (error) {
        logger.error('Upload avatar error:', error);

        // Check if it's a Cloudinary error
        if (error.message && error.message.includes('cloud storage')) {
            return res.status(500).json({
                success: false,
                error: 'Failed to upload image. Please try again later.'
            });
        }

        next(error);
    }
};

/**
 * @desc    Delete user avatar
 * @route   DELETE /api/profile/avatar
 * @access  Private
 */
exports.deleteAvatar = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        // Delete from Cloudinary if exists
        if (user.avatar && user.avatar.includes('cloudinary.com')) {
            const publicId = extractPublicId(user.avatar);
            if (publicId) {
                try {
                    await deleteImage(publicId);
                    logger.info(`Avatar deleted from Cloudinary: ${publicId}`);
                } catch (error) {
                    logger.warn(`Failed to delete avatar from Cloudinary: ${error.message}`);
                    // Continue even if Cloudinary deletion fails
                }
            }
        }

        user.avatar = null;
        await user.save();

        logger.info(`Avatar deleted for user: ${user.email}`);

        res.status(200).json({
            success: true,
            message: 'Avatar deleted successfully'
        });
    } catch (error) {
        logger.error('Delete avatar error:', error);
        next(error);
    }
};

/**
 * @desc    Get user statistics
 * @route   GET /api/profile/stats
 * @access  Private
 */
exports.getUserStats = async (req, res, next) => {
    try {
        const notes = await Note.find({ user: req.user.id });

        // Calculate various statistics
        const stats = {
            totalNotes: notes.length,
            pinnedNotes: notes.filter(note => note.isPinned).length,
            archivedNotes: notes.filter(note => note.isArchived).length,
            activeNotes: notes.filter(note => !note.isArchived).length,

            // Category breakdown
            categories: notes.reduce((acc, note) => {
                const category = note.category || 'General';
                acc[category] = (acc[category] || 0) + 1;
                return acc;
            }, {}),

            // Tag statistics
            totalTags: [...new Set(notes.flatMap(note => note.tags || []))].length,
            allTags: notes.flatMap(note => note.tags || []).reduce((acc, tag) => {
                acc[tag] = (acc[tag] || 0) + 1;
                return acc;
            }, {}),

            // Priority breakdown
            priorities: notes.reduce((acc, note) => {
                acc[note.priority] = (acc[note.priority] || 0) + 1;
                return acc;
            }, {}),

            // Color breakdown
            colors: notes.reduce((acc, note) => {
                acc[note.color] = (acc[note.color] || 0) + 1;
                return acc;
            }, {})
        };

        logger.info(`Stats retrieved for user: ${req.user.id}`);

        res.status(200).json({
            success: true,
            data: stats
        });
    } catch (error) {
        logger.error('Get user stats error:', error);
        next(error);
    }
};
