import api from "./api";
import type {
  AIResponse,
  GrammarCorrectionResult,
  SummarizationResult,
  ContentGenerationResult,
  TagSuggestionsResult,
  ContentEnhancementResult,
  ToneAdjustmentResult,
  AutoSuggestionsResult,
  BatchProcessingResult,
  GenerateContentRequest,
  SummarizeRequest,
  SuggestTagsRequest,
  EnhanceContentRequest,
  AdjustToneRequest,
  BatchProcessRequest,
} from "../types/ai";

/**
 * AI Service
 * Handles all AI-related API calls to the backend
 */

/**
 * Correct grammar and spelling in text
 */
export const correctGrammar = async (
  text: string
): Promise<GrammarCorrectionResult> => {
  const response = await api.post<AIResponse<GrammarCorrectionResult>>(
    "/ai/correct-grammar",
    { text }
  );
  return response.data.data;
};

/**
 * Summarize text into key points
 */
export const summarizeText = async (
  request: SummarizeRequest
): Promise<SummarizationResult> => {
  const response = await api.post<AIResponse<SummarizationResult>>(
    "/ai/summarize",
    request
  );
  return response.data.data;
};

/**
 * Generate content from user context/brief
 */
export const generateContent = async (
  request: GenerateContentRequest
): Promise<ContentGenerationResult> => {
  const response = await api.post<AIResponse<ContentGenerationResult>>(
    "/ai/generate-content",
    request
  );
  return response.data.data;
};

/**
 * Suggest tags based on note content
 */
export const suggestTags = async (
  request: SuggestTagsRequest
): Promise<TagSuggestionsResult> => {
  const response = await api.post<AIResponse<TagSuggestionsResult>>(
    "/ai/suggest-tags",
    request
  );
  return response.data.data;
};

/**
 * Enhance content - make it more detailed and professional
 */
export const enhanceContent = async (
  request: EnhanceContentRequest
): Promise<ContentEnhancementResult> => {
  const response = await api.post<AIResponse<ContentEnhancementResult>>(
    "/ai/enhance-content",
    request
  );
  return response.data.data;
};

/**
 * Adjust tone of text
 */
export const adjustTone = async (
  request: AdjustToneRequest
): Promise<ToneAdjustmentResult> => {
  const response = await api.post<AIResponse<ToneAdjustmentResult>>(
    "/ai/adjust-tone",
    request
  );
  return response.data.data;
};

/**
 * Get auto-save suggestions
 */
export const getAutoSuggestions = async (
  text: string
): Promise<AutoSuggestionsResult> => {
  const response = await api.post<AIResponse<AutoSuggestionsResult>>(
    "/ai/auto-suggestions",
    { text }
  );
  return response.data.data;
};

/**
 * Process multiple AI actions in batch
 */
export const batchProcess = async (
  request: BatchProcessRequest
): Promise<BatchProcessingResult> => {
  const response = await api.post<AIResponse<BatchProcessingResult>>(
    "/ai/batch",
    request
  );
  return response.data.data;
};

export default {
  correctGrammar,
  summarizeText,
  generateContent,
  suggestTags,
  enhanceContent,
  adjustTone,
  getAutoSuggestions,
  batchProcess,
};
