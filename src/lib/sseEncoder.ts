/**
 * SSE 인코딩 유틸리티
 */

export class SSEEncoder {
  private encoder: TextEncoder;

  constructor() {
    this.encoder = new TextEncoder();
  }

  encode(event: string, data: unknown): Uint8Array {
    return this.encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  }

  getEncoder(): TextEncoder {
    return this.encoder;
  }
}

export const SSE_HEADERS = {
  'Content-Type': 'text/event-stream',
  'Cache-Control': 'no-cache',
  Connection: 'keep-alive',
} as const;
