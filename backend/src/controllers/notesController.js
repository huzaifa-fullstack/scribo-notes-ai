const Note = require('../models/Note');
const User = require('../models/User');
const logger = require('../config/logger');

// @desc    Get all notes for authenticated user
// @route   GET /api/notes
// @access  Private
const getNotes = async (req, res, next) => {
    try {
        const {
            search,
            category,
            tags,
            archived,
            pinned,
            shared,
            sortBy = 'updatedAt',
            sortOrder = 'desc',
            page = 1,
            limit = 10
        } = req.query;

        const options = {
            includeArchived: archived === 'true',
            includeShared: shared !== 'false',
            category: category || null,
            tags: tags ? tags.split(',') : null,
            search: search || null,
            sortBy,
            sortOrder,
            limit: parseInt(limit),
            skip: (parseInt(page) - 1) * parseInt(limit)
        };

        // Add pinned filter if specified
        let notes = await Note.findByUser(req.user.id, options);

        if (pinned === 'true') {
            notes = notes.filter(note => note.isPinned);
        } else if (pinned === 'false') {
            notes = notes.filter(note => !note.isPinned);
        }

        const total = await Note.countDocuments({
            $or: [
                { user: req.user.id },
                { 'sharedWith.user': req.user.id }
            ],
            isDeleted: false,
            ...(archived === 'true' ? {} : { isArchived: false })
        });

        logger.info(`User ${req.user.email} retrieved ${notes.length} notes`);

        res.status(200).json({
            success: true,
            count: notes.length,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit),
            data: notes
        });

    } catch (error) {
        logger.error('Get notes error:', error);
        next(error);
    }
};

// @desc    Get single note
// @route   GET /api/notes/:id
// @access  Private
const getNote = async (req, res, next) => {
    try {
        const note = await Note.findById(req.params.id).populate('user', 'name email avatar');

        if (!note) {
            return res.status(404).json({
                success: false,
                error: 'Note not found'
            });
        }

        // Check if user can access this note
        if (!note.canUserAccess(req.user.id)) {
            logger.warn(`User ${req.user.email} attempted to access unauthorized note ${req.params.id}`);
            return res.status(403).json({
                success: false,
                error: 'Not authorized to access this note'
            });
        }

        logger.info(`User ${req.user.email} accessed note ${note._id}`);

        res.status(200).json({
            success: true,
            data: note
        });

    } catch (error) {
        logger.error('Get single note error:', error);
        next(error);
    }
};

// @desc    Create new note
// @route   POST /api/notes
// @access  Private
const createNote = async (req, res, next) => {
    try {
        const { title, content, category, tags, color, priority } = req.body;

        // Validate required fields
        if (!title || !content) {
            return res.status(400).json({
                success: false,
                error: 'Please provide title and content'
            });
        }

        const noteData = {
            title: title.trim(),
            content: content.trim(),
            user: req.user.id,
            category: category ? category.trim() : 'General',
            tags: tags && Array.isArray(tags) ? tags.map(tag => tag.trim()) : [],
            color: color || 'default',
            priority: priority || 'medium'
        };

        const note = await Note.create(noteData);
        await note.populate('user', 'name email avatar');

        logger.info(`User ${req.user.email} created note ${note._id}`);

        res.status(201).json({
            success: true,
            message: 'Note created successfully',
            data: note
        });

    } catch (error) {
        logger.error('Create note error:', error);
        next(error);
    }
};

// @desc    Update note
// @route   PUT /api/notes/:id
// @access  Private
const updateNote = async (req, res, next) => {
    try {
        let note = await Note.findById(req.params.id);

        if (!note) {
            return res.status(404).json({
                success: false,
                error: 'Note not found'
            });
        }

        // Check if user can write to this note
        if (!note.canUserAccess(req.user.id, 'write')) {
            logger.warn(`User ${req.user.email} attempted to update unauthorized note ${req.params.id}`);
            return res.status(403).json({
                success: false,
                error: 'Not authorized to update this note'
            });
        }

        const { title, content, category, tags, color, priority } = req.body;

        const updateData = {};
        if (title !== undefined) updateData.title = title.trim();
        if (content !== undefined) updateData.content = content.trim();
        if (category !== undefined) updateData.category = category.trim();
        if (tags !== undefined) updateData.tags = Array.isArray(tags) ? tags.map(tag => tag.trim()) : [];
        if (color !== undefined) updateData.color = color;
        if (priority !== undefined) updateData.priority = priority;

        note = await Note.findByIdAndUpdate(
            req.params.id,
            updateData,
            {
                new: true,
                runValidators: true
            }
        ).populate('user', 'name email avatar');

        logger.info(`User ${req.user.email} updated note ${note._id}`);

        res.status(200).json({
            success: true,
            message: 'Note updated successfully',
            data: note
        });

    } catch (error) {
        logger.error('Update note error:', error);
        next(error);
    }
};

