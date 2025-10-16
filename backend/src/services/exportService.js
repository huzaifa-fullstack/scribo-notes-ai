const marked = require('marked');
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const logger = require('../config/logger');

class ExportService {
    // Export note as JSON
    exportAsJSON(note) {
        try {
            return {
                title: note.title,
                content: note.content,
                tags: note.tags || [],
                isPinned: note.isPinned,
                isArchived: note.isArchived,
                createdAt: note.createdAt,
                updatedAt: note.updatedAt,
            };
        } catch (error) {
            logger.error('Export as JSON error:', error);
            throw error;
        }
    }

    // Export note as Markdown
    exportAsMarkdown(note) {
        try {
            let markdown = `# ${note.title}\n\n`;
            markdown += `${note.content}\n\n`;

            if (note.tags && note.tags.length > 0) {
                markdown += `**Tags:** ${note.tags.map(tag => `#${tag}`).join(', ')}\n\n`;
            }

            markdown += `---\n`;
            markdown += `Created: ${new Date(note.createdAt).toLocaleString()}\n`;
            markdown += `Updated: ${new Date(note.updatedAt).toLocaleString()}\n`;

            return markdown;
        } catch (error) {
            logger.error('Export as Markdown error:', error);
            throw error;
        }
    }

    // Export note as PDF using pdf-lib
    async exportAsPDF(note) {
        try {
            const pdfDoc = await PDFDocument.create();
            const page = pdfDoc.addPage([595.28, 841.89]); // A4 size

            const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
            const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

            let yPosition = 750;
            const margin = 50;
            const pageWidth = page.getWidth() - 2 * margin;

            // Title
            page.drawText(note.title, {
                x: margin,
                y: yPosition,
                size: 18,
                font: boldFont,
                color: rgb(0.15, 0.38, 0.91), // Blue color
            });
            yPosition -= 40;

            // Metadata
            const createdText = `Created: ${new Date(note.createdAt).toLocaleString()}`;
            const updatedText = `Updated: ${new Date(note.updatedAt).toLocaleString()}`;

            page.drawText(createdText, {
                x: margin,
                y: yPosition,
                size: 10,
                font: font,
                color: rgb(0.4, 0.4, 0.4),
            });
            yPosition -= 15;

            page.drawText(updatedText, {
                x: margin,
                y: yPosition,
                size: 10,
                font: font,
                color: rgb(0.4, 0.4, 0.4),
            });
            yPosition -= 30;

            // Content
            const contentLines = this.splitTextIntoLines(note.content, pageWidth, font, 12);

            for (const line of contentLines) {
                if (yPosition < 100) {
                    // Add new page if needed
                    const newPage = pdfDoc.addPage([595.28, 841.89]);
                    page = newPage;
                    yPosition = 750;
                }

                page.drawText(line, {
                    x: margin,
                    y: yPosition,
                    size: 12,
                    font: font,
                    color: rgb(0, 0, 0),
                });
                yPosition -= 18;
            }

            // Tags
            if (note.tags && note.tags.length > 0) {
                yPosition -= 20;
                page.drawText('Tags:', {
                    x: margin,
                    y: yPosition,
                    size: 12,
                    font: boldFont,
                    color: rgb(0, 0, 0),
                });
                yPosition -= 20;

                const tagsText = note.tags.map(tag => `#${tag}`).join(', ');
                page.drawText(tagsText, {
                    x: margin,
                    y: yPosition,
                    size: 10,
                    font: font,
                    color: rgb(0.15, 0.38, 0.91),
                });
            }

            // Footer
            const exportText = `Exported from Notes App on ${new Date().toLocaleString()}`;
            page.drawText(exportText, {
                x: margin,
                y: 50,
                size: 8,
                font: font,
                color: rgb(0.5, 0.5, 0.5),
            });

            return await pdfDoc.save();
        } catch (error) {
            logger.error('Export as PDF error:', error);
            throw error;
        }
    }

