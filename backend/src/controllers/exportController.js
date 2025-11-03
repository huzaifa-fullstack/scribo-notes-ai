const Note = require('../models/Note');
const logger = require('../config/logger');
const exportService = require('../services/exportService');

// @desc    Export single note
// @route   GET /api/export/note/:id/:format
// @access  Private
const exportNote = async (req, res, next) => {
    try {
        const { id, format } = req.params;

        const note = await Note.findById(id);

        if (!note) {
            return res.status(404).json({
                success: false,
                error: 'Note not found'
            });
        }

        // Check if user owns the note
        if (note.user.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to export this note'
            });
        }

        logger.info(`Exporting note ${id} as ${format} for user ${req.user.email}`);

        let exportData;
        let contentType;
        let filename;

        switch (format.toLowerCase()) {
            case 'json':
                exportData = JSON.stringify(exportService.exportAsJSON(note), null, 2);
                contentType = 'application/json';
                filename = `${note.title.replace(/[^a-z0-9]/gi, '_')}.json`;
                break;

            case 'markdown':
            case 'md':
                exportData = exportService.exportAsMarkdown(note);
                contentType = 'text/markdown';
                filename = `${note.title.replace(/[^a-z0-9]/gi, '_')}.md`;
                break;

            case 'pdf':
                const pdfBytes = await exportService.exportAsPDF(note);
                exportData = Buffer.from(pdfBytes);
                contentType = 'application/pdf';
                filename = `${note.title.replace(/[^a-z0-9]/gi, '_')}.pdf`;
                break;

            default:
                return res.status(400).json({
                    success: false,
                    error: 'Invalid format. Use json, markdown, or pdf'
                });
        }

        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send(exportData);

    } catch (error) {
        logger.error('Export note error:', error);
        next(error);
    }
};

// @desc    Export all notes
// @route   GET /api/export/notes/:format
// @access  Private
const exportAllNotes = async (req, res, next) => {
    try {
        const { format } = req.params;

        // Only export non-deleted notes (exclude recycle bin)
        const notes = await Note.find({ 
            user: req.user.id,
            isDeleted: false 
        });

        if (notes.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'No notes found to export'
            });
        }

        logger.info(`Exporting ${notes.length} notes as ${format} for user ${req.user.email}`);

        let exportData;
        let contentType;
        let filename;

        switch (format.toLowerCase()) {
            case 'json':
                exportData = JSON.stringify(exportService.exportMultipleAsJSON(notes), null, 2);
                contentType = 'application/json';
                filename = `notes_backup_${Date.now()}.json`;
                break;

            case 'markdown':
            case 'md':
                exportData = notes.map(note => exportService.exportAsMarkdown(note)).join('\n\n---\n\n');
                contentType = 'text/markdown';
                filename = `notes_backup_${Date.now()}.md`;
                break;

            case 'pdf':
                const pdfBytesMultiple = await exportService.exportMultipleAsPDF(notes);
                exportData = Buffer.from(pdfBytesMultiple);
                contentType = 'application/pdf';
                filename = `notes_backup_${Date.now()}.pdf`;
                break;

            default:
                return res.status(400).json({
                    success: false,
                    error: 'Invalid format. Use json, markdown, or pdf for bulk export'
                });
        }

        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send(exportData);

    } catch (error) {
        logger.error('Export all notes error:', error);
        next(error);
    }
};

// @desc    Import notes
// @route   POST /api/export/import
// @access  Private
const importNotes = async (req, res, next) => {
    try {
        const { format, data } = req.body;

        if (!data) {
            return res.status(400).json({
                success: false,
                error: 'No data provided'
            });
        }

        logger.info(`Importing notes as ${format} for user ${req.user.email}`);

        let parsedNotes;

        // Validate and parse based on format
        switch (format.toLowerCase()) {
            case 'json':
                // Validate JSON structure
                try {
                    const parsed = typeof data === 'string' ? JSON.parse(data) : data;
                    if (!parsed || typeof parsed !== 'object') {
                        throw new Error('Invalid JSON structure');
                    }
                    parsedNotes = exportService.parseImportedJSON(data);
                } catch (parseError) {
                    return res.status(400).json({
                        success: false,
                        error: 'Invalid JSON file. Please ensure the file is in correct JSON format.'
                    });
                }
                break;

            case 'notion':
                // Validate Notion format
                try {
                    const parsed = typeof data === 'string' ? JSON.parse(data) : data;
                    parsedNotes = exportService.parseNotionFormat(data);
                } catch (parseError) {
                    return res.status(400).json({
                        success: false,
                        error: 'Invalid Notion file. Please ensure the file is exported from Notion.'
                    });
                }
                break;

            case 'markdown':
            case 'md':
                // Validate markdown format
                if (typeof data !== 'string' || !data.trim()) {
                    return res.status(400).json({
                        success: false,
                        error: 'Invalid Markdown file. Please ensure the file is in text format.'
                    });
                }
                try {
                    parsedNotes = exportService.parseMarkdownFormat(data);
                } catch (parseError) {
                    return res.status(400).json({
                        success: false,
                        error: 'Invalid Markdown format. Please check the file structure.'
                    });
                }
                break;

            default:
                return res.status(400).json({
                    success: false,
                    error: 'Invalid format. Use json, notion, or markdown'
                });
        }

        // Validate parsed notes
        if (!parsedNotes || parsedNotes.length === 0) {
            logger.warn(`No valid notes found in import file for user ${req.user.email}`);
            return res.status(400).json({
                success: false,
                error: 'No valid notes found in the file'
            });
        }

        logger.info(`Attempting to import ${parsedNotes.length} notes for user ${req.user.email}`);

        // Create notes with individual error handling
        const createdNotes = [];
        const errors = [];

        for (let i = 0; i < parsedNotes.length; i++) {
            try {
                const noteData = parsedNotes[i];
                const createdNote = await Note.create({
                    ...noteData,
                    user: req.user.id
                });
                createdNotes.push(createdNote);
                logger.info(`Successfully created note ${i + 1}/${parsedNotes.length}: "${noteData.title}"`);
            } catch (noteError) {
                logger.error(`Failed to create note ${i + 1}/${parsedNotes.length}:`, noteError);
                errors.push({
                    index: i + 1,
                    title: parsedNotes[i]?.title || 'Unknown',
                    error: noteError.message
                });
            }
        }

        logger.info(`Import complete: ${createdNotes.length} notes created, ${errors.length} failed for user ${req.user.email}`);

        // Return response with details
        const response = {
            success: createdNotes.length > 0,
            message: errors.length > 0
                ? `Imported ${createdNotes.length} of ${parsedNotes.length} notes. ${errors.length} failed.`
                : `Successfully imported ${createdNotes.length} notes`,
            count: createdNotes.length,
            notes: createdNotes
        };

        if (errors.length > 0) {
            response.errors = errors;
            response.warning = 'Some notes could not be imported due to validation errors.';
        }

        res.status(createdNotes.length > 0 ? 201 : 400).json(response);

    } catch (error) {
        logger.error('Import notes error:', error);
        next(error);
    }
};

module.exports = {
    exportNote,
    exportAllNotes,
    importNotes
};