// @desc    Delete note (soft delete - move to recycle bin)
// @route   DELETE /api/notes/:id
// @access  Private
const deleteNote = async (req, res, next) => {
    try {
        const note = await Note.findById(req.params.id);

        if (!note) {
            return res.status(404).json({
                success: false,
                error: 'Note not found'
            });
        }

        // Only owner can delete note
        if (note.user.toString() !== req.user.id.toString()) {
            logger.warn(`User ${req.user.email} attempted to delete unauthorized note ${req.params.id}`);
            return res.status(403).json({
                success: false,
                error: 'Not authorized to delete this note'
            });
        }

        // Soft delete - mark as deleted instead of removing from database
        note.isDeleted = true;
        note.deletedAt = new Date();
        await note.save();

        logger.info(`User ${req.user.email} moved note ${req.params.id} to recycle bin`);

        res.status(200).json({
            success: true,
            message: 'Note moved to recycle bin successfully',
            data: note
        });

    } catch (error) {
        logger.error('Delete note error:', error);
        next(error);
    }
};

// @desc    Toggle pin status
// @route   PUT /api/notes/:id/pin
// @access  Private
const togglePin = async (req, res, next) => {
    try {
        let note = await Note.findById(req.params.id);

        if (!note) {
            return res.status(404).json({
                success: false,
                error: 'Note not found'
            });
        }

        // Check if user can write to this note
        if (!note.canUserAccess(req.user.id, 'write')) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to pin/unpin this note'
            });
        }

        note.isPinned = !note.isPinned;
        await note.save();

        logger.info(`User ${req.user.email} ${note.isPinned ? 'pinned' : 'unpinned'} note ${note._id}`);

        res.status(200).json({
            success: true,
            message: `Note ${note.isPinned ? 'pinned' : 'unpinned'} successfully`,
            data: note
        });

    } catch (error) {
        logger.error('Toggle pin error:', error);
        next(error);
    }
};

// @desc    Toggle archive status
// @route   PUT /api/notes/:id/archive
// @access  Private
const toggleArchive = async (req, res, next) => {
    try {
        let note = await Note.findById(req.params.id);

        if (!note) {
            return res.status(404).json({
                success: false,
                error: 'Note not found'
            });
        }

        // Check if user can write to this note
        if (!note.canUserAccess(req.user.id, 'write')) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to archive/unarchive this note'
            });
        }

        note.isArchived = !note.isArchived;
        await note.save();

        logger.info(`User ${req.user.email} ${note.isArchived ? 'archived' : 'unarchived'} note ${note._id}`);

        res.status(200).json({
            success: true,
            message: `Note ${note.isArchived ? 'archived' : 'unarchived'} successfully`,
            data: note
        });

    } catch (error) {
        logger.error('Toggle archive error:', error);
        next(error);
    }
};

// @desc    Share note with user
// @route   POST /api/notes/:id/share
// @access  Private
const shareNote = async (req, res, next) => {
    try {
        const { email, permission = 'read' } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                error: 'Please provide email address'
            });
        }

        const note = await Note.findById(req.params.id);

        if (!note) {
            return res.status(404).json({
                success: false,
                error: 'Note not found'
            });
        }

        // Only owner can share note
        if (note.user.toString() !== req.user.id.toString()) {
            return res.status(403).json({
                success: false,
                error: 'Only note owner can share notes'
            });
        }

        // Find user to share with
        const userToShareWith = await User.findOne({ email: email.toLowerCase() });

        if (!userToShareWith) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        // Can't share with yourself
        if (userToShareWith._id.toString() === req.user.id.toString()) {
            return res.status(400).json({
                success: false,
                error: 'Cannot share note with yourself'
            });
        }

        await note.shareWithUser(userToShareWith._id, permission);

        logger.info(`User ${req.user.email} shared note ${note._id} with ${email}`);

        res.status(200).json({
            success: true,
            message: `Note shared with ${email} successfully`,
            data: note
        });

    } catch (error) {
        logger.error('Share note error:', error);
        next(error);
    }
};

// @desc    Unshare note
// @route   DELETE /api/notes/:id/share/:userId
// @access  Private
const unshareNote = async (req, res, next) => {
    try {
        const note = await Note.findById(req.params.id);

        if (!note) {
            return res.status(404).json({
                success: false,
                error: 'Note not found'
            });
        }

        // Only owner can unshare note
        if (note.user.toString() !== req.user.id.toString()) {
            return res.status(403).json({
                success: false,
                error: 'Only note owner can unshare notes'
            });
        }

        await note.unshareWithUser(req.params.userId);

        logger.info(`User ${req.user.email} unshared note ${note._id} from user ${req.params.userId}`);

        res.status(200).json({
            success: true,
            message: 'Note unshared successfully',
            data: note
        });

    } catch (error) {
        logger.error('Unshare note error:', error);
        next(error);
    }
};

