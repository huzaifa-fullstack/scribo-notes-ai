const axios = require('axios');
const logger = require('../config/logger');

// Hugging Face API Configuration
const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY;
const HUGGINGFACE_API_URL = 'https://api-inference.huggingface.co/models';

// Model configurations
const MODELS = {
    GRAMMAR_CORRECTION: 'grammarly/coedit-large',
    SUMMARIZATION: 'facebook/bart-large-cnn',
    TEXT_GENERATION: 'google/flan-t5-large',
    ZERO_SHOT_CLASSIFICATION: 'facebook/bart-large-mnli',
    PARAPHRASE: 'tuner007/pegasus_paraphrase',
};

/**
 * Make a request to Hugging Face API
 */
const queryHuggingFace = async (model, payload, retries = 3) => {
    try {
        const response = await axios.post(
            `${HUGGINGFACE_API_URL}/${model}`,
            payload,
            {
                headers: {
                    Authorization: `Bearer ${HUGGINGFACE_API_KEY}`,
                    'Content-Type': 'application/json',
                },
                timeout: 30000, // 30 seconds timeout
            }
        );

        // If model is loading, wait and retry
        if (response.data.error && response.data.error.includes('loading')) {
            if (retries > 0) {
                logger.info(`Model ${model} is loading, retrying in 10 seconds...`);
                await new Promise(resolve => setTimeout(resolve, 10000));
                return queryHuggingFace(model, payload, retries - 1);
            }
            throw new Error('Model is still loading. Please try again in a few moments.');
        }

        return response.data;
    } catch (error) {
        logger.error(`Hugging Face API error for model ${model}:`, error.message);

        if (error.response?.data?.error) {
            throw new Error(error.response.data.error);
        }

        throw new Error('AI service is temporarily unavailable. Please try again.');
    }
};

/**
 * Correct grammar and spelling in text
 */
const correctGrammar = async (text) => {
    try {
        if (!text || text.trim().length === 0) {
            throw new Error('Text is required for grammar correction');
        }

        // For grammar correction, we'll use a text-to-text generation model
        const prompt = `Fix grammar and spelling errors in the following text, keep the same meaning and tone:\n\n${text}`;

        const result = await queryHuggingFace(MODELS.TEXT_GENERATION, {
            inputs: prompt,
            parameters: {
                max_length: text.length + 100,
                temperature: 0.3,
                do_sample: false,
            },
        });

        const correctedText = Array.isArray(result)
            ? result[0]?.generated_text || text
            : result.generated_text || text;

        return {
            original: text,
            corrected: correctedText.replace(prompt, '').trim(),
            changes: correctedText !== text,
        };
    } catch (error) {
        logger.error('Grammar correction error:', error.message);
        throw error;
    }
};

/**
 * Summarize long text into key points
 */
const summarizeText = async (text, maxLength = 150) => {
    try {
        if (!text || text.trim().length === 0) {
            throw new Error('Text is required for summarization');
        }

        if (text.length < 100) {
            throw new Error('Text is too short to summarize (minimum 100 characters)');
        }

        const result = await queryHuggingFace(MODELS.SUMMARIZATION, {
            inputs: text,
            parameters: {
                max_length: maxLength,
                min_length: 30,
                do_sample: false,
            },
        });

        const summary = Array.isArray(result)
            ? result[0]?.summary_text || ''
            : result.summary_text || '';

        return {
            original: text,
            summary,
            compressionRatio: ((1 - summary.length / text.length) * 100).toFixed(1),
        };
    } catch (error) {
        logger.error('Summarization error:', error.message);
        throw error;
    }
};

/**
 * Generate content from user context/brief
 */
