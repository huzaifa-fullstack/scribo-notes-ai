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

            // Content - clean HTML tags for PDF
            const cleanContent = this.cleanHtmlTags(note.content);
            const contentLines = this.splitTextIntoLines(cleanContent, pageWidth, font, 12);

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

    // Clean HTML tags from content for PDF export
    cleanHtmlTags(html) {
        if (!html || typeof html !== 'string') return '';

        // Remove HTML tags and decode HTML entities
        return html
            .replace(/<[^>]*>/g, '') // Remove all HTML tags
            .replace(/&nbsp;/g, ' ') // Replace &nbsp; with space
            .replace(/&lt;/g, '<') // Replace &lt; with <
            .replace(/&gt;/g, '>') // Replace &gt; with >
            .replace(/&amp;/g, '&') // Replace &amp; with &
            .replace(/&quot;/g, '"') // Replace &quot; with "
            .replace(/&#39;/g, "'") // Replace &#39; with '
            .replace(/\n\s*\n/g, '\n') // Remove extra line breaks
            .trim();
    }

    // Export multiple notes as PDF
    async exportMultipleAsPDF(notes) {
        try {
            const pdfDoc = await PDFDocument.create();
            const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
            const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

            let currentPage = pdfDoc.addPage([595.28, 841.89]); // A4 size
            let yPosition = 750;
            const margin = 50;
            const pageWidth = currentPage.getWidth() - 2 * margin;

            // Title Page
            currentPage.drawText('Notes Export', {
                x: margin,
                y: yPosition,
                size: 24,
                font: boldFont,
                color: rgb(0.15, 0.38, 0.91),
            });
            yPosition -= 40;

            currentPage.drawText(`Total Notes: ${notes.length}`, {
                x: margin,
                y: yPosition,
                size: 14,
                font: font,
                color: rgb(0.4, 0.4, 0.4),
            });
            yPosition -= 30;

            currentPage.drawText(`Exported on: ${new Date().toLocaleString()}`, {
                x: margin,
                y: yPosition,
                size: 12,
                font: font,
                color: rgb(0.4, 0.4, 0.4),
            });
            yPosition -= 60;

            // Process each note
            for (let i = 0; i < notes.length; i++) {
                const note = notes[i];

                // Check if we need a new page for the note
                if (yPosition < 200) {
                    currentPage = pdfDoc.addPage([595.28, 841.89]);
                    yPosition = 750;
                }

                // Note separator (except for first note)
                if (i > 0) {
                    currentPage.drawLine({
                        start: { x: margin, y: yPosition + 10 },
                        end: { x: pageWidth + margin, y: yPosition + 10 },
                        thickness: 1,
                        color: rgb(0.8, 0.8, 0.8),
                    });
                    yPosition -= 30;
                }

                // Note title
                currentPage.drawText(note.title, {
                    x: margin,
                    y: yPosition,
                    size: 16,
                    font: boldFont,
                    color: rgb(0.15, 0.38, 0.91),
                });
                yPosition -= 25;

                // Note metadata
                const createdText = `Created: ${new Date(note.createdAt).toLocaleString()}`;
                currentPage.drawText(createdText, {
                    x: margin,
                    y: yPosition,
                    size: 9,
                    font: font,
                    color: rgb(0.4, 0.4, 0.4),
                });
                yPosition -= 20;

                // Note content
                const cleanContent = this.cleanHtmlTags(note.content);
                const contentLines = this.splitTextIntoLines(cleanContent, pageWidth, font, 11);

                for (const line of contentLines) {
                    if (yPosition < 100) {
                        currentPage = pdfDoc.addPage([595.28, 841.89]);
                        yPosition = 750;
                    }

                    currentPage.drawText(line, {
                        x: margin,
                        y: yPosition,
                        size: 11,
                        font: font,
                        color: rgb(0, 0, 0),
                    });
                    yPosition -= 16;
                }

                // Note tags
                if (note.tags && note.tags.length > 0) {
                    yPosition -= 10;
                    const tagsText = `Tags: ${note.tags.map(tag => `#${tag}`).join(', ')}`;
                    currentPage.drawText(tagsText, {
                        x: margin,
                        y: yPosition,
                        size: 9,
                        font: font,
                        color: rgb(0.15, 0.38, 0.91),
                    });
                    yPosition -= 30;
                }

                yPosition -= 20; // Space between notes
            }

            return await pdfDoc.save();
        } catch (error) {
            logger.error('Export multiple notes as PDF error:', error);
            throw error;
        }
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
            // Try different separator patterns to split notes
            let noteSections = [];

            // Pattern 1: --- with blank lines on both sides
            if (markdown.includes('\n---\n\n')) {
                noteSections = markdown.split(/\n---\n\n/).filter(section => section.trim());
            }
            // Pattern 2: --- with just newlines 
            else if (markdown.includes('\n---\n')) {
                noteSections = markdown.split(/\n---\n/).filter(section => section.trim());
            }
            // Pattern 3: --- at start of line
            else if (markdown.includes('\n---')) {
                noteSections = markdown.split(/\n---/).filter(section => section.trim());
            }
            // Pattern 4: Single note (no separators)
            else {
                noteSections = [markdown];
            }

            logger.info(`Found ${noteSections.length} note sections in markdown`);

            // If no valid sections found, treat whole content as single note
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