/**
 * OpenRouter API Client for AutoMind
 *
 * Handles LLM calls via OpenRouter with model fallback, timeout, retry,
 * and structured JSON output support.
 */

// ── Types ──────────────────────────────────────────────────────

export interface OpenRouterConfig {
  apiKey: string;
  baseUrl: string;
  primaryModel: string;
  fallbackModels: string[];
  timeoutMs: number;
  maxRetries: number;
  retryDelayMs: number;
}

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

// ── Default config from environment ────────────────────────────

function getDefaultConfig(): OpenRouterConfig {
  const apiKey = typeof process !== 'undefined' ? process.env.OPENROUTER_API_KEY || '' : '';
  const baseUrl = typeof process !== 'undefined'
    ? process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1'
    : 'https://openrouter.ai/api/v1';
  const primaryModel = typeof process !== 'undefined'
    ? process.env.OPENROUTER_PRIMARY_MODEL || 'inclusionai/ring-2.6-1t:free'
    : 'inclusionai/ring-2.6-1t:free';
  const fallbackModelsRaw = typeof process !== 'undefined'
    ? process.env.OPENROUTER_FALLBACK_MODELS || ''
    : '';
  const fallbackModels = fallbackModelsRaw
    ? fallbackModelsRaw.split(',').map((m) => m.trim()).filter(Boolean)
    : [
        'nvidia/nemotron-3-super-120b-a12b:free',
        'openrouter/owl-alpha',
        'google/gemma-4-31b-it:free',
      ];

  return {
    apiKey,
    baseUrl,
    primaryModel,
    fallbackModels,
    timeoutMs: parseInt(process?.env?.OPENROUTER_TIMEOUT_MS || '30000', 10),
    maxRetries: 2,
    retryDelayMs: 1000,
  };
}

// ── Client ─────────────────────────────────────────────────────

export class OpenRouterClient {
  private config: OpenRouterConfig;

  constructor(config?: Partial<OpenRouterConfig>) {
    const defaults = getDefaultConfig();
    this.config = { ...defaults, ...config };
  }

  /**
   * Send a chat completion request to OpenRouter.
   * Handles timeout, retry, and model fallback automatically.
   */
  async chat(messages: ChatMessage[], options: ChatOptions = {}): Promise<ChatResult> {
    const startTime = Date.now();

    const body: Record<string, unknown> = {
      model: this.config.primaryModel,
      messages,
      temperature: options.temperature ?? 0.2,
    };

    // Add fallback models if available (OpenRouter limit: max 3 models in the array)
    if (this.config.fallbackModels.length > 0) {
      body.models = [this.config.primaryModel, ...this.config.fallbackModels].slice(0, 3);
    }

    // Request structured JSON output when possible
    if (options.jsonMode) {
      body.response_format = { type: 'json_object' };
    }

    if (options.maxTokens) {
      body.max_tokens = options.maxTokens;
    }

    let lastError = '';

    for (let attempt = 0; attempt <= this.config.maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), this.config.timeoutMs);

        const response = await fetch(`${this.config.baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.config.apiKey}`,
            'HTTP-Referer': 'https://automind.dev',
            'X-Title': 'AutoMind Question Solver',
          },
          body: JSON.stringify(body),
          signal: controller.signal,
        });

        clearTimeout(timeout);

        if (!response.ok) {
          const errorBody = await response.text().catch(() => '');
          lastError = `HTTP ${response.status}: ${errorBody.slice(0, 200)}`;

          // Rate limited — wait and retry
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

          // Client errors — don't retry
          return {
            success: false,
            error: lastError,
            meta: { latencyMs: Date.now() - startTime },
          };
        }

        const data = await response.json();
        const latencyMs = Date.now() - startTime;

        const choice = data.choices?.[0];
        if (!choice?.message?.content) {
          lastError = 'Empty response from model';
          continue;
        }

        const meta: ChatResponseMeta = {
          model: data.model || this.config.primaryModel,
          latencyMs,
          inputTokens: data.usage?.prompt_tokens,
          outputTokens: data.usage?.completion_tokens,
          totalCost: data.usage?.total_cost,
        };

        // Log telemetry
        console.log(
          `[OpenRouter] model=${meta.model} latency=${meta.latencyMs}ms tokens=${meta.inputTokens || '?'}/${meta.outputTokens || '?'} attempt=${attempt + 1}`
        );

        return {
          success: true,
          content: choice.message.content,
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
      meta: { latencyMs: Date.now() - startTime },
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
