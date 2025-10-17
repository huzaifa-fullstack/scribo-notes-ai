const marked = require('marked');
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const logger = require('../config/logger');

class ExportService {
    // Clean HTML tags from content for PDF export
    cleanHtmlTags(htmlContent) {
        if (!htmlContent) return '';
        
        let cleanText = htmlContent
            // Handle common HTML elements
            .replace(/<p[^>]*>/gi, '')
            .replace(/<\/p>/gi, '\n')
            .replace(/<br\s*\/?>/gi, '\n')
            .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '$1')
            .replace(/<b[^>]*>(.*?)<\/b>/gi, '$1')
            .replace(/<em[^>]*>(.*?)<\/em>/gi, '$1')
            .replace(/<i[^>]*>(.*?)<\/i>/gi, '$1')
            .replace(/<u[^>]*>(.*?)<\/u>/gi, '$1')
            .replace(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/gi, '$1\n')
            .replace(/<ul[^>]*>/gi, '')
            .replace(/<\/ul>/gi, '\n')
            .replace(/<ol[^>]*>/gi, '')
            .replace(/<\/ol>/gi, '\n')
            .replace(/<li[^>]*>/gi, '• ')
            .replace(/<\/li>/gi, '\n')
            .replace(/<div[^>]*>/gi, '')
            .replace(/<\/div>/gi, '\n')
            .replace(/<span[^>]*>/gi, '')
            .replace(/<\/span>/gi, '')
            .replace(/<a[^>]*>(.*?)<\/a>/gi, '$1')
            .replace(/<img[^>]*>/gi, '[Image]')
            .replace(/<code[^>]*>(.*?)<\/code>/gi, '$1')
            .replace(/<pre[^>]*>(.*?)<\/pre>/gi, '$1')
            .replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gi, '"$1"')
            // Remove any remaining HTML tags
            .replace(/<[^>]*>/gi, '')
            // Decode HTML entities
            .replace(/&nbsp;/gi, ' ')
            .replace(/&amp;/gi, '&')
            .replace(/&lt;/gi, '<')
            .replace(/&gt;/gi, '>')
            .replace(/&quot;/gi, '"')
            .replace(/&#39;/gi, "'")
            .replace(/&hellip;/gi, '...')
            // Fix sentence breaks
            .replace(/\.\s*([A-Z][a-z])/g, '.\n$1')
            .replace(/!\s*([A-Z][a-z])/g, '!\n$1')
            .replace(/\?\s*([A-Z][a-z])/g, '?\n$1')
            // Fix colon-separated content
            .replace(/:\s*([A-Z])/g, ':\n$1')
            // Clean up extra whitespace and line breaks
            .replace(/\n\s*\n\s*\n/g, '\n\n')
            .trim();

        return cleanText;
    }

    // Split text into lines that fit within the given width
    splitTextIntoLines(text, maxLineWidth, font, fontSize) {
        if (!text) return [];
        
        const words = text.split(/\s+/);
        const lines = [];
        let currentLine = '';

        for (const word of words) {
            const testLine = currentLine ? `${currentLine} ${word}` : word;
            
            try {
                const testWidth = font.widthOfTextAtSize(testLine, fontSize);
                
                if (testWidth <= maxLineWidth) {
                    currentLine = testLine;
                } else {
                    if (currentLine) {
                        lines.push(currentLine);
                        currentLine = word;
                    } else {
                        // Word is too long, split it
                        let remainingWord = word;
                        while (remainingWord.length > 0) {
                            let charCount = 0;
                            let testWord = '';
                            
                            for (let i = 0; i < remainingWord.length; i++) {
                                testWord = remainingWord.substring(0, i + 1);
                                try {
                                    if (font.widthOfTextAtSize(testWord, fontSize) > maxLineWidth) {
                                        break;
                                    }
                                    charCount = i + 1;
                                } catch (e) {
                                    break;
                                }
                            }
                            
                            if (charCount === 0) charCount = 1; // At least one character
                            lines.push(remainingWord.substring(0, charCount));
                            remainingWord = remainingWord.substring(charCount);
                        }
                    }
                }
            } catch (error) {
                // Fallback if font measurement fails
                if (currentLine.length + word.length + 1 <= 60) {
                    currentLine = testLine;
                } else {
                    if (currentLine) {
                        lines.push(currentLine);
                    }
                    currentLine = word;
                }
            }
        }

        if (currentLine) {
            lines.push(currentLine);
        }

        return lines;
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

            // Content - Clean HTML tags before processing
            const cleanContent = this.cleanHtmlTags(note.content);
            
            // Split content into paragraphs and handle line breaks
            const paragraphs = cleanContent.split('\n').filter(p => p.trim());
            
            for (const paragraph of paragraphs) {
                if (paragraph.trim()) {
                    const contentLines = this.splitTextIntoLines(paragraph.trim(), pageWidth, font, 12);
                    
                    for (const line of contentLines) {
                        if (yPosition < 120) {
                            // Add new page if needed
                            page = pdfDoc.addPage([595.28, 841.89]);
                            yPosition = 750;
                        }

                        page.drawText(line, {
                            x: margin,
                            y: yPosition,
                            size: 12,
                            font: font,
                            color: rgb(0, 0, 0),
                        });
                        yPosition -= 22;
                    }
                    
                    // Add space between paragraphs
                    yPosition -= 8;
                }
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

    // Export multiple notes as a single PDF
    async exportMultipleAsPDF(notes) {
        try {
            const pdfDoc = await PDFDocument.create();
            
            const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
            const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
            
            let currentPage = pdfDoc.addPage([595.28, 841.89]); // A4 size
            let yPosition = 750;
            const margin = 50;
            const pageWidth = currentPage.getWidth() - 2 * margin;

            for (let i = 0; i < notes.length; i++) {
                const note = notes[i];
                
                // Check if we need a new page for the title (reserve space for title + some content)
                if (yPosition < 150) {
                    currentPage = pdfDoc.addPage([595.28, 841.89]);
                    yPosition = 750;
                }

                // Note title
                currentPage.drawText(note.title, {
                    x: margin,
                    y: yPosition,
                    size: 16,
                    font: boldFont,
                    color: rgb(0.15, 0.38, 0.91),
                });
                yPosition -= 30;

                // Note content with HTML cleaning
                const cleanContent = this.cleanHtmlTags(note.content);
                const paragraphs = cleanContent.split('\n').filter(p => p.trim());
                
                for (const paragraph of paragraphs) {
                    if (paragraph.trim()) {
                        const contentLines = this.splitTextIntoLines(paragraph.trim(), pageWidth, font, 11);
                        
                        for (const line of contentLines) {
                            if (yPosition < 80) {
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
                            yPosition -= 15;
                        }
                        yPosition -= 5; // Space between paragraphs
                    }
                }

                // Tags
                if (note.tags && note.tags.length > 0) {
                    if (yPosition < 100) {
                        currentPage = pdfDoc.addPage([595.28, 841.89]);
                        yPosition = 750;
                    }
                    
                    yPosition -= 10;
                    const tagsText = `Tags: ${note.tags.map(tag => `#${tag}`).join(', ')}`;
                    currentPage.drawText(tagsText, {
                        x: margin,
                        y: yPosition,
                        size: 9,
                        font: font,
                        color: rgb(0.5, 0.5, 0.5),
                    });
                    yPosition -= 20;
                }

                // Separator between notes (except for the last note)
                if (i < notes.length - 1) {
                    if (yPosition < 100) {
                        currentPage = pdfDoc.addPage([595.28, 841.89]);
                        yPosition = 750;
                    }
                    
                    yPosition -= 20;
                    currentPage.drawText('─'.repeat(60), {
                        x: margin,
                        y: yPosition,
                        size: 8,
                        font: font,
                        color: rgb(0.7, 0.7, 0.7),
                    });
                    yPosition -= 30;
                }
            }

            return await pdfDoc.save();
        } catch (error) {
            logger.error('Export multiple as PDF error:', error);
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

            // Support both single note and multiple notes format
            if (parsed.notes && Array.isArray(parsed.notes)) {
                return parsed.notes;
            } else if (Array.isArray(parsed)) {
                return parsed;
            } else {
                return [parsed];
            }
        } catch (error) {
            logger.error('Parse imported JSON error:', error);
            throw new Error('Invalid JSON format');
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
            const lines = markdown.split('\n');
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

            return [{
                title,
                content,
                tags
            }];
        } catch (error) {
            logger.error('Parse Markdown format error:', error);
            throw new Error('Invalid Markdown format');
        }
    }
}

module.exports = new ExportService();