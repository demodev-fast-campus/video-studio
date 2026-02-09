import Anthropic from '@anthropic-ai/sdk';

export interface MessageContent {
  role: 'user' | 'assistant';
  content: string;
}

export const DEFAULT_MODEL = 'claude-haiku-4-5-20251001';

export function createAnthropicClient(apiKey: string, model: string = DEFAULT_MODEL) {
  const anthropic = new Anthropic({
    apiKey,
  });

  async function generateResponse(
    systemPrompt: string,
    messages: MessageContent[]
  ): Promise<string> {
    try {
      const response = await anthropic.messages.create({
        model,
        max_tokens: 4096,
        system: systemPrompt,
        messages: messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
      });

      if (response.content[0].type === 'text') {
        return response.content[0].text;
      }

      return '';
    } catch (error) {
      console.error('Anthropic API error:', error);
      throw error;
    }
  }

  async function streamResponse(
    systemPrompt: string,
    messages: MessageContent[],
    onChunk: (chunk: string) => void
  ): Promise<string> {
    let fullResponse = '';

    const stream = await anthropic.messages.stream({
      model,
      max_tokens: 4096,
      system: systemPrompt,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    });

    for await (const event of stream) {
      if (
        event.type === 'content_block_delta' &&
        event.delta.type === 'text_delta'
      ) {
        const chunk = event.delta.text;
        fullResponse += chunk;
        onChunk(chunk);
      }
    }

    return fullResponse;
  }

  return { generateResponse, streamResponse };
}
