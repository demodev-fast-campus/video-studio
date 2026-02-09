import { NextRequest } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export async function POST(request: NextRequest) {
  try {
    const { apiKey } = await request.json();

    const effectiveApiKey = apiKey || process.env.ANTHROPIC_API_KEY;

    if (!effectiveApiKey) {
      return new Response(
        JSON.stringify({ error: 'API key is required' }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const client = new Anthropic({ apiKey: effectiveApiKey });
    const models: Array<{ id: string; displayName: string }> = [];

    for await (const model of client.models.list()) {
      models.push({
        id: model.id,
        displayName: model.display_name,
      });
    }

    return new Response(JSON.stringify({ models }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Models API error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch models' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
