import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAIClient, AI_LAYOUT_PROMPT, parseAIJSON } from '@automind/prompts';
import { AILayoutResponseSchema, AutomatonSchema } from '@automind/schemas';

const LayoutRequestSchema = z.object({
  automaton: AutomatonSchema,
});

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const body = await request.json();
    const validated = LayoutRequestSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: 'validation_error', details: validated.error.issues },
        { status: 400 }
      );
    }

    const { automaton } = validated.data;
    const client = getAIClient();
    
    // We use a fast model for UI responsiveness
    const messages = [
      { role: 'system' as const, content: AI_LAYOUT_PROMPT.replace('{{automatonJson}}', JSON.stringify(automaton, null, 2)) }
    ];

    const result = await client.chat(messages, { 
      jsonMode: true, 
      temperature: 0.1,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: 'llm_error', message: result.error },
        { status: 502 }
      );
    }

    const parsed = parseAIJSON<unknown>(result.content);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'parse_error', message: 'Failed to parse AI layout response' },
        { status: 500 }
      );
    }

    // Attempt to validate against the schema
    const layoutValidation = AILayoutResponseSchema.safeParse(parsed.data);
    
    if (!layoutValidation.success) {
      return NextResponse.json(
        { error: 'schema_error', message: layoutValidation.error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      layout: layoutValidation.data,
      latencyMs: Date.now() - startTime,
    });
  } catch (err) {
    console.error(`[/api/question/layout] error:`, err);
    return NextResponse.json(
      { error: 'internal_error', message: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
