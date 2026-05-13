import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { OpenRouterClient, parseQuestion } from '@automind/prompts';

const ParseRequestSchema = z.object({
  questionText: z.string().min(5).max(2000),
});

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const requestId = crypto.randomUUID();

  try {
    const body = await request.json();
    const validated = ParseRequestSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: 'validation_error', details: validated.error.issues },
        { status: 400 }
      );
    }

    const { questionText } = validated.data;

    const client = new OpenRouterClient();
    const result = await parseQuestion(client, questionText);

    if (!result.success) {
      // Determine appropriate status code
      const isUnsupported = result.error.includes('not supported');
      return NextResponse.json(
        {
          error: isUnsupported ? 'unsupported_question' : 'parse_error',
          message: result.error,
          stage: result.stage,
        },
        { status: 422 }
      );
    }

    console.log(
      `[/api/question/parse] requestId=${requestId} taskType=${result.classification.taskType} confidence=${result.classification.confidence} latency=${Date.now() - startTime}ms`
    );

    return NextResponse.json({
      requestId,
      taskType: result.classification.taskType,
      confidence: result.classification.confidence,
      reasoning: result.classification.reasoning,
      parseResult: result.parseResult,
      ambiguities: result.ambiguities,
      overallAssessment: result.overallAssessment,
      needsClarification: result.needsClarification,
      latencyMs: Date.now() - startTime,
    });
  } catch (err) {
    console.error(`[/api/question/parse] requestId=${requestId} error:`, err);
    return NextResponse.json(
      { error: 'internal_error', message: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