    // Helper function to split text into lines for PDF
    splitTextIntoLines(text, maxWidth, font, fontSize) {
        const words = text.split(' ');
        const lines = [];
        let currentLine = '';

        for (const word of words) {
            const testLine = currentLine + (currentLine ? ' ' : '') + word;
            const textWidth = font.widthOfTextAtSize(testLine, fontSize);

            if (textWidth < maxWidth) {
                currentLine = testLine;
            } else {
                if (currentLine) {
                    lines.push(currentLine);
                }
                currentLine = word;
            }
        }

        if (currentLine) {
            lines.push(currentLine);
        }

        return lines;
    }

    // Export multiple notes as JSON
    exportMultipleAsJSON(notes) {
        try {
            return {
                exportDate: new Date().toISOString(),
                totalNotes: notes.length,
                notes: notes.map(note => this.exportAsJSON(note))
            };
        } catch (error) {
            logger.error('Export multiple notes error:', error);
            throw error;
        }
    }

    // Parse imported JSON notes
    parseImportedJSON(data) {
        try {
            const parsed = typeof data === 'string' ? JSON.parse(data) : data;

            let notesArray = [];

            // Support both single note and multiple notes format
            if (parsed.notes && Array.isArray(parsed.notes)) {
                notesArray = parsed.notes;
            } else if (Array.isArray(parsed)) {
                notesArray = parsed;
            } else if (parsed.title || parsed.content) {
                notesArray = [parsed];
            } else {
                throw new Error('Invalid JSON structure');
            }

            // Validate and normalize each note
            return notesArray.map(note => {
                if (!note || typeof note !== 'object') {
                    throw new Error('Invalid note object');
                }

                return {
                    title: note.title || 'Untitled',
                    content: note.content || '',
                    tags: Array.isArray(note.tags) ? note.tags : [],
                    isPinned: note.isPinned || false,
                    isArchived: note.isArchived || false
                };
            });
        } catch (error) {
            logger.error('Parse imported JSON error:', error);
            throw new Error(`Invalid JSON format: ${error.message}`);
        }
    }

    // Parse Notion format
    parseNotionFormat(data) {
        try {
            const parsed = typeof data === 'string' ? JSON.parse(data) : data;

            if (Array.isArray(parsed)) {
                return parsed.map(item => ({
                    title: item.title || item.properties?.title?.title?.[0]?.plain_text || 'Untitled',
                    content: item.content || item.properties?.content?.rich_text?.[0]?.plain_text || '',
                    tags: item.tags || []
                }));
            }

            return [{
                title: parsed.title || 'Untitled',
                content: parsed.content || '',
                tags: parsed.tags || []
            }];
        } catch (error) {
            logger.error('Parse Notion format error:', error);
            throw new Error('Invalid Notion format');
        }
    }

    // Parse Markdown files
    parseMarkdownFormat(markdown) {
        try {
            // Split content by note separator (--- surrounded by blank lines)
            const noteSections = markdown.split(/\n---\n\n/).filter(section => section.trim());

            // If no separators found, treat whole content as single note
            if (noteSections.length === 0) {
                noteSections.push(markdown);
            }

            const notes = noteSections.map(section => {
                const lines = section.trim().split('\n');
                let title = 'Untitled';
                let content = '';
                let tags = [];

                // Extract title (first # heading)
                const titleMatch = lines.find(line => line.startsWith('# '));
                if (titleMatch) {
                    title = titleMatch.replace('# ', '').trim();
                }

                // Extract content (everything except metadata)
                const contentLines = lines.filter(line =>
                    !line.startsWith('# ') &&
                    !line.startsWith('**Tags:**') &&
                    !line.startsWith('---') &&
                    !line.startsWith('Created:') &&
                    !line.startsWith('Updated:')
                );
                content = contentLines.join('\n').trim();

                // Extract tags
                const tagsLine = lines.find(line => line.startsWith('**Tags:**'));
                if (tagsLine) {
                    const tagsStr = tagsLine.replace('**Tags:**', '').trim();
                    tags = tagsStr.split(',').map(tag => tag.replace('#', '').trim()).filter(Boolean);
                }

                return {
                    title,
                    content,
                    tags
                };
            });

            logger.info(`Parsed ${notes.length} notes from markdown`);
            return notes;
        } catch (error) {
            logger.error('Parse Markdown format error:', error);
            throw new Error('Invalid Markdown format');
        }
    }
}

module.exports = new ExportService();