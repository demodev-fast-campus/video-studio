import { NextRequest } from 'next/server';
import { ChatMessage, Phase } from '@/types';
import { ChatChainConfig, PHASE_PAIRS } from '@/agents/types';
import { AGENT_PROMPTS } from '@/agents/roles';
import { createAnthropicClient, MessageContent } from '@/lib/anthropic';
import { generateMockConversations, createMockMessage, delay } from '@/lib/mockResponses';
import { extractMainCode } from '@/lib/codeExtractor';
import {
  TASK_DONE_MARKER,
  MAX_SAME_RESPONSE_COUNT,
} from '@/lib/completion';
import { SSEEncoder, SSE_HEADERS } from '@/lib/sseEncoder';
import {
  createChatMessage,
  buildInstructorMessages,
  buildAssistantMessages,
} from '@/lib/messageBuilder';

interface ChatChainState {
  messages: ChatMessage[];
  round: number;
  lastResponse: string;
  sameResponseCount: number;
}

function checkCompletion(
  response: string,
  state: ChatChainState,
  maxRounds: number
): boolean {
  if (response.includes(TASK_DONE_MARKER)) return true;
  if (state.round >= maxRounds) return true;
  if (response === state.lastResponse) {
    state.sameResponseCount++;
    if (state.sameResponseCount >= MAX_SAME_RESPONSE_COUNT) return true;
  } else {
    state.sameResponseCount = 0;
  }
  state.lastResponse = response;
  return false;
}

async function runChatRound(
  config: ChatChainConfig,
  state: ChatChainState,
  generateResponse: (systemPrompt: string, messages: MessageContent[]) => Promise<string>
): Promise<{ instructorMessage: string; assistantResponse: string; isComplete: boolean }> {
  state.round++;

  // Instructor 응답 생성
  const instructorMessages = buildInstructorMessages(config, state.messages, state.round);
  const instructorResponse = await generateResponse(
    AGENT_PROMPTS[config.instructor].systemPrompt,
    instructorMessages
  );

  state.messages.push(
    createChatMessage(config.instructor, config.assistant, instructorResponse, config.phase)
  );

  // Assistant 응답 생성
  const assistantMessages = buildAssistantMessages(config, state.messages, instructorResponse);
  const assistantResponse = await generateResponse(
    AGENT_PROMPTS[config.assistant].systemPrompt,
    assistantMessages
  );

  state.messages.push(
    createChatMessage(config.assistant, config.instructor, assistantResponse, config.phase)
  );

  const isComplete = checkCompletion(assistantResponse, state, config.maxRounds);

  return { instructorMessage: instructorResponse, assistantResponse, isComplete };
}

export async function POST(request: NextRequest) {
  try {
    const { task, apiKey, model, simulationMode } = await request.json();

    if (!task) {
      return new Response(JSON.stringify({ error: 'Task is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (simulationMode) {
      return handleSimulationMode(task);
    }

    const effectiveApiKey = apiKey || process.env.ANTHROPIC_API_KEY;

    if (!effectiveApiKey) {
      return new Response(
        JSON.stringify({ error: 'API key is required. Please set your Anthropic API key in settings.' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { generateResponse } = createAnthropicClient(effectiveApiKey, model);
    const sse = new SSEEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        const sendEvent = (event: string, data: unknown) => {
          controller.enqueue(sse.encode(event, data));
        };

        try {
          let context = '';
          let finalCode = '';
          const phaseOrder: Phase[] = ['design', 'coding', 'testing'];

          for (const phase of phaseOrder) {
            const pairs = PHASE_PAIRS[phase];

            for (const pair of pairs) {
              sendEvent('phaseChange', {
                phase,
                instructor: pair.instructor,
                assistant: pair.assistant,
              });

              const config: ChatChainConfig = {
                phase,
                instructor: pair.instructor,
                assistant: pair.assistant,
                maxRounds: 10,
                task,
                context,
              };

              const state: ChatChainState = {
                messages: [],
                round: 0,
                lastResponse: '',
                sameResponseCount: 0,
              };

              let isComplete = false;

              while (!isComplete) {
                const result = await runChatRound(config, state, generateResponse);

                const lastTwo = state.messages.slice(-2);
                for (const msg of lastTwo) {
                  sendEvent('message', msg);
                }

                sendEvent('roundProgress', {
                  phase,
                  round: state.round,
                  maxRounds: config.maxRounds,
                });

                isComplete = result.isComplete;
              }

              const lastMessage = state.messages[state.messages.length - 1];
              if (lastMessage) {
                context = lastMessage.content;
                if (phase === 'coding') {
                  finalCode = extractMainCode(lastMessage.content);
                }
              }
            }
          }

          sendEvent('complete', { code: finalCode });
          controller.close();
        } catch (error) {
          console.error('Development process error:', error);
          sendEvent('error', { message: String(error) });
          controller.close();
        }
      },
    });

    return new Response(stream, { headers: SSE_HEADERS });
  } catch (error) {
    console.error('API error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

function handleSimulationMode(task: string) {
  const sse = new SSEEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const sendEvent = (event: string, data: unknown) => {
        controller.enqueue(sse.encode(event, data));
      };

      try {
        const mockConversations = generateMockConversations(task);
        let finalCode = '';

        for (const conversation of mockConversations) {
          sendEvent('phaseChange', {
            phase: conversation.phase,
            instructor: conversation.instructor,
            assistant: conversation.assistant,
          });

          const maxRounds = Math.ceil(conversation.exchanges.length / 2);
          let round = 0;

          for (let i = 0; i < conversation.exchanges.length; i++) {
            const exchange = conversation.exchanges[i];
            const message = createMockMessage(exchange, conversation.phase);

            await delay(800 + Math.random() * 400);
            sendEvent('message', message);

            if (i % 2 === 1 || i === conversation.exchanges.length - 1) {
              round++;
              sendEvent('roundProgress', {
                phase: conversation.phase,
                round,
                maxRounds,
              });
            }

            if (conversation.phase === 'coding' && exchange.content.includes('```')) {
              const codeMatch = exchange.content.match(/```(?:\w+)?\n([\s\S]*?)```/);
              if (codeMatch) {
                finalCode = codeMatch[1].trim();
              }
            }
          }
        }

        sendEvent('complete', { code: finalCode });
        controller.close();
      } catch (error) {
        console.error('Simulation error:', error);
        sendEvent('error', { message: String(error) });
        controller.close();
      }
    },
  });

  return new Response(stream, { headers: SSE_HEADERS });
}
