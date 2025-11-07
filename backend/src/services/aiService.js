const axios = require('axios');
const logger = require('../config/logger');

// Hugging Face API Configuration
const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY;
const HUGGINGFACE_CHAT_API = 'https://router.huggingface.co/v1/chat/completions';

// Check if API key is configured
if (!HUGGINGFACE_API_KEY) {
    logger.error('HUGGINGFACE_API_KEY is not configured in environment variables');
}

// Free models available (fast and good quality)
const MODELS = {
    // Using Meta's Llama 3.2 - Great for text generation, grammar, and writing tasks
    CHAT_MODEL: 'meta-llama/Llama-3.2-3B-Instruct',
    // Alternative options (uncomment to try):
    // CHAT_MODEL: 'Qwen/Qwen2.5-Coder-32B-Instruct', // Qwen (excellent for text)
    // CHAT_MODEL: 'mistralai/Mixtral-8x7B-Instruct-v0.1', // Mistral AI (very good)
    // CHAT_MODEL: 'microsoft/Phi-3-mini-4k-instruct', // Microsoft Phi-3 (fast)
};

/**
 * Make a chat completion request (for text generation tasks)
 */
const queryChatCompletion = async (prompt, systemMessage = 'You are a helpful AI assistant for note-taking.', maxTokens = 500) => {
    if (!HUGGINGFACE_API_KEY) {
        throw new Error('Hugging Face API key is not configured. Please set HUGGINGFACE_API_KEY in your .env file.');
    }

    try {
        logger.info(`Querying chat model: ${MODELS.CHAT_MODEL}`);

        const response = await axios.post(
            HUGGINGFACE_CHAT_API,
            {
                model: MODELS.CHAT_MODEL,
                messages: [
                    { role: 'system', content: systemMessage },
                    { role: 'user', content: prompt }
                ],
                max_tokens: maxTokens,
                temperature: 0.7,
            },
            {
                headers: {
                    Authorization: `Bearer ${HUGGINGFACE_API_KEY}`,
                    'Content-Type': 'application/json',
                },
                timeout: 30000,
            }
        );

        let content = response.data.choices[0]?.message?.content || '';

        // Clean up markdown formatting that AI models sometimes add
        content = content
            .replace(/^\*\*(.+?)\*\*$/gm, '$1') // Remove bold markers at line start/end
            .replace(/\*\*(.+?)\*\*/g, '$1') // Remove bold markers
            .replace(/\*(.+?)\*/g, '$1') // Remove italic markers
            .replace(/^#+\s+/gm, '') // Remove markdown headers
            .replace(/^[-*]\s+/gm, '') // Remove bullet points
            .trim();

        logger.info(`Successfully got chat completion`);
        return content;
    } catch (error) {
        console.error('Chat completion error:', error.message);
        console.error('Error response:', error.response?.data);

        logger.error('Chat completion error:', {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data,
        });

        if (error.response?.status === 401) {
            throw new Error('Invalid Hugging Face API key.');
        }
        if (error.response?.status === 429) {
            throw new Error('Rate limit exceeded. Please try again later.');
        }
        throw new Error(`AI service error: ${error.message}`);
    }
};

/**
 * Make a request to Hugging Face Inference API (for specific models like BART)
 */
const queryHuggingFaceInference = async (model, payload, retries = 3) => {
    if (!HUGGINGFACE_API_KEY) {
        throw new Error('Hugging Face API key is not configured. Please set HUGGINGFACE_API_KEY in your .env file.');
    }

    try {
        logger.info(`Querying Hugging Face model: ${model}`);

        const response = await axios.post(
            `https://router.huggingface.co/hf-inference/models/${model}`,
            payload,
            {
                headers: {
                    Authorization: `Bearer ${HUGGINGFACE_API_KEY}`,
                    'Content-Type': 'application/json',
                },
                timeout: 30000,
            }
        );

        if (response.data.error && response.data.error.includes('loading')) {
            if (retries > 0) {
                logger.info(`Model ${model} is loading, retrying in 10 seconds...`);
                await new Promise(resolve => setTimeout(resolve, 10000));
                return queryHuggingFaceInference(model, payload, retries - 1);
            }
            throw new Error('Model is still loading. Please try again later.');
        }

        logger.info(`Successfully queried model: ${model}`);
        return response.data;
    } catch (error) {
        logger.error(`Hugging Face API error for model ${model}:`, {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data,
        });

        if (error.response?.data?.error) {
            throw new Error(error.response.data.error);
        }
        if (error.response?.status === 401) {
            throw new Error('Invalid Hugging Face API key.');
        }
        if (error.response?.status === 429) {
            throw new Error('Rate limit exceeded. Please try again later.');
        }
        throw new Error(`AI service error: ${error.message}`);
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

        const prompt = `Fix any grammar and spelling errors in the following text. Return ONLY the corrected text, nothing else:\n\n${text}`;
        const correctedText = await queryChatCompletion(
            prompt,
            'You are an expert grammar and spelling checker. Fix errors while keeping the original meaning and tone.',
            Math.max(text.length + 100, 200)
        );

        return {
            original: text,
            corrected: correctedText,
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

        // Count words for better validation
        const wordCount = text.trim().split(/\s+/).length;

        if (text.length < 100) {
            throw new Error(`Text is too short to summarize. Please provide at least 100 characters (minimum 20 words). Current: ${wordCount} words`);
        }

        if (wordCount < 20) {
            throw new Error(`Text is too short to summarize. Please provide at least 20 words. Current: ${wordCount} words`);
        }

        const prompt = `Summarize the following text in a concise way (around ${maxLength} words):\n\n${text}\n\nSummary:`;

        const summary = await queryChatCompletion(
            prompt,
            'You are an expert at creating concise, informative summaries.',
            maxLength + 50
        );

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

        // Create a detailed prompt based on user preferences
        let styleGuide = '';
        if (style === 'professional') styleGuide = 'professional and clear';
        else if (style === 'casual') styleGuide = 'casual and friendly';
        else if (style === 'academic') styleGuide = 'academic and formal';
        else styleGuide = style;

        let lengthGuide = '';
        if (length === 'short') lengthGuide = 'brief (2-3 paragraphs)';
        else if (length === 'medium') lengthGuide = 'moderate length (4-5 paragraphs)';
        else lengthGuide = 'detailed and comprehensive (6-8 paragraphs)';

        const prompt = `Write a ${lengthGuide} note in a ${styleGuide} style with a ${tone} tone about the following topic:\n\n${context}\n\nWrite the note content:`;

        const generatedContent = await queryChatCompletion(
            prompt,
            'You are an expert note-taking assistant. Generate well-structured, informative notes based on user requests.',
            length === 'short' ? 200 : length === 'medium' ? 400 : 600
        );

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

        // Use AI to suggest relevant tags
        const prompt = `Based on the following note content, suggest ${maxTags} relevant tags/keywords that categorize this note. Return ONLY the tags as a comma-separated list, nothing else:\n\n${text.substring(0, 500)}\n\nTags:`;

        const response = await queryChatCompletion(
            prompt,
            'You are an expert at categorizing and tagging content. Suggest short, relevant tags.',
            100
        );

        // Parse the AI response to extract tags
        const suggestedTags = response
            .split(',')
            .map(tag => tag.trim().toLowerCase())
            .filter(tag => tag.length > 0 && tag.length < 20)
            .slice(0, maxTags)
            .map(tag => ({
                tag: tag,
                confidence: '95.0', // AI-suggested tags are high confidence
            }));

        // Also extract keywords from the text as backup
        const words = text.toLowerCase().match(/\b\w+\b/g) || [];
        const wordFreq = {};

        words.forEach(word => {
            if (word.length > 4) {
                wordFreq[word] = (wordFreq[word] || 0) + 1;
            }
        });

        const keywords = Object.entries(wordFreq)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([word]) => word);

        return {
            suggestedTags: suggestedTags,
            keywords: keywords,
            allSuggestions: suggestedTags,
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

        let styleInstruction = '';
        if (style === 'professional') {
            styleInstruction = 'Make it more professional, well-structured, and detailed';
        } else if (style === 'casual') {
            styleInstruction = 'Make it more casual, friendly, and easy to read';
        } else if (style === 'concise') {
            styleInstruction = 'Make it more concise and to the point';
        } else {
            styleInstruction = 'Improve and enhance it';
        }

        const prompt = `${styleInstruction}. Keep the same core message:\n\n${text}\n\nEnhanced version:`;

        const enhanced = await queryChatCompletion(
            prompt,
            'You are an expert writer who enhances and improves text while keeping its original meaning.',
            Math.max(text.length + 200, 300)
        );

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

        let toneInstruction = '';
        switch (targetTone) {
            case 'professional':
                toneInstruction = 'Rewrite in a professional and business-appropriate tone';
                break;
            case 'casual':
                toneInstruction = 'Rewrite in a casual, friendly, and conversational tone';
                break;
            case 'formal':
                toneInstruction = 'Rewrite in a formal and academic tone';
                break;
            case 'enthusiastic':
                toneInstruction = 'Rewrite with enthusiasm, energy, and excitement';
                break;
            default:
                toneInstruction = `Rewrite in a ${targetTone} tone`;
        }

        const prompt = `${toneInstruction}. Keep the same core message:\n\n${text}\n\nRewritten text:`;

        const adjusted = await queryChatCompletion(
            prompt,
            'You are an expert writer who can adjust the tone of text while preserving its meaning.',
            Math.max(text.length + 100, 200)
        );

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
