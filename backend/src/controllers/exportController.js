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

        const notes = await Note.find({ user: req.user.id });

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

        switch (format.toLowerCase()) {
            case 'json':
                parsedNotes = exportService.parseImportedJSON(data);
                break;

            case 'notion':
                parsedNotes = exportService.parseNotionFormat(data);
                break;

            case 'markdown':
            case 'md':
                parsedNotes = exportService.parseMarkdownFormat(data);
                break;

            default:
                return res.status(400).json({
                    success: false,
                    error: 'Invalid format. Use json, notion, or markdown'
                });
        }

        // Create notes
        const createdNotes = await Promise.all(
            parsedNotes.map(noteData =>
                Note.create({
                    ...noteData,
                    user: req.user.id
                })
            )
        );

        logger.info(`Imported ${createdNotes.length} notes for user ${req.user.email}`);

        res.status(201).json({
            success: true,
            message: `Successfully imported ${createdNotes.length} notes`,
            count: createdNotes.length,
            notes: createdNotes
        });

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