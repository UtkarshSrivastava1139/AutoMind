/**
 * Question Parser — AI extraction pipeline
 *
 * Uses OpenRouter LLM calls to classify questions, extract constraints,
 * and detect ambiguities. All outputs are Zod-validated.
 */

import { OpenRouterClient } from './openrouter-client';
import type { TaskClassification, QuestionParseResult, AmbiguityFlag } from '@automind/schemas';
import { TaskClassificationSchema, QuestionParseResultSchema, AmbiguityFlagSchema } from '@automind/schemas';
import { z } from 'zod';
import {
  TASK_CLASSIFIER_PROMPT,
  CONSTRAINT_EXTRACTOR_PROMPT,
  AMBIGUITY_DETECTOR_PROMPT,
} from './question-prompts';

// ── Task Classification ────────────────────────────────────────

export async function classifyQuestion(
  client: OpenRouterClient,
  questionText: string
): Promise<{ success: true; data: TaskClassification } | { success: false; error: string }> {
  const messages = [
    { role: 'system' as const, content: TASK_CLASSIFIER_PROMPT },
    { role: 'user' as const, content: questionText },
  ];

  const result = await client.chat(messages, { jsonMode: true, temperature: 0.1 });

  if (!result.success) {
    return { success: false, error: `Classification failed: ${result.error}` };
  }

  const parsed = OpenRouterClient.parseJSON<unknown>(result.content);
  const sanitizeData = (data: any) => {
    if (data && typeof data.taskType === 'string') {
      data.taskType = data.taskType.replace(/^:/, '').trim();
    }
    if (data && typeof data.confidence !== 'number') {
      data.confidence = 0.8;
    }
    if (data && typeof data.reasoning !== 'string') {
      data.reasoning = 'Inferred from prompt fallback';
    }
    return data;
  };

  if (!parsed.success) {
    // Retry once with explicit JSON instruction
    const retryMessages = [
      ...messages,
      { role: 'assistant' as const, content: result.content },
      { role: 'user' as const, content: 'Please respond with ONLY a valid JSON object. No other text.' },
    ];
    const retry = await client.chat(retryMessages, { jsonMode: true, temperature: 0.0 });
    if (!retry.success) {
      return { success: false, error: `Retry failed: ${retry.error}` };
    }
    const retryParsed = OpenRouterClient.parseJSON<unknown>(retry.content);
    if (!retryParsed.success) {
      return { success: false, error: `JSON parse failed after retry: ${retryParsed.error}` };
    }
    const validated = TaskClassificationSchema.safeParse(sanitizeData(retryParsed.data));
    if (!validated.success) {
      return { success: false, error: `Schema validation failed: ${validated.error.message}` };
    }
    return { success: true, data: validated.data };
  }

  const validated = TaskClassificationSchema.safeParse(sanitizeData(parsed.data));
  if (!validated.success) {
    return { success: false, error: `Schema validation failed: ${validated.error.message}` };
  }

  return { success: true, data: validated.data };
}

// ── Constraint Extraction ──────────────────────────────────────

export async function extractConstraints(
  client: OpenRouterClient,
  questionText: string,
  taskType: string
): Promise<{ success: true; data: QuestionParseResult } | { success: false; error: string }> {
  const prompt = CONSTRAINT_EXTRACTOR_PROMPT
    .replace('{{taskType}}', taskType)
    .replace('{{questionText}}', questionText);

  const messages = [
    { role: 'system' as const, content: prompt },
    { role: 'user' as const, content: questionText },
  ];

  const result = await client.chat(messages, { jsonMode: true, temperature: 0.15, maxTokens: 2000 });

  if (!result.success) {
    return { success: false, error: `Extraction failed: ${result.error}` };
  }

  const parsed = OpenRouterClient.parseJSON<unknown>(result.content);
  if (!parsed.success) {
    // Retry
    const retryMessages = [
      ...messages,
      { role: 'assistant' as const, content: result.content },
      { role: 'user' as const, content: 'Your response was not valid JSON. Please respond with ONLY a valid JSON object matching the schema. No markdown, no explanation.' },
    ];
    const retry = await client.chat(retryMessages, { jsonMode: true, temperature: 0.0 });
    if (!retry.success) {
      return { success: false, error: `Retry failed: ${retry.error}` };
    }
    const retryParsed = OpenRouterClient.parseJSON<unknown>(retry.content);
    if (!retryParsed.success) {
      return { success: false, error: `JSON parse failed after retry: ${retryParsed.error}` };
    }
    return validateParseResult(retryParsed.data);
  }

  return validateParseResult(parsed.data);
}

function validateParseResult(data: unknown): { success: true; data: QuestionParseResult } | { success: false; error: string } {
  const validated = QuestionParseResultSchema.safeParse(data);
  if (!validated.success) {
    // Try to salvage with defaults for missing optional fields
    const patched = {
      ...(data as Record<string, unknown>),
      notes: (data as Record<string, unknown>).notes || '',
      ambiguityFlags: (data as Record<string, unknown>).ambiguityFlags || [],
      assumptions: (data as Record<string, unknown>).assumptions || [],
    };
    const retry = QuestionParseResultSchema.safeParse(patched);
    if (retry.success) return { success: true, data: retry.data };
    return { success: false, error: `Schema validation failed: ${validated.error.message}` };
  }
  return { success: true, data: validated.data };
}

// ── Ambiguity Detection ────────────────────────────────────────

const AmbiguityResponseSchema = z.object({
  ambiguities: z.array(AmbiguityFlagSchema),
  exampleIssues: z.array(z.object({
    example: z.string(),
    type: z.string(),
    issue: z.string(),
  })).optional(),
  overallAssessment: z.enum(['clear', 'minor_issues', 'needs_clarification']),
});

export async function detectAmbiguities(
  client: OpenRouterClient,
  parseResult: QuestionParseResult
): Promise<{ ambiguities: AmbiguityFlag[]; overallAssessment: string }> {
  const prompt = AMBIGUITY_DETECTOR_PROMPT
    .replace('{{constraintsJson}}', JSON.stringify(parseResult, null, 2));

  const messages = [
    { role: 'system' as const, content: prompt },
    { role: 'user' as const, content: 'Analyze the constraints above for ambiguities.' },
  ];

  const result = await client.chat(messages, { jsonMode: true, temperature: 0.1 });

  if (!result.success) {
    // On failure, return no ambiguities (don't block the pipeline)
    console.warn('[AmbiguityDetector] Failed:', result.error);
    return { ambiguities: [], overallAssessment: 'clear' };
  }

  const parsed = OpenRouterClient.parseJSON<unknown>(result.content);
  if (!parsed.success) {
    console.warn('[AmbiguityDetector] JSON parse failed:', parsed.error);
    return { ambiguities: [], overallAssessment: 'clear' };
  }

  const validated = AmbiguityResponseSchema.safeParse(parsed.data);
  if (!validated.success) {
    console.warn('[AmbiguityDetector] Schema validation failed:', validated.error.message);
    return { ambiguities: [], overallAssessment: 'clear' };
  }

  return {
    ambiguities: validated.data.ambiguities,
    overallAssessment: validated.data.overallAssessment,
  };
}
