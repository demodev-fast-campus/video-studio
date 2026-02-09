import { NextRequest } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const CACHE_TTL = 12 * 60 * 60 * 1000; // 12 hours

let cache: {
  key: string;
  data: Array<{ id: string; displayName: string }>;
  expiresAt: number;
} | null = null;

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

    if (cache && cache.key === effectiveApiKey && Date.now() < cache.expiresAt) {
      return new Response(JSON.stringify({ models: cache.data }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const client = new Anthropic({ apiKey: effectiveApiKey });
    const models: Array<{ id: string; displayName: string }> = [];

    for await (const model of client.models.list()) {
      models.push({
        id: model.id,
        displayName: model.display_name,
      });
    }

    cache = { key: effectiveApiKey, data: models, expiresAt: Date.now() + CACHE_TTL };

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