// @desc    Get user note statistics
// @route   GET /api/notes/stats
// @access  Private
const getNoteStats = async (req, res, next) => {
    try {
        const stats = await Note.getUserStats(req.user.id);

        logger.info(`User ${req.user.email} retrieved note statistics`);

        res.status(200).json({
            success: true,
            data: stats
        });

    } catch (error) {
        logger.error('Get note stats error:', error);
        next(error);
    }
};

// @desc    Restore note from recycle bin
// @route   PUT /api/notes/:id/restore
// @access  Private
const restoreNote = async (req, res, next) => {
    try {
        const note = await Note.findById(req.params.id);

        if (!note) {
            return res.status(404).json({
                success: false,
                error: 'Note not found'
            });
        }

        // Only owner can restore note
        if (note.user.toString() !== req.user.id.toString()) {
            logger.warn(`User ${req.user.email} attempted to restore unauthorized note ${req.params.id}`);
            return res.status(403).json({
                success: false,
                error: 'Not authorized to restore this note'
            });
        }

        // Check if note is actually deleted
        if (!note.isDeleted) {
            return res.status(400).json({
                success: false,
                error: 'Note is not in recycle bin'
            });
        }

        // Restore the note
        note.isDeleted = false;
        note.deletedAt = null;
        await note.save();

        logger.info(`User ${req.user.email} restored note ${req.params.id} from recycle bin`);

        res.status(200).json({
            success: true,
            message: 'Note restored successfully',
            data: note
        });

    } catch (error) {
        logger.error('Restore note error:', error);
        next(error);
    }
};

// @desc    Permanently delete note
// @route   DELETE /api/notes/:id/permanent
// @access  Private
const permanentlyDeleteNote = async (req, res, next) => {
    try {
        const note = await Note.findById(req.params.id);

        if (!note) {
            return res.status(404).json({
                success: false,
                error: 'Note not found'
            });
        }

        // Only owner can permanently delete note
        if (note.user.toString() !== req.user.id.toString()) {
            logger.warn(`User ${req.user.email} attempted to permanently delete unauthorized note ${req.params.id}`);
            return res.status(403).json({
                success: false,
                error: 'Not authorized to delete this note'
            });
        }

        // Permanently delete from database
        await Note.findByIdAndDelete(req.params.id);

        logger.info(`User ${req.user.email} permanently deleted note ${req.params.id}`);

        res.status(200).json({
            success: true,
            message: 'Note permanently deleted successfully',
            data: {}
        });

    } catch (error) {
        logger.error('Permanently delete note error:', error);
        next(error);
    }
};

// @desc    Empty recycle bin (permanently delete all deleted notes)
// @route   DELETE /api/notes/recycle-bin/empty
// @access  Private
const emptyRecycleBin = async (req, res, next) => {
    try {
        // Find all deleted notes belonging to the user
        const deletedNotes = await Note.find({
            user: req.user.id,
            isDeleted: true
        });

        // Permanently delete all notes in recycle bin
        const result = await Note.deleteMany({
            user: req.user.id,
            isDeleted: true
        });

        logger.info(`User ${req.user.email} emptied recycle bin - ${result.deletedCount} notes permanently deleted`);

        res.status(200).json({
            success: true,
            message: `${result.deletedCount} notes permanently deleted`,
            data: {
                deletedCount: result.deletedCount
            }
        });

    } catch (error) {
        logger.error('Empty recycle bin error:', error);
        next(error);
    }
};

// @desc    Get deleted notes (recycle bin)
// @route   GET /api/notes/recycle-bin
// @access  Private
const getRecycleBin = async (req, res, next) => {
    try {
        const {
            page = 1,
            limit = 10
        } = req.query;

        // Find all deleted notes belonging to the user
        const deletedNotes = await Note.find({
            user: req.user.id,
            isDeleted: true
        })
            .populate('user', 'name email avatar')
            .sort({ deletedAt: -1 })
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit));

        const total = await Note.countDocuments({
            user: req.user.id,
            isDeleted: true
        });

        logger.info(`User ${req.user.email} retrieved ${deletedNotes.length} deleted notes`);

        res.status(200).json({
            success: true,
            count: deletedNotes.length,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit),
            data: deletedNotes
        });

    } catch (error) {
        logger.error('Get recycle bin error:', error);
        next(error);
    }
};

module.exports = {
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
};