const generateContent = async (context, options = {}) => {
    try {
        if (!context || context.trim().length === 0) {
            throw new Error('Context is required for content generation');
        }

        const {
            style = 'professional',
            length = 'medium',
            tone = 'neutral',
        } = options;

        // Create detailed prompt based on options
        let prompt = 'Write a detailed note';

        if (style === 'professional') {
            prompt += ' in a professional and clear manner';
        } else if (style === 'casual') {
            prompt += ' in a casual and friendly manner';
        } else if (style === 'academic') {
            prompt += ' in an academic and formal manner';
        }

        if (tone === 'positive') {
            prompt += ' with a positive tone';
        } else if (tone === 'neutral') {
            prompt += ' with a balanced tone';
        }

        prompt += ` based on the following information:\n\n${context}\n\nNote:`;

        const result = await queryHuggingFace(MODELS.TEXT_GENERATION, {
            inputs: prompt,
            parameters: {
                max_length: length === 'short' ? 150 : length === 'medium' ? 300 : 500,
                temperature: 0.7,
                do_sample: true,
                top_p: 0.9,
            },
        });

        let generatedContent = Array.isArray(result)
            ? result[0]?.generated_text || ''
            : result.generated_text || '';

        // Clean up the generated content
        generatedContent = generatedContent.replace(prompt, '').trim();

        return {
            context,
            generated: generatedContent,
            style,
            tone,
        };
    } catch (error) {
        logger.error('Content generation error:', error.message);
        throw error;
    }
};

/**
 * Suggest tags based on note content
 */
const suggestTags = async (text, maxTags = 5) => {
    try {
        if (!text || text.trim().length === 0) {
            throw new Error('Text is required for tag suggestions');
        }

        // Define common tag categories for notes
        const candidateLabels = [
            'work', 'personal', 'ideas', 'todo', 'meeting',
            'project', 'research', 'learning', 'finance', 'health',
            'travel', 'food', 'technology', 'business', 'creative',
            'important', 'urgent', 'planning', 'goals', 'notes'
        ];

        const result = await queryHuggingFace(MODELS.ZERO_SHOT_CLASSIFICATION, {
            inputs: text,
            parameters: {
                candidate_labels: candidateLabels,
                multi_label: true,
            },
        });

        // Get top tags with scores above threshold
        const tags = [];
        const threshold = 0.3; // Only suggest tags with >30% confidence

        if (result.labels && result.scores) {
            for (let i = 0; i < Math.min(maxTags, result.labels.length); i++) {
                if (result.scores[i] >= threshold) {
                    tags.push({
                        tag: result.labels[i],
                        confidence: (result.scores[i] * 100).toFixed(1),
                    });
                }
            }
        }

        // Also extract keywords from the text
        const words = text.toLowerCase().match(/\b\w+\b/g) || [];
        const wordFreq = {};

        words.forEach(word => {
            if (word.length > 4) { // Only consider words longer than 4 chars
                wordFreq[word] = (wordFreq[word] || 0) + 1;
            }
        });

        // Get top keywords
        const keywords = Object.entries(wordFreq)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([word]) => ({ tag: word, confidence: 'keyword' }));

        return {
            suggestedTags: tags,
            keywords: keywords.map(k => k.tag),
            allSuggestions: [...tags, ...keywords].slice(0, maxTags),
        };
    } catch (error) {
        logger.error('Tag suggestion error:', error.message);
        throw error;
    }
};

/**
 * Enhance content - make it more detailed and professional
 */
const enhanceContent = async (text, style = 'professional') => {
    try {
        if (!text || text.trim().length === 0) {
            throw new Error('Text is required for content enhancement');
        }

        let prompt = '';

        if (style === 'professional') {
            prompt = `Rewrite the following text to make it more professional, detailed, and well-structured while keeping the same meaning:\n\n${text}\n\nEnhanced version:`;
        } else if (style === 'casual') {
            prompt = `Rewrite the following text to make it more casual, friendly, and easy to read:\n\n${text}\n\nCasual version:`;
        } else if (style === 'concise') {
            prompt = `Rewrite the following text to make it more concise and to the point:\n\n${text}\n\nConcise version:`;
        } else {
            prompt = `Improve and enhance the following text:\n\n${text}\n\nImproved version:`;
        }

        const result = await queryHuggingFace(MODELS.TEXT_GENERATION, {
            inputs: prompt,
            parameters: {
                max_length: text.length + 200,
                temperature: 0.7,
                do_sample: true,
            },
        });

        let enhanced = Array.isArray(result)
            ? result[0]?.generated_text || ''
            : result.generated_text || '';

        enhanced = enhanced.replace(prompt, '').trim();

        return {
            original: text,
            enhanced,
            style,
        };
    } catch (error) {
        logger.error('Content enhancement error:', error.message);
        throw error;
    }
};

