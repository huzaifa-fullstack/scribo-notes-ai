// AI Service Types

export interface AIResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface GrammarCorrectionResult {
  original: string;
  corrected: string;
  changes: boolean;
}

export interface SummarizationResult {
  original: string;
  summary: string;
  compressionRatio: string;
}

export interface ContentGenerationResult {
  context: string;
  generated: string;
  style: string;
  tone: string;
}

export interface TagSuggestion {
  tag: string;
  confidence: string | number;
}

export interface TagSuggestionsResult {
  suggestedTags: TagSuggestion[];
  keywords: string[];
  allSuggestions: TagSuggestion[];
}

export interface ContentEnhancementResult {
  original: string;
  enhanced: string;
  style: string;
}

export interface ToneAdjustmentResult {
  original: string;
  adjusted: string;
  tone: string;
}

export interface AutoSuggestion {
  type: "summarize" | "grammar" | "tags" | "enhance";
  title: string;
  description: string;
  action: string;
}

export interface AutoSuggestionsResult {
  hasSuggestions: boolean;
  suggestions: AutoSuggestion[];
}

export interface BatchProcessingResult {
  grammar?: GrammarCorrectionResult;
  summary?: SummarizationResult;
  tags?: TagSuggestionsResult;
  enhanced?: ContentEnhancementResult;
  [key: string]: any;
}

// Request types
export interface GenerateContentRequest {
  context: string;
  style?: "professional" | "casual" | "academic";
  length?: "short" | "medium" | "long";
  tone?: "neutral" | "positive";
}

export interface SummarizeRequest {
  text: string;
  maxLength?: number;
}

export interface SuggestTagsRequest {
  text: string;
  maxTags?: number;
}

export interface EnhanceContentRequest {
  text: string;
  style?: "professional" | "casual" | "concise";
}

export interface AdjustToneRequest {
  text: string;
  tone: "professional" | "casual" | "formal" | "enthusiastic";
}

export interface BatchProcessRequest {
  text: string;
  actions: string[];
}

// AI Action types for UI
export type AIActionType =
  | "fix-grammar"
  | "summarize"
  | "generate"
  | "suggest-tags"
  | "enhance"
  | "adjust-tone";

export interface AIAction {
  id: AIActionType;
  label: string;
  icon: string;
  description: string;
  requiresSelection?: boolean;
}
