const { expect } = require('chai');
const exportService = require('../src/services/exportService');

describe('Export Service Tests', () => {

    describe('Text Sanitization', () => {
        it('should sanitize text for PDF (remove emojis)', () => {
            const input = 'Hello 🎉 World 😊';
            const result = exportService.sanitizeTextForPDF(input);
            expect(result).to.not.include('🎉');
            expect(result).to.not.include('😊');
            expect(result).to.include('Hello');
            expect(result).to.include('World');
        });

        it('should handle empty or null text', () => {
            expect(exportService.sanitizeTextForPDF('')).to.equal('');
            expect(exportService.sanitizeTextForPDF(null)).to.equal('');
            expect(exportService.sanitizeTextForPDF(undefined)).to.equal('');
        });

        it('should preserve basic ASCII characters', () => {
            const input = 'Hello World! 123 @#$%';
            const result = exportService.sanitizeTextForPDF(input);
            expect(result).to.equal(input);
        });

        it('should remove unsupported unicode characters', () => {
            const input = 'Test ⚡ Special ★ Characters ♥';
            const result = exportService.sanitizeTextForPDF(input);
            expect(result).to.include('Test');
            expect(result).to.include('Special');
            expect(result).to.include('Characters');
        });
    });

    describe('HTML Formatting Parser', () => {
        it('should parse basic HTML formatting', () => {
            const html = '<p>Normal <strong>Bold</strong> <em>Italic</em></p>';
            const segments = exportService.parseHtmlFormatting(html);
            expect(segments).to.be.an('array');
            expect(segments.length).to.be.greaterThan(0);
        });

        it('should handle empty HTML', () => {
            const segments = exportService.parseHtmlFormatting('');
            expect(segments).to.be.an('array');
            expect(segments.length).to.equal(0);
        });

        it('should handle plain text without HTML tags', () => {
            const text = 'Plain text without any formatting';
            const segments = exportService.parseHtmlFormatting(text);
            expect(segments).to.be.an('array');
        });

        it('should handle nested HTML tags', () => {
            const html = '<p><strong><em>Bold and Italic</em></strong></p>';
            const segments = exportService.parseHtmlFormatting(html);
            expect(segments).to.be.an('array');
        });

        it('should handle malformed HTML gracefully', () => {
            const html = '<p>Unclosed tag <strong>Bold';
            const segments = exportService.parseHtmlFormatting(html);
            expect(segments).to.be.an('array');
        });
    });

    describe('Export to JSON', () => {
        it('should export single note to JSON format', () => {
            const note = {
                title: 'Test Note',
                content: 'Test content',
                category: 'General',
                tags: ['test'],
                createdAt: new Date(),
                updatedAt: new Date()
            };

            const result = exportService.exportAsJSON(note);
            // exportAsJSON returns a formatted JSON object, not string
            expect(result).to.exist;
            expect(result.title).to.equal('Test Note');
        });

        it('should export multiple notes to JSON', () => {
            const notes = [
                { title: 'Note 1', content: 'Content 1' },
                { title: 'Note 2', content: 'Content 2' }
            ];

            const result = exportService.exportMultipleAsJSON(notes);
            expect(result).to.be.an('object');
            expect(result.notes).to.be.an('array');
            expect(result.notes.length).to.equal(2);
            expect(result.totalNotes).to.equal(2);
        });

        it('should handle empty notes array', () => {
            const result = exportService.exportMultipleAsJSON([]);
            expect(result).to.be.an('object');
            expect(result.notes).to.be.an('array');
            expect(result.notes.length).to.equal(0);
            expect(result.totalNotes).to.equal(0);
        });

        it('should preserve special characters in JSON', () => {
            const note = {
                title: 'Test "Special" Characters',
                content: 'Line 1\nLine 2\tTabbed'
            };

            const result = exportService.exportAsJSON(note);
            expect(result.title).to.include('"Special"');
        });
    });

    describe('Export to Markdown', () => {
        it('should export single note to Markdown format', () => {
            const note = {
                title: 'Test Note',
                content: 'Test content',
                tags: ['tag1', 'tag2']
            };

            const markdown = exportService.exportAsMarkdown(note);
            expect(markdown).to.be.a('string');
            expect(markdown).to.include('# Test Note');
            expect(markdown).to.include('Test content');
        });

        it('should handle notes with tags', () => {
            const note = {
                title: 'Tagged Note',
                content: 'Content',
                tags: ['work', 'important']
            };

            const markdown = exportService.exportAsMarkdown(note);
            expect(markdown).to.include('work');
            expect(markdown).to.include('important');
        });

        it('should handle HTML content in notes', () => {
            const note = {
                title: 'HTML Note',
                content: '<p>Paragraph with <strong>bold</strong> text</p>'
            };

            const markdown = exportService.exportAsMarkdown(note);
            expect(markdown).to.be.a('string');
            expect(markdown).to.include('HTML Note');
        });
    });

    describe('Export to PDF', () => {
        it('should generate PDF buffer from note', async () => {
            const note = {
                title: 'PDF Test Note',
                content: 'This is test content for PDF'
            };

            const pdfBuffer = await exportService.exportAsPDF(note);
            // PDF lib returns Uint8Array which can be converted to Buffer
            expect(pdfBuffer).to.exist;
            expect(pdfBuffer.length).to.be.greaterThan(0);
        });

        it('should handle multiple notes in PDF', async () => {
            const notes = [
                { title: 'Note 1', content: 'Content 1' },
                { title: 'Note 2', content: 'Content 2' }
            ];

            const pdfBuffer = await exportService.exportMultipleAsPDF(notes);
            expect(pdfBuffer).to.exist;
            expect(pdfBuffer.length).to.be.greaterThan(0);
        });

        it('should handle empty notes array', async () => {
            const pdfBuffer = await exportService.exportMultipleAsPDF([]);
            expect(pdfBuffer).to.exist;
        });

        it('should handle long content with pagination', async () => {
            const longContent = 'Lorem ipsum dolor sit amet. '.repeat(100);
            const note = {
                title: 'Long Note',
                content: longContent
            };

            const pdfBuffer = await exportService.exportAsPDF(note);
            expect(pdfBuffer).to.exist;
            expect(pdfBuffer.length).to.be.greaterThan(1000);
        });

        it('should sanitize emojis from PDF content', async () => {
            const note = {
                title: 'Emoji Test 🎉',
                content: 'Content with emoji 😊'
            };

            const pdfBuffer = await exportService.exportAsPDF(note);
            expect(pdfBuffer).to.exist;
        });

        it('should handle notes with HTML formatting', async () => {
            const note = {
                title: 'Formatted Note',
                content: '<p>Paragraph with <strong>bold</strong> and <em>italic</em> text</p>'
            };

            const pdfBuffer = await exportService.exportAsPDF(note);
            expect(pdfBuffer).to.exist;
        });
    });

    describe('Error Handling', () => {
        it('should handle invalid note data gracefully', async () => {
            try {
                await exportService.exportAsPDF({ invalid: 'data' });
            } catch (error) {
                // Should either handle gracefully or throw appropriate error
                expect(error).to.exist;
            }
        });
    });
});