/**
 * Adjust tone of text
 */
const adjustTone = async (text, targetTone = 'professional') => {
    try {
        if (!text || text.trim().length === 0) {
            throw new Error('Text is required for tone adjustment');
        }

        let prompt = '';

        switch (targetTone) {
            case 'professional':
                prompt = `Rewrite in a professional tone: ${text}`;
                break;
            case 'casual':
                prompt = `Rewrite in a casual and friendly tone: ${text}`;
                break;
            case 'formal':
                prompt = `Rewrite in a formal tone: ${text}`;
                break;
            case 'enthusiastic':
                prompt = `Rewrite with enthusiasm and energy: ${text}`;
                break;
            default:
                prompt = `Rewrite this text: ${text}`;
        }

        const result = await queryHuggingFace(MODELS.TEXT_GENERATION, {
            inputs: prompt,
            parameters: {
                max_length: text.length + 100,
                temperature: 0.6,
                do_sample: true,
            },
        });

        let adjusted = Array.isArray(result)
            ? result[0]?.generated_text || ''
            : result.generated_text || '';

        adjusted = adjusted.replace(prompt, '').trim();

        return {
            original: text,
            adjusted,
            tone: targetTone,
        };
    } catch (error) {
        logger.error('Tone adjustment error:', error.message);
        throw error;
    }
};

/**
 * Auto-save suggestions - analyze text and provide real-time suggestions
 */
const getAutoSaveSuggestions = async (text) => {
    try {
        if (!text || text.trim().length === 0) {
            return {
                hasSuggestions: false,
                suggestions: [],
            };
        }

        const suggestions = [];

        // Check text length for summarization suggestion
        if (text.length > 500) {
            suggestions.push({
                type: 'summarize',
                title: 'Long note detected',
                description: 'Would you like to create a summary?',
                action: 'summarize',
            });
        }

        // Check for potential grammar issues (simple heuristics)
        const commonErrors = [
            { pattern: /\bi\b/g, suggestion: 'Consider capitalizing "I"' },
            { pattern: /\s{2,}/g, suggestion: 'Multiple spaces detected' },
            { pattern: /[.!?]{2,}/g, suggestion: 'Multiple punctuation marks' },
        ];

        for (const error of commonErrors) {
            if (error.pattern.test(text)) {
                suggestions.push({
                    type: 'grammar',
                    title: 'Potential grammar issue',
                    description: error.suggestion,
                    action: 'fix-grammar',
                });
                break; // Only show one grammar suggestion
            }
        }

        // Suggest tags if note is substantial
        if (text.length > 100 && !suggestions.find(s => s.type === 'tags')) {
            suggestions.push({
                type: 'tags',
                title: 'Add tags to organize',
                description: 'AI can suggest relevant tags for this note',
                action: 'suggest-tags',
            });
        }

        // Suggest enhancement if text seems brief
        if (text.length > 50 && text.length < 200) {
            suggestions.push({
                type: 'enhance',
                title: 'Enhance your note',
                description: 'AI can help expand and improve your content',
                action: 'enhance-content',
            });
        }

        return {
            hasSuggestions: suggestions.length > 0,
            suggestions: suggestions.slice(0, 3), // Limit to 3 suggestions
        };
    } catch (error) {
        logger.error('Auto-save suggestions error:', error.message);
        return {
            hasSuggestions: false,
            suggestions: [],
        };
    }
};

module.exports = {
    correctGrammar,
    summarizeText,
    generateContent,
    suggestTags,
    enhanceContent,
    adjustTone,
    getAutoSaveSuggestions,
};
