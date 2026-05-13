/**
 * Explanation builder
 *
 * Generates human-readable explanations of verified automata
 * using LLM. Only called on verified results.
 */

import type { OpenRouterClient } from './openrouter-client';
import type { Automaton, QuestionParseResult } from '@automind/schemas';
import { EXPLANATION_GENERATOR_PROMPT } from './question-prompts';

export async function generateExplanation(
  client: OpenRouterClient,
  questionText: string,
  parseResult: QuestionParseResult,
  automaton: Automaton
): Promise<{ success: true; explanation: string; model: string; latencyMs: number } | { success: false; error: string }> {
  const transitionsText = automaton.transitions
    .map((t) => `  δ(${t.from}, ${t.symbol}) = ${t.to}`)
    .join('\n');

  const constraintsText = parseResult.atomicConstraints
    .map((c) => `  - ${c.description}`)
    .join('\n');

  const prompt = EXPLANATION_GENERATOR_PROMPT
    .replace('{{questionText}}', questionText)
    .replace('{{languageDescription}}', parseResult.languageDescription)
    .replace('{{alphabet}}', JSON.stringify(parseResult.alphabet))
    .replace('{{constraints}}', constraintsText)
    .replace('{{automatonType}}', automaton.type)
    .replace('{{states}}', JSON.stringify(automaton.states))
    .replace('{{startState}}', automaton.startState)
    .replace('{{acceptStates}}', JSON.stringify(automaton.acceptStates))
    .replace('{{transitions}}', transitionsText)
    .replace('{{positivePassCount}}', String(parseResult.positiveExamples.length))
    .replace('{{positiveTotalCount}}', String(parseResult.positiveExamples.length))
    .replace('{{negativePassCount}}', String(parseResult.negativeExamples.length))
    .replace('{{negativeTotalCount}}', String(parseResult.negativeExamples.length));

  const messages = [
    { role: 'system' as const, content: prompt },
    { role: 'user' as const, content: 'Generate the explanation.' },
  ];

  const result = await client.chat(messages, { temperature: 0.3, maxTokens: 1500 });

  if (!result.success) {
    return { success: false, error: `Explanation generation failed: ${result.error}` };
  }

  return {
    success: true,
    explanation: result.content,
    model: result.meta.model,
    latencyMs: result.meta.latencyMs,
  };
}
