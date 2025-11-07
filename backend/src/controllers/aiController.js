const aiService = require('../services/aiService');
const logger = require('../config/logger');

/**
 * @desc    Correct grammar and spelling in text
 * @route   POST /api/ai/correct-grammar
 * @access  Private
 */
exports.correctGrammar = async (req, res) => {
    try {
        logger.info('Grammar correction endpoint called');
        const { text } = req.body;

        if (!text) {
            logger.warn('No text provided for grammar correction');
            return res.status(400).json({
                success: false,
                message: 'Text is required',
            });
        }

        logger.info(`Processing grammar correction for text length: ${text.length}`);
        const result = await aiService.correctGrammar(text);

        res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        logger.error('Grammar correction controller error:', {
            message: error.message,
            stack: error.stack,
        });
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to correct grammar',
        });
    }
};

/**
 * @desc    Summarize text
 * @route   POST /api/ai/summarize
 * @access  Private
 */
exports.summarizeText = async (req, res) => {
    try {
        const { text, maxLength } = req.body;

        if (!text) {
            return res.status(400).json({
                success: false,
                message: 'Text is required',
            });
        }

        const result = await aiService.summarizeText(text, maxLength);

        res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        logger.error('Summarization controller error:', error.message);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to summarize text',
        });
    }
};

/**
 * @desc    Generate content from context
 * @route   POST /api/ai/generate-content
 * @access  Private
 */
exports.generateContent = async (req, res) => {
    try {
        const { context, style, length, tone } = req.body;

        if (!context) {
            return res.status(400).json({
                success: false,
                message: 'Context is required',
            });
        }

        const options = {
            style: style || 'professional',
            length: length || 'medium',
            tone: tone || 'neutral',
        };

        const result = await aiService.generateContent(context, options);

        res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        logger.error('Content generation controller error:', error.message);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to generate content',
        });
    }
};

/**
 * @desc    Suggest tags based on content
 * @route   POST /api/ai/suggest-tags
 * @access  Private
 */
exports.suggestTags = async (req, res) => {
    try {
        const { text, maxTags } = req.body;

        if (!text) {
            return res.status(400).json({
                success: false,
                message: 'Text is required',
            });
        }

        const result = await aiService.suggestTags(text, maxTags || 5);

        res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        console.error('Tag suggestion controller error:');
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);

        logger.error('Tag suggestion controller error:', error.message);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to suggest tags',
        });
    }
};

/**
 * @desc    Enhance content
 * @route   POST /api/ai/enhance-content
 * @access  Private
 */
exports.enhanceContent = async (req, res) => {
    try {
        const { text, style } = req.body;

        if (!text) {
            return res.status(400).json({
                success: false,
                message: 'Text is required',
            });
        }

        const result = await aiService.enhanceContent(text, style || 'professional');

        res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        logger.error('Content enhancement controller error:', error.message);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to enhance content',
        });
    }
};

/**
 * @desc    Adjust tone of text
 * @route   POST /api/ai/adjust-tone
 * @access  Private
 */
exports.adjustTone = async (req, res) => {
    try {
        const { text, tone } = req.body;

        if (!text) {
            return res.status(400).json({
                success: false,
                message: 'Text is required',
            });
        }

        if (!tone) {
            return res.status(400).json({
                success: false,
                message: 'Target tone is required',
            });
        }

        const result = await aiService.adjustTone(text, tone);

        res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        logger.error('Tone adjustment controller error:', error.message);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to adjust tone',
        });
    }
};

/**
 * @desc    Get auto-save suggestions
 * @route   POST /api/ai/auto-suggestions
 * @access  Private
 */
exports.getAutoSuggestions = async (req, res) => {
    try {
        const { text } = req.body;

        const result = await aiService.getAutoSaveSuggestions(text || '');

        res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        logger.error('Auto-suggestions controller error:', error.message);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to get suggestions',
        });
    }
};

/**
 * @desc    Process multiple AI actions in batch
 * @route   POST /api/ai/batch
 * @access  Private
 */
exports.batchProcess = async (req, res) => {
    try {
        const { text, actions } = req.body;

        if (!text) {
            return res.status(400).json({
                success: false,
                message: 'Text is required',
            });
        }

        if (!actions || !Array.isArray(actions) || actions.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'At least one action is required',
            });
        }

        const results = {};

        // Process each action
        for (const action of actions) {
            try {
                switch (action) {
                    case 'grammar':
                        results.grammar = await aiService.correctGrammar(text);
                        break;
                    case 'summarize':
                        results.summary = await aiService.summarizeText(text);
                        break;
                    case 'tags':
                        results.tags = await aiService.suggestTags(text);
                        break;
                    case 'enhance':
                        results.enhanced = await aiService.enhanceContent(text);
                        break;
                    default:
                        results[action] = { error: 'Unknown action' };
                }
            } catch (err) {
                results[action] = { error: err.message };
            }
        }

        res.status(200).json({
            success: true,
            data: results,
        });
    } catch (error) {
        logger.error('Batch processing controller error:', error.message);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to process batch actions',
        });
    }
};
