const Note = require('../models/Note');
const logger = require('../config/logger');

// Recycle bin retention period in days
const RECYCLE_BIN_RETENTION_DAYS = 30;

/**
 * Clean up old notes from recycle bin
 * Automatically deletes notes that have been in recycle bin for more than the retention period
 */
const cleanupRecycleBin = async () => {
    try {
        const retentionDate = new Date();
        retentionDate.setDate(retentionDate.getDate() - RECYCLE_BIN_RETENTION_DAYS);

        // Find and delete notes that have been in recycle bin longer than retention period
        const result = await Note.deleteMany({
            isDeleted: true,
            deletedAt: { $lte: retentionDate }
        });

        if (result.deletedCount > 0) {
            logger.info(`Recycle bin cleanup: Permanently deleted ${result.deletedCount} expired notes`);
        }

        return result.deletedCount;
    } catch (error) {
        logger.error('Recycle bin cleanup error:', error);
        throw error;
    }
};

/**
 * Schedule automatic cleanup of recycle bin
 * Runs daily at midnight
 */
const scheduleRecycleBinCleanup = () => {
    // Run cleanup immediately on startup
    cleanupRecycleBin().catch(err =>
        logger.error('Initial recycle bin cleanup failed:', err)
    );

    // Schedule cleanup to run daily at midnight
    const CLEANUP_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    setInterval(() => {
        cleanupRecycleBin().catch(err =>
            logger.error('Scheduled recycle bin cleanup failed:', err)
        );
    }, CLEANUP_INTERVAL);

    logger.info('Recycle bin cleanup scheduled to run daily');
};

module.exports = {
    cleanupRecycleBin,
    scheduleRecycleBinCleanup,
    RECYCLE_BIN_RETENTION_DAYS
};
