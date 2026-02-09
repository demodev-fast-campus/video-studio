## Error Type
Runtime Error

## Error Message
It looks like you're running in a browser-like environment.

This is disabled by default, as it risks exposing your secret API credentials to attackers.
If you understand the risks and have appropriate mitigations in place,
you can set the `dangerouslyAllowBrowser` option to `true`, e.g.,

new Anthropic({ apiKey, dangerouslyAllowBrowser: true });



    at module evaluation (src/lib/anthropic.ts:3:19)
    at module evaluation (src/agents/ChatChain.ts:4:1)
    at module evaluation (src/agents/AgentManager.ts:3:1)
    at module evaluation (src/app/page.tsx:11:1)

## Code Frame
  1 | import Anthropic from '@anthropic-ai/sdk';
  2 |
> 3 | const anthropic = new Anthropic({
    |                   ^
  4 |   apiKey: process.env.ANTHROPIC_API_KEY,
  5 | });
  6 |

Next.js version: 16.1.6 (Turbopack)
