const mongoose = require('mongoose');

const NoteSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Note title is required'],
        trim: true,
        maxlength: [100, 'Title cannot be more than 100 characters']
    },
    content: {
        type: String,
        required: [true, 'Note content is required'],
        trim: true,
        maxlength: [10000, 'Content cannot be more than 10000 characters']
    },
    category: {
        type: String,
        trim: true,
        maxlength: [50, 'Category cannot be more than 50 characters'],
        default: 'General'
    },
    tags: [{
        type: String,
        trim: true,
        maxlength: [30, 'Tag cannot be more than 30 characters']
    }],
    isPinned: {
        type: Boolean,
        default: false
    },
    isArchived: {
        type: Boolean,
        default: false
    },
    color: {
        type: String,
        enum: ['default', 'red', 'orange', 'yellow', 'green', 'blue', 'purple', 'pink'],
        default: 'default'
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Note must belong to a user']
    },
    sharedWith: [{
        user: {
            type: mongoose.Schema.ObjectId,
            ref: 'User'
        },
        permission: {
            type: String,
            enum: ['read', 'write'],
            default: 'read'
        },
        sharedAt: {
            type: Date,
            default: Date.now
        }
    }],
    lastModified: {
        type: Date,
        default: Date.now
    },
    reminder: {
        date: {
            type: Date,
            default: null
        },
        isActive: {
            type: Boolean,
            default: false
        }
    },
    attachments: [{
        filename: {
            type: String,
            required: true
        },
        originalName: {
            type: String,
            required: true
        },
        mimetype: {
            type: String,
            required: true
        },
        size: {
            type: Number,
            required: true
        },
        uploadDate: {
            type: Date,
            default: Date.now
        }
    }]
}, {
    timestamps: true
});

// Update lastModified on save
NoteSchema.pre('save', function (next) {
    if (this.isModified() && !this.isNew) {
        this.lastModified = new Date();
    }
    next();
});

// Instance method to check if user can access this note
NoteSchema.methods.canUserAccess = function (userId, permission = 'read') {
    // Owner always has full access
    if (this.user.toString() === userId.toString()) {
        return true;
    }

    // Check if shared with user
    const sharedUser = this.sharedWith.find(share =>
        share.user.toString() === userId.toString()
    );

    if (!sharedUser) {
        return false;
    }

    // Check permission level
    if (permission === 'write') {
        return sharedUser.permission === 'write';
    }

    return true; // For read access, both 'read' and 'write' permissions work
};

// Instance method to add user to shared list
NoteSchema.methods.shareWithUser = function (userId, permission = 'read') {
    // Check if already shared
    const existingShare = this.sharedWith.find(share =>
        share.user.toString() === userId.toString()
    );

    if (existingShare) {
        existingShare.permission = permission;
        existingShare.sharedAt = new Date();
    } else {
        this.sharedWith.push({
            user: userId,
            permission: permission
        });
    }

    return this.save();
};

// Instance method to remove user from shared list
NoteSchema.methods.unshareWithUser = function (userId) {
    this.sharedWith = this.sharedWith.filter(share =>
        share.user.toString() !== userId.toString()
    );
    return this.save();
};

// Static method to find notes by user (including shared notes)
NoteSchema.statics.findByUser = function (userId, options = {}) {
    const {
        includeArchived = false,
        includeShared = true,
        category = null,
        tags = null,
        search = null,
        sortBy = 'updatedAt',
        sortOrder = 'desc',
        limit = null,
        skip = 0
    } = options;

    let query = {};

    // Base query - user's notes or shared notes
    if (includeShared) {
        query.$or = [
            { user: userId },
            { 'sharedWith.user': userId }
        ];
    } else {
        query.user = userId;
    }

    // Filter archived notes
    if (!includeArchived) {
        query.isArchived = false;
    }

    // Filter by category
    if (category) {
        query.category = category;
    }

    // Filter by tags
    if (tags && tags.length > 0) {
        query.tags = { $in: tags };
    }

    // Search in title and content
    if (search) {
        query.$and = query.$and || [];
        query.$and.push({
            $or: [
                { title: { $regex: search, $options: 'i' } },
                { content: { $regex: search, $options: 'i' } }
            ]
        });
    }

    // Build the query
    let noteQuery = this.find(query).populate('user', 'name email avatar');

    // Add sorting
    const sortObj = {};
    sortObj[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Priority sorting for pinned notes
    if (sortBy !== 'isPinned') {
        noteQuery = noteQuery.sort({ isPinned: -1, ...sortObj });
    } else {
        noteQuery = noteQuery.sort(sortObj);
    }

    // Add pagination
    if (skip) {
        noteQuery = noteQuery.skip(skip);
    }

    if (limit) {
        noteQuery = noteQuery.limit(limit);
    }

    return noteQuery;
};

// Static method to get user's note statistics
NoteSchema.statics.getUserStats = async function (userId) {
    const stats = await this.aggregate([
        {
            $match: {
                $or: [
                    { user: mongoose.Types.ObjectId(userId) },
                    { 'sharedWith.user': mongoose.Types.ObjectId(userId) }
                ]
            }
        },
        {
            $group: {
                _id: null,
                totalNotes: { $sum: 1 },
                pinnedNotes: {
                    $sum: { $cond: ['$isPinned', 1, 0] }
                },
                archivedNotes: {
                    $sum: { $cond: ['$isArchived', 1, 0] }
                },
                sharedNotes: {
                    $sum: { $cond: [{ $gt: [{ $size: '$sharedWith' }, 0] }, 1, 0] }
                },
                categoriesUsed: { $addToSet: '$category' },
                tagsUsed: { $addToSet: '$tags' }
            }
        },
        {
            $project: {
                _id: 0,
                totalNotes: 1,
                pinnedNotes: 1,
                archivedNotes: 1,
                sharedNotes: 1,
                totalCategories: { $size: '$categoriesUsed' },
                totalTags: { $size: { $reduce: { input: '$tagsUsed', initialValue: [], in: { $concatArrays: ['$$value', '$$this'] } } } }
            }
        }
    ]);

    return stats[0] || {
        totalNotes: 0,
        pinnedNotes: 0,
        archivedNotes: 0,
        sharedNotes: 0,
        totalCategories: 0,
        totalTags: 0
    };
};

// Indexes for better query performance
NoteSchema.index({ user: 1, createdAt: -1 });
NoteSchema.index({ user: 1, isPinned: -1, updatedAt: -1 });
NoteSchema.index({ user: 1, category: 1 });
NoteSchema.index({ user: 1, tags: 1 });
NoteSchema.index({ 'sharedWith.user': 1 });
NoteSchema.index({ title: 'text', content: 'text' }); // Text search index

module.exports = mongoose.model('Note', NoteSchema);