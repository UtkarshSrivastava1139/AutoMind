import { NextRequest, NextResponse } from 'next/server';

const OPENROUTER_BASE_URL = process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1';
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_PRIMARY_MODEL = process.env.OPENROUTER_PRIMARY_MODEL || 'inclusionai/ring-2.6-1t:free';

const TUTOR_SYSTEM_PROMPT = `You are AutoMind Tutor, an expert educational assistant for Theory of Automata and Formal Languages.

Your role is to help students understand:
- Deterministic Finite Automata (DFA)
- Non-deterministic Finite Automata (NFA)
- Regular Expressions and their conversion to automata
- Formal language theory concepts
- Algorithms like Thompson's Construction, Subset Construction, and Hopcroft Minimization

Guidelines:
1. Explain concepts clearly using student-friendly language while maintaining formal precision.
2. Use examples and step-by-step reasoning when explaining algorithms or concepts.
3. When explaining automata, reference specific states and transitions.
4. Use proper TAFL terminology but explain in accessible ways.
5. For questions about equivalence or correctness, explain the reasoning behind the answer.
6. If a question is outside the scope of TAFL, politely redirect to TAFL topics.
7. Encourage students to think critically and ask follow-up questions.
8. Be concise but thorough in your explanations.`;

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();

    if (!Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Invalid request: messages must be an array' },
        { status: 400 }
      );
    }

    if (messages.length === 0) {
      return NextResponse.json(
        { error: 'Invalid request: at least one message is required' },
        { status: 400 }
      );
    }

    if (!OPENROUTER_API_KEY) {
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://automind.ai',
        'X-Title': 'AutoMind',
      },
      body: JSON.stringify({
        model: OPENROUTER_PRIMARY_MODEL,
        messages: [
          {
            role: 'system',
            content: TUTOR_SYSTEM_PROMPT,
          },
          ...messages,
        ],
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenRouter API error:', error);
      return NextResponse.json(
        { error: 'Failed to get response from AI service' },
        { status: response.status }
      );
    }

    const data = await response.json();
    const assistantMessage = data.choices[0]?.message?.content;

    if (!assistantMessage) {
      return NextResponse.json(
        { error: 'No response from AI service' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: assistantMessage,
      model: data.model,
    });
  } catch (error) {
    console.error('Tutor chat error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}