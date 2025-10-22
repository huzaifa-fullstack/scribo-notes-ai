const marked = require('marked');
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const logger = require('../config/logger');

class ExportService {
    // Filter out characters not supported by PDF fonts (emojis, special unicode)
    sanitizeTextForPDF(text) {
        if (!text) return '';
        
        // Remove emojis and other unicode characters that Standard PDF fonts don't support
        // Keep only basic Latin characters, common punctuation, and symbols
        return text.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]/gu, '')
            .replace(/[^\x00-\x7F\u00A0-\u00FF\u0100-\u017F]/g, ''); // Keep ASCII + Latin Extended
    }

    // Parse HTML content into structured text segments with formatting
    parseHtmlFormatting(htmlContent) {
        if (!htmlContent) return [];

        const segments = [];
        let currentText = '';
        let currentFormat = { bold: false, italic: false, highlight: false, strikethrough: false, code: false };

        // Simple HTML parser that tracks formatting tags
        const tagStack = [];
        let i = 0;

        const flushText = () => {
            if (currentText) {
                segments.push({
                    text: currentText,
                    ...currentFormat
                });
                currentText = '';
            }
        };

        while (i < htmlContent.length) {
            if (htmlContent[i] === '<') {
                // Found a tag
                const tagEnd = htmlContent.indexOf('>', i);
                if (tagEnd === -1) break;

                const tagContent = htmlContent.substring(i + 1, tagEnd);
                const isClosing = tagContent.startsWith('/');
                const tagName = (isClosing ? tagContent.substring(1) : tagContent.split(' ')[0]).toLowerCase();

                if (isClosing) {
                    // Closing tag - update format
                    if (['strong', 'b'].includes(tagName)) {
                        flushText();
                        currentFormat.bold = false;
                    } else if (['em', 'i'].includes(tagName)) {
                        flushText();
                        currentFormat.italic = false;
                    } else if (tagName === 'mark') {
                        flushText();
                        currentFormat.highlight = false;
                    } else if (['s', 'strike', 'del'].includes(tagName)) {
                        flushText();
                        currentFormat.strikethrough = false;
                    } else if (tagName === 'code') {
                        flushText();
                        currentFormat.code = false;
                    } else if (tagName === 'p') {
                        flushText();
                        segments.push({ text: '\n\n', isBreak: true });
                    } else if (tagName === 'li') {
                        flushText();
                        segments.push({ text: '\n', isBreak: true });
                    } else if (['ul', 'ol'].includes(tagName)) {
                        flushText();
                        segments.push({ text: '\n', isBreak: true });
                    } else if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tagName)) {
                        flushText();
                        segments.push({ text: '\n\n', isBreak: true });
                    }
                } else {
                    // Opening tag - update format
                    if (['strong', 'b'].includes(tagName)) {
                        flushText();
                        currentFormat.bold = true;
                    } else if (['em', 'i'].includes(tagName)) {
                        flushText();
                        currentFormat.italic = true;
                    } else if (tagName === 'mark') {
                        flushText();
                        currentFormat.highlight = true;
                    } else if (['s', 'strike', 'del'].includes(tagName)) {
                        flushText();
                        currentFormat.strikethrough = true;
                    } else if (tagName === 'code') {
                        flushText();
                        currentFormat.code = true;
                    } else if (tagName === 'br') {
                        flushText();
                        segments.push({ text: '\n', isBreak: true });
                    } else if (tagName === 'p') {
                        flushText();
                        segments.push({ text: '\n\n', isBreak: true });
                    } else if (tagName === 'li') {
                        flushText();
                        segments.push({ text: '• ', isBreak: false });
                    } else if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tagName)) {
                        flushText();
                        segments.push({ text: '\n\n', isBreak: true });
                    }
                }

                i = tagEnd + 1;
            } else {
                // Regular text
                currentText += htmlContent[i];
                i++;
            }
        }

        flushText();

        // Decode HTML entities
        return segments.map(seg => {
            if (seg.text) {
                seg.text = seg.text
                    .replace(/&nbsp;/g, ' ')
                    .replace(/&lt;/g, '<')
                    .replace(/&gt;/g, '>')
                    .replace(/&amp;/g, '&')
                    .replace(/&quot;/g, '"')
                    .replace(/&#39;/g, "'")
                    .replace(/&#x27;/g, "'")
                    .replace(/&apos;/g, "'");
            }
            return seg;
        });
    }

    // Split a formatted segment into lines that fit page width
    splitSegmentIntoLines(segment, maxWidth, font, fontSize) {
        const words = segment.text.split(/\s+/);
        const lines = [];
        let currentLine = '';

        for (const word of words) {
            const testLine = currentLine ? `${currentLine} ${word}` : word;
            const textWidth = font.widthOfTextAtSize(testLine, fontSize);

            if (textWidth < maxWidth) {
                currentLine = testLine;
            } else {
                if (currentLine) {
                    lines.push({ ...segment, text: currentLine });
                }
                currentLine = word;
            }
        }

        if (currentLine) {
            lines.push({ ...segment, text: currentLine });
        }

        return lines;
    }

    // Clean HTML tags from content (for plain text exports)
    cleanHtmlTags(html) {
        if (!html || typeof html !== 'string') return '';

        // Remove script/style content first
        let text = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
            .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');

        // Replace block-level tags with appropriate newlines
        const doubleNewlineTags = ['p', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'section', 'article', 'header', 'footer', 'blockquote'];
        doubleNewlineTags.forEach(tag => {
            const open = new RegExp(`<${tag}[^>]*>`, 'gi');
            const close = new RegExp(`<\\/${tag}>`, 'gi');
            text = text.replace(open, '\n\n');
            text = text.replace(close, '\n\n');
        });

        // For lists
        const singleNewlineTags = ['ul', 'ol'];
        singleNewlineTags.forEach(tag => {
            const open = new RegExp(`<${tag}[^>]*>`, 'gi');
            const close = new RegExp(`<\\/${tag}>`, 'gi');
            text = text.replace(open, '\n');
            text = text.replace(close, '\n');
        });

        // Convert <br> to single newline
        text = text.replace(/<br\s*\\?>/gi, '\n');

        // Convert list items to bullets
        text = text.replace(/<li[^>]*>/gi, '• ')
            .replace(/<\/li>/gi, '\n');

        // Remove remaining tags
        text = text.replace(/<a[^>]*>(.*?)<\/a>/gi, '$1');
        text = text.replace(/<img[^>]*alt=["']([^"']+)["'][^>]*>/gi, '[$1]');
        text = text.replace(/<img[^>]*>/gi, '[Image]');
        text = text.replace(/<[^>]+>/g, '');

        // Decode HTML entities
        text = text.replace(/&nbsp;/g, ' ')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&amp;/g, '&')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .replace(/&#x27;/g, "'")
            .replace(/&apos;/g, "'")
            .replace(/&hellip;/g, '...');

        // Normalize line breaks
        text = text.split('\n')
            .map(line => line.replace(/[ \t]+/g, ' ').trim())
            .join('\n')
            .replace(/\n{3,}/g, '\n\n')
            .trim();

        return text;
    }

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

    // Export note as PDF with formatting support
    async exportAsPDF(note) {
        try {
            const pdfDoc = await PDFDocument.create();
            let currentPage = pdfDoc.addPage([595.28, 841.89]); // A4 size

            const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
            const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
            const italicFont = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);
            const boldItalicFont = await pdfDoc.embedFont(StandardFonts.HelveticaBoldOblique);

            let yPosition = 750;
            const margin = 50;
            const pageWidth = currentPage.getWidth() - 2 * margin;

            // Title (sanitize to remove emojis and unsupported characters)
            const sanitizedTitle = this.sanitizeTextForPDF(note.title);
            currentPage.drawText(sanitizedTitle, {
                x: margin,
                y: yPosition,
                size: 18,
                font: boldFont,
                color: rgb(0.15, 0.38, 0.91),
            });
            yPosition -= 35;

            // Metadata
            const createdText = `Created: ${new Date(note.createdAt).toLocaleString()}`;
            currentPage.drawText(createdText, {
                x: margin,
                y: yPosition,
                size: 9,
                font: font,
                color: rgb(0.5, 0.5, 0.5),
            });
            yPosition -= 30;

            // Content with formatting
            const segments = this.parseHtmlFormatting(note.content);

            for (const segment of segments) {
                if (segment.isBreak) {
                    // Handle line breaks and paragraph spacing
                    const breakCount = (segment.text.match(/\n/g) || []).length;
                    yPosition -= breakCount * 12;
                    continue;
                }

                // Select appropriate font based on formatting
                let selectedFont = font;
                if (segment.bold && segment.italic) {
                    selectedFont = boldItalicFont;
                } else if (segment.bold) {
                    selectedFont = boldFont;
                } else if (segment.italic) {
                    selectedFont = italicFont;
                }

                // Split segment into lines
                const lines = this.splitSegmentIntoLines(segment, pageWidth, selectedFont, 11);

                for (const line of lines) {
                    // Check if new page needed
                    if (yPosition < 100) {
                        currentPage = pdfDoc.addPage([595.28, 841.89]);
                        yPosition = 750;
                    }

                    // Sanitize text for PDF (remove emojis and unsupported characters)
                    const sanitizedText = this.sanitizeTextForPDF(line.text);

                    // Draw highlight background if needed
                    if (line.highlight) {
                        const textWidth = selectedFont.widthOfTextAtSize(sanitizedText, 11);
                        currentPage.drawRectangle({
                            x: margin - 2,
                            y: yPosition - 2,
                            width: textWidth + 4,
                            height: 14,
                            color: rgb(1, 1, 0.6), // Yellow highlight
                            opacity: 0.3,
                        });
                    }

                    // Draw text
                    let textColor = rgb(0, 0, 0);
                    if (line.code) {
                        textColor = rgb(0.8, 0.2, 0.2); // Red for code
                    }

                    currentPage.drawText(sanitizedText, {
                        x: margin,
                        y: yPosition,
                        size: 11,
                        font: selectedFont,
                        color: textColor,
                    });

                    // Draw strikethrough if needed
                    if (line.strikethrough) {
                        const textWidth = selectedFont.widthOfTextAtSize(sanitizedText, 11);
                        currentPage.drawLine({
                            start: { x: margin, y: yPosition + 4 },
                            end: { x: margin + textWidth, y: yPosition + 4 },
                            thickness: 1,
                            color: rgb(0, 0, 0),
                        });
                    }

                    yPosition -= 16;
                }
            }

            // Tags
            if (note.tags && note.tags.length > 0) {
                yPosition -= 20;
                if (yPosition < 100) {
                    currentPage = pdfDoc.addPage([595.28, 841.89]);
                    yPosition = 750;
                }

                const tagsText = `Tags: ${note.tags.map(tag => `#${tag}`).join(', ')}`;
                currentPage.drawText(tagsText, {
                    x: margin,
                    y: yPosition,
                    size: 9,
                    font: font,
                    color: rgb(0.15, 0.38, 0.91),
                });
            }

            return await pdfDoc.save();
        } catch (error) {
            logger.error('Export as PDF error:', error);
            throw error;
        }
    }

    // Export multiple notes as a single PDF with formatting
    async exportMultipleAsPDF(notes) {
        try {
            const pdfDoc = await PDFDocument.create();
            const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
            const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
            const italicFont = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);
            const boldItalicFont = await pdfDoc.embedFont(StandardFonts.HelveticaBoldOblique);

            let currentPage = pdfDoc.addPage([595.28, 841.89]);
            let yPosition = 750;
            const margin = 50;
            const pageWidth = currentPage.getWidth() - 2 * margin;

            // Title page
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
                color: rgb(0.5, 0.5, 0.5),
            });
            yPosition -= 25;

            currentPage.drawText(`Exported: ${new Date().toLocaleString()}`, {
                x: margin,
                y: yPosition,
                size: 12,
                font: font,
                color: rgb(0.5, 0.5, 0.5),
            });
            yPosition -= 60;

            // Process each note
            for (let i = 0; i < notes.length; i++) {
                const note = notes[i];

                // Check space for new note
                if (yPosition < 200) {
                    currentPage = pdfDoc.addPage([595.28, 841.89]);
                    yPosition = 750;
                }

                // Note separator
                if (i > 0) {
                    currentPage.drawLine({
                        start: { x: margin, y: yPosition + 10 },
                        end: { x: pageWidth + margin, y: yPosition + 10 },
                        thickness: 1,
                        color: rgb(0.8, 0.8, 0.8),
                    });
                    yPosition -= 30;
                }

                // Note title (sanitize to remove emojis)
                const sanitizedTitle = this.sanitizeTextForPDF(note.title);
                currentPage.drawText(sanitizedTitle, {
                    x: margin,
                    y: yPosition,
                    size: 16,
                    font: boldFont,
                    color: rgb(0.15, 0.38, 0.91),
                });
                yPosition -= 25;

                // Metadata
                const createdText = `Created: ${new Date(note.createdAt).toLocaleString()}`;
                currentPage.drawText(createdText, {
                    x: margin,
                    y: yPosition,
                    size: 9,
                    font: font,
                    color: rgb(0.5, 0.5, 0.5),
                });
                yPosition -= 20;

                // Content with formatting
                const segments = this.parseHtmlFormatting(note.content);

                for (const segment of segments) {
                    if (segment.isBreak) {
                        const breakCount = (segment.text.match(/\n/g) || []).length;
                        yPosition -= breakCount * 12;
                        continue;
                    }

                    let selectedFont = font;
                    if (segment.bold && segment.italic) {
                        selectedFont = boldItalicFont;
                    } else if (segment.bold) {
                        selectedFont = boldFont;
                    } else if (segment.italic) {
                        selectedFont = italicFont;
                    }

                    const lines = this.splitSegmentIntoLines(segment, pageWidth, selectedFont, 11);

                    for (const line of lines) {
                        if (yPosition < 100) {
                            currentPage = pdfDoc.addPage([595.28, 841.89]);
                            yPosition = 750;
                        }

                        // Sanitize text for PDF
                        const sanitizedText = this.sanitizeTextForPDF(line.text);

                        if (line.highlight) {
                            const textWidth = selectedFont.widthOfTextAtSize(sanitizedText, 11);
                            currentPage.drawRectangle({
                                x: margin - 2,
                                y: yPosition - 2,
                                width: textWidth + 4,
                                height: 14,
                                color: rgb(1, 1, 0.6),
                                opacity: 0.3,
                            });
                        }

                        let textColor = rgb(0, 0, 0);
                        if (line.code) {
                            textColor = rgb(0.8, 0.2, 0.2);
                        }

                        currentPage.drawText(sanitizedText, {
                            x: margin,
                            y: yPosition,
                            size: 11,
                            font: selectedFont,
                            color: textColor,
                        });

                        if (line.strikethrough) {
                            const textWidth = selectedFont.widthOfTextAtSize(sanitizedText, 11);
                            currentPage.drawLine({
                                start: { x: margin, y: yPosition + 4 },
                                end: { x: margin + textWidth, y: yPosition + 4 },
                                thickness: 1,
                                color: rgb(0, 0, 0),
                            });
                        }

                        yPosition -= 16;
                    }
                }

                // Tags
                if (note.tags && note.tags.length > 0) {
                    yPosition -= 10;
                    if (yPosition < 100) {
                        currentPage = pdfDoc.addPage([595.28, 841.89]);
                        yPosition = 750;
                    }

                    const tagsText = `Tags: ${note.tags.map(tag => `#${tag}`).join(', ')}`;
                    currentPage.drawText(tagsText, {
                        x: margin,
                        y: yPosition,
                        size: 9,
                        font: font,
                        color: rgb(0.15, 0.38, 0.91),
                    });
                    yPosition -= 20;
                }

                yPosition -= 20;
            }

            return await pdfDoc.save();
        } catch (error) {
            logger.error('Export multiple as PDF error:', error);
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

            if (parsed.notes && Array.isArray(parsed.notes)) {
                notesArray = parsed.notes;
            } else if (Array.isArray(parsed)) {
                notesArray = parsed;
            } else if (parsed.title || parsed.content) {
                notesArray = [parsed];
            } else {
                throw new Error('Invalid JSON structure');
            }

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

    // Parse Markdown files
    parseMarkdownFormat(markdown) {
        try {
            let noteSections = [];

            if (markdown.includes('\n---\n\n')) {
                noteSections = markdown.split(/\n---\n\n/).filter(section => section.trim());
            } else if (markdown.includes('\n---\n')) {
                noteSections = markdown.split(/\n---\n/).filter(section => section.trim());
            } else if (markdown.includes('\n---')) {
                noteSections = markdown.split(/\n---/).filter(section => section.trim());
            } else {
                noteSections = [markdown];
            }

            if (noteSections.length === 0) {
                noteSections.push(markdown);
            }

            const notes = noteSections.map(section => {
                const lines = section.trim().split('\n');
                let title = 'Untitled';
                let content = '';
                let tags = [];

                const titleMatch = lines.find(line => line.startsWith('# '));
                if (titleMatch) {
                    title = titleMatch.replace('# ', '').trim();
                }

                const contentLines = lines.filter(line =>
                    !line.startsWith('# ') &&
                    !line.startsWith('**Tags:**') &&
                    !line.startsWith('---') &&
                    !line.startsWith('Created:') &&
                    !line.startsWith('Updated:')
                );
                content = contentLines.join('\n').trim();

                const tagsLine = lines.find(line => line.startsWith('**Tags:**'));
                if (tagsLine) {
                    const tagsStr = tagsLine.replace('**Tags:**', '').trim();
                    tags = tagsStr.split(',').map(tag => tag.replace('#', '').trim()).filter(Boolean);
                }

                return { title, content, tags };
            });

            return notes;
        } catch (error) {
            logger.error('Parse Markdown format error:', error);
            throw new Error('Invalid Markdown format');
        }
    }
}

module.exports = new ExportService();
