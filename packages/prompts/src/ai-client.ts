/**
 * AutoMind AI Client Interface and Provider Factory
 *
 * Provides a unified abstraction over LLM providers (Google Gemini, OpenRouter)
 * with auto-detection from environment variables, fallback capabilities,
 * and unified response/JSON parsing.
 */

import { GeminiClient, GeminiConfig } from './gemini-client';
import { OpenRouterClient, OpenRouterConfig } from './openrouter-client';

// ── Shared Types ───────────────────────────────────────────────

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatOptions {
  jsonMode?: boolean;
  temperature?: number;
  maxTokens?: number;
}

export interface ChatResponseMeta {
  model: string;
  latencyMs: number;
  inputTokens?: number;
  outputTokens?: number;
  totalCost?: number;
}

export type ChatResult =
  | { success: true; content: string; meta: ChatResponseMeta }
  | { success: false; error: string; meta: Partial<ChatResponseMeta> };

export interface AIClient {
  chat(messages: ChatMessage[], options?: ChatOptions): Promise<ChatResult>;
}

// ── Multi-provider Fallback Client ─────────────────────────────

export class FallbackAIClient implements AIClient {
  private primary: AIClient;
  private fallback: AIClient;

  constructor(primary: AIClient, fallback: AIClient) {
    this.primary = primary;
    this.fallback = fallback;
  }

  async chat(messages: ChatMessage[], options?: ChatOptions): Promise<ChatResult> {
    const primaryResult = await this.primary.chat(messages, options);
    if (primaryResult.success) {
      return primaryResult;
    }

    console.warn(`[AIClient] Primary provider failed (${primaryResult.error}). Attempting fallback provider...`);
    const fallbackResult = await this.fallback.chat(messages, options);
    return fallbackResult;
  }
}

// ── Provider Factory ───────────────────────────────────────────

export interface ClientFactoryOptions {
  provider?: 'gemini' | 'openrouter' | 'auto';
  geminiConfig?: Partial<GeminiConfig>;
  openrouterConfig?: Partial<OpenRouterConfig>;
  enableFallback?: boolean;
}

/**
 * Returns a configured AI client instance based on available environment variables
 * or explicit options.
 *
 * Priority order for auto-detection:
 * 1. AI_PROVIDER env var ('gemini' | 'openrouter')
 * 2. GEMINI_API_KEY / GOOGLE_AI_API_KEY / GOOGLE_API_KEY (if present)
 * 3. OPENROUTER_API_KEY (if present)
 * 4. GeminiClient (default)
 */
export function getAIClient(options?: ClientFactoryOptions): AIClient {
  const envProvider =
    (typeof process !== 'undefined' ? process.env.AI_PROVIDER?.toLowerCase() : '') || '';

  const geminiKey =
    (typeof process !== 'undefined'
      ? process.env.GEMINI_API_KEY ||
        process.env.GOOGLE_AI_API_KEY ||
        process.env.GOOGLE_API_KEY
      : '') || '';

  const openrouterKey =
    (typeof process !== 'undefined' ? process.env.OPENROUTER_API_KEY : '') || '';

  const requestedProvider = options?.provider || envProvider || 'auto';

  // Explicit Gemini
  if (requestedProvider === 'gemini') {
    const gemini = new GeminiClient(options?.geminiConfig);
    if (options?.enableFallback && openrouterKey) {
      return new FallbackAIClient(gemini, new OpenRouterClient(options?.openrouterConfig));
    }
    return gemini;
  }

  // Explicit OpenRouter
  if (requestedProvider === 'openrouter') {
    const openrouter = new OpenRouterClient(options?.openrouterConfig);
    if (options?.enableFallback && geminiKey) {
      return new FallbackAIClient(openrouter, new GeminiClient(options?.geminiConfig));
    }
    return openrouter;
  }

  // Auto mode: Check configured keys
  if (geminiKey) {
    const gemini = new GeminiClient(options?.geminiConfig);
    if (openrouterKey) {
      // Both keys configured: use Gemini with OpenRouter fallback
      return new FallbackAIClient(gemini, new OpenRouterClient(options?.openrouterConfig));
    }
    return gemini;
  }

  if (openrouterKey) {
    return new OpenRouterClient(options?.openrouterConfig);
  }

  // Default to Gemini client (will return helpful error if key is missing)
  return new GeminiClient(options?.geminiConfig);
}

export const createAIClient = getAIClient;

// ── JSON Parser Helper ─────────────────────────────────────────

/**
 * Universal JSON parser that cleans Markdown code fences (```json ... ```)
 */
export function parseAIJSON<T>(raw: string): { success: true; data: T } | { success: false; error: string } {
  let cleaned = raw.trim();

  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '').trim();
  }

  try {
    const data = JSON.parse(cleaned) as T;
    return { success: true, data };
  } catch (err) {
    return {
      success: false,
      error: `JSON parse failed: ${err instanceof Error ? err.message : String(err)}. Raw (first 200 chars): ${raw.slice(0, 200)}`,
    };
  }
}
