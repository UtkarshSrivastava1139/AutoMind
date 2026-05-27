import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { OpenRouterClient, solveQuestion } from '@automind/prompts';
import { QuestionParseResultSchema } from '@automind/schemas';

const SolveRequestSchema = z.object({
  questionText: z.string().min(5).max(2000),
  parseResult: QuestionParseResultSchema,
});

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const requestId = crypto.randomUUID();

  try {
    const body = await request.json();
    const validated = SolveRequestSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: 'validation_error', details: validated.error.issues },
        { status: 400 }
      );
    }

    const { questionText, parseResult } = validated.data;

    const client = new OpenRouterClient();
    const result = await solveQuestion(client, questionText, parseResult as any);

    if (!result.success) {
      return NextResponse.json(
        {
          error: result.stage === 'no_candidate' ? 'no_verified_candidate' : 'solve_error',
          message: result.error,
          stage: result.stage,
        },
        { status: 422 }
      );
    }

    console.log(
      `[/api/question/solve] requestId=${requestId} status=${result.result.status} candidates=${result.result.candidatesEvaluated} latency=${Date.now() - startTime}ms`
    );

    return NextResponse.json({
      requestId,
      ...result.result,
      latencyMs: Date.now() - startTime,
    });
  } catch (err) {
    console.error(`[/api/question/solve] requestId=${requestId} error:`, err);
    return NextResponse.json(
      { error: 'internal_error', message: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
