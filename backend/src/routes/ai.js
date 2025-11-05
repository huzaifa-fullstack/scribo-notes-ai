const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

// All AI routes require authentication
router.use(protect);

/**
 * @route   POST /api/ai/correct-grammar
 * @desc    Correct grammar and spelling in text
 * @access  Private
 */
router.post('/correct-grammar', aiController.correctGrammar);

/**
 * @route   POST /api/ai/summarize
 * @desc    Summarize text into key points
 * @access  Private
 */
router.post('/summarize', aiController.summarizeText);

/**
 * @route   POST /api/ai/generate-content
 * @desc    Generate content from user context
 * @access  Private
 */
router.post('/generate-content', aiController.generateContent);

/**
 * @route   POST /api/ai/suggest-tags
 * @desc    Suggest tags based on content
 * @access  Private
 */
router.post('/suggest-tags', aiController.suggestTags);

/**
 * @route   POST /api/ai/enhance-content
 * @desc    Enhance and improve content
 * @access  Private
 */
router.post('/enhance-content', aiController.enhanceContent);

/**
 * @route   POST /api/ai/adjust-tone
 * @desc    Adjust tone of text
 * @access  Private
 */
router.post('/adjust-tone', aiController.adjustTone);

/**
 * @route   POST /api/ai/auto-suggestions
 * @desc    Get real-time auto-save suggestions
 * @access  Private
 */
router.post('/auto-suggestions', aiController.getAutoSuggestions);

/**
 * @route   POST /api/ai/batch
 * @desc    Process multiple AI actions in batch
 * @access  Private
 */
router.post('/batch', aiController.batchProcess);

module.exports = router;
