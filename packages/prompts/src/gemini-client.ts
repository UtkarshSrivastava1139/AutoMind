/**
 * Google Gemini API Client for AutoMind
 *
 * Handles LLM calls via Google Generative Language API (Gemini) with support
 * for structured JSON outputs, system instructions, retry with exponential backoff,
 * timeout handling, and latency tracking.
 */

import type { ChatMessage, ChatOptions, ChatResult, ChatResponseMeta, AIClient } from './ai-client';

// ── Types ──────────────────────────────────────────────────────

export interface GeminiConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
  timeoutMs: number;
  maxRetries: number;
  retryDelayMs: number;
}

// ── Default config from environment ────────────────────────────

function getDefaultGeminiConfig(): GeminiConfig {
  const apiKey =
    (typeof process !== 'undefined'
      ? process.env.GEMINI_API_KEY ||
        process.env.GOOGLE_AI_API_KEY ||
        process.env.GOOGLE_API_KEY
      : '') || '';

  const baseUrl =
    (typeof process !== 'undefined'
      ? process.env.GEMINI_BASE_URL || 'https://generativelanguage.googleapis.com/v1beta'
      : '') || 'https://generativelanguage.googleapis.com/v1beta';

  const model =
    (typeof process !== 'undefined'
      ? process.env.GEMINI_MODEL || 'gemini-2.0-flash'
      : '') || 'gemini-2.0-flash';

  return {
    apiKey,
    baseUrl,
    model,
    timeoutMs: parseInt(process?.env?.GEMINI_TIMEOUT_MS || '30000', 10),
    maxRetries: 2,
    retryDelayMs: 1000,
  };
}

// ── Client ─────────────────────────────────────────────────────

export class GeminiClient implements AIClient {
  private config: GeminiConfig;

  constructor(config?: Partial<GeminiConfig>) {
    const defaults = getDefaultGeminiConfig();
    this.config = { ...defaults, ...config };
  }

  /**
   * Send a chat/generation request to Google Gemini API.
   */
  async chat(messages: ChatMessage[], options: ChatOptions = {}): Promise<ChatResult> {
    const startTime = Date.now();

    if (!this.config.apiKey || this.config.apiKey.trim() === '') {
      return {
        success: false,
        error:
          'Missing Google Gemini API Key. Please configure the GEMINI_API_KEY or GOOGLE_AI_API_KEY environment variable.',
        meta: { latencyMs: Date.now() - startTime },
      };
    }

    // Separate system messages from user/assistant messages
    const systemMessages = messages.filter((m) => m.role === 'system');
    const conversationMessages = messages.filter((m) => m.role !== 'system');

    // Build Gemini contents array
    const contents = conversationMessages.map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    // If no conversation messages, use a dummy user prompt
    if (contents.length === 0 && systemMessages.length > 0) {
      contents.push({
        role: 'user',
        parts: [{ text: 'Please proceed based on your system instructions.' }],
      });
    }

    // Prepare request body
    const body: Record<string, unknown> = {
      contents,
      generationConfig: {
        temperature: options.temperature ?? 0.2,
        ...(options.maxTokens ? { maxOutputTokens: options.maxTokens } : {}),
        ...(options.jsonMode ? { responseMimeType: 'application/json' } : {}),
      },
    };

    // System instruction (supported in Gemini 1.5/2.0 API)
    if (systemMessages.length > 0) {
      body.systemInstruction = {
        parts: [{ text: systemMessages.map((m) => m.content).join('\n\n') }],
      };
    }

    let lastError = '';

    for (let attempt = 0; attempt <= this.config.maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), this.config.timeoutMs);

        const url = `${this.config.baseUrl}/models/${encodeURIComponent(this.config.model)}:generateContent?key=${encodeURIComponent(this.config.apiKey)}`;

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
          signal: controller.signal,
        });

        clearTimeout(timeout);

        if (!response.ok) {
          const errorBody = await response.text().catch(() => '');
          lastError = `HTTP ${response.status}: ${errorBody.slice(0, 300)}`;

          // Rate limit — backoff and retry
          if (response.status === 429) {
            const retryAfter = parseInt(response.headers.get('retry-after') || '5', 10);
            await this.delay(retryAfter * 1000);
            continue;
          }

          // Server errors — retry
          if (response.status >= 500) {
            await this.delay(this.config.retryDelayMs * Math.pow(2, attempt));
            continue;
          }

          // Client errors (400, 401, 403, 404) — do not retry
          return {
            success: false,
            error: lastError,
            meta: { latencyMs: Date.now() - startTime, model: this.config.model },
          };
        }

        const data = await response.json();
        const latencyMs = Date.now() - startTime;

        const candidate = data.candidates?.[0];
        const contentPart = candidate?.content?.parts?.[0]?.text;

        if (!contentPart) {
          const finishReason = candidate?.finishReason || 'Unknown';
          lastError = `Empty response from Gemini model (Finish reason: ${finishReason})`;
          continue;
        }

        const meta: ChatResponseMeta = {
          model: this.config.model,
          latencyMs,
          inputTokens: data.usageMetadata?.promptTokenCount,
          outputTokens: data.usageMetadata?.candidatesTokenCount,
        };

        console.log(
          `[Gemini] model=${meta.model} latency=${meta.latencyMs}ms tokens=${meta.inputTokens || '?'}/${meta.outputTokens || '?'} attempt=${attempt + 1}`
        );

        return {
          success: true,
          content: contentPart,
          meta,
        };
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);

        if (message.includes('abort') || message.includes('AbortError')) {
          lastError = `Timeout after ${this.config.timeoutMs}ms`;
        } else {
          lastError = message;
        }

        // Retry with backoff
        if (attempt < this.config.maxRetries) {
          await this.delay(this.config.retryDelayMs * Math.pow(2, attempt));
        }
      }
    }

    return {
      success: false,
      error: `All ${this.config.maxRetries + 1} attempts failed. Last error: ${lastError}`,
      meta: { latencyMs: Date.now() - startTime, model: this.config.model },
    };
  }

  /**
   * Parse a JSON string from LLM output, handling markdown fences and whitespace.
   */
  static parseJSON<T>(raw: string): { success: true; data: T } | { success: false; error: string } {
    let cleaned = raw.trim();

    // Strip markdown code fences if present
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

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
