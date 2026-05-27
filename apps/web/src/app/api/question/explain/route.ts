import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { OpenRouterClient, generateExplanation } from '@automind/prompts';
import { AutomatonSchema, QuestionParseResultSchema } from '@automind/schemas';

const ExplainRequestSchema = z.object({
  questionText: z.string().min(5).max(2000),
  parseResult: QuestionParseResultSchema,
  automaton: AutomatonSchema,
});

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const requestId = crypto.randomUUID();

  try {
    const body = await request.json();
    const validated = ExplainRequestSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: 'validation_error', details: validated.error.issues },
        { status: 400 }
      );
    }

    const { questionText, parseResult, automaton } = validated.data;

    const client = new OpenRouterClient();
    const result = await generateExplanation(client, questionText, parseResult as any, automaton as any);

    if (!result.success) {
      return NextResponse.json(
        { error: 'explanation_error', message: result.error },
        { status: 422 }
      );
    }

    console.log(
      `[/api/question/explain] requestId=${requestId} model=${result.model} latency=${result.latencyMs}ms`
    );

    return NextResponse.json({
      requestId,
      explanation: result.explanation,
      model: result.model,
      latencyMs: result.latencyMs,
    });
  } catch (err) {
    console.error(`[/api/question/explain] requestId=${requestId} error:`, err);
    return NextResponse.json(
      { error: 'internal_error', message: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
