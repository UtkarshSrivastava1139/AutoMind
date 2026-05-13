import { NextRequest, NextResponse } from 'next/server';
import { OpenRouterClient } from '@automind/prompts';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

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

    const client = new OpenRouterClient();
    
    // Prepare messages with system prompt
    const chatMessages = [
      {
        role: 'system' as const,
        content: TUTOR_SYSTEM_PROMPT,
      },
      ...messages.map((msg: any) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })),
    ];

    // Use OpenRouterClient which handles retry and fallback automatically
    const result = await client.chat(chatMessages, {
      temperature: 0.7,
      maxTokens: 1000,
    });

    if (!result.success) {
      console.error('Tutor chat error:', result.error);
      return NextResponse.json(
        { error: 'Failed to get response from AI service', details: result.error },
        { status: 500 }
      );
    }

    // Render markdown->HTML and plain text for richer frontend display
    let html = result.content;
    let text = result.content;

    try {
      // Render markdown to static HTML
      const element = React.createElement(ReactMarkdown, { remarkPlugins: [remarkGfm], children: result.content });
      html = renderToStaticMarkup(element);

      // Produce plain text by stripping tags from HTML
      text = html.replace(/<[^>]+>/g, '');
      // Normalize whitespace
      text = text.replace(/\s+/g, ' ').trim();
    } catch (err) {
      console.warn('Failed to render markdown to HTML/text:', err);
      // fallback: keep original content as markdown/text
      html = result.content;
      text = result.content.replace(/\s+/g, ' ').trim();
    }

    return NextResponse.json({
      markdown: result.content,
      html,
      text,
      model: result.meta.model,
      latencyMs: result.meta.latencyMs,
    });
  } catch (error) {
    console.error('Tutor chat error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}