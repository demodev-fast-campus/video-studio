import { AgentRole, ChatMessage, Phase } from '@/types';
import { ChatChainConfig, ChatRoundResult, PhaseResult, PHASE_PAIRS } from './types';
import { AGENT_PROMPTS } from './roles';
import { createAnthropicClient, MessageContent } from '@/lib/anthropic';
import {
  TASK_DONE_MARKER,
  MAX_SAME_RESPONSE_COUNT,
} from '@/lib/completion';
import { createChatMessage, buildInstructorMessages, buildAssistantMessages } from '@/lib/messageBuilder';

export class ChatChain {
  private config: ChatChainConfig;
  private messages: ChatMessage[] = [];
  private round: number = 0;
  private lastResponse: string = '';
  private sameResponseCount: number = 0;
  private generateResponse: (systemPrompt: string, messages: MessageContent[]) => Promise<string>;

  constructor(config: ChatChainConfig, apiKey: string) {
    this.config = config;
    const client = createAnthropicClient(apiKey);
    this.generateResponse = client.generateResponse;
  }

  async runRound(): Promise<ChatRoundResult> {
    this.round++;

    // Instructor의 메시지 생성
    const instructorPrompt = buildInstructorMessages(this.config, this.messages, this.round);
    const instructorResponse = await this.generateResponse(
      AGENT_PROMPTS[this.config.instructor].systemPrompt,
      instructorPrompt
    );

    this.messages.push(
      createChatMessage(this.config.instructor, this.config.assistant, instructorResponse, this.config.phase)
    );

    // Assistant의 응답 생성
    const assistantPrompt = buildAssistantMessages(this.config, this.messages, instructorResponse);
    const assistantResponse = await this.generateResponse(
      AGENT_PROMPTS[this.config.assistant].systemPrompt,
      assistantPrompt
    );

    this.messages.push(
      createChatMessage(this.config.assistant, this.config.instructor, assistantResponse, this.config.phase)
    );

    // 완료 조건 체크
    const isComplete = this.checkCompletion(assistantResponse);

    return {
      instructorMessage: instructorResponse,
      assistantResponse,
      round: this.round,
      isComplete,
    };
  }

  private checkCompletion(response: string): boolean {
    if (response.includes(TASK_DONE_MARKER)) return true;
    if (this.round >= this.config.maxRounds) return true;

    if (response === this.lastResponse) {
      this.sameResponseCount++;
      if (this.sameResponseCount >= MAX_SAME_RESPONSE_COUNT) return true;
    } else {
      this.sameResponseCount = 0;
    }

    this.lastResponse = response;
    return false;
  }

  getMessages(): ChatMessage[] {
    return this.messages;
  }

  getRound(): number {
    return this.round;
  }
}

// 전체 개발 프로세스 실행
export async function runDevelopmentProcess(
  task: string,
  apiKey: string,
  onMessage: (message: ChatMessage) => void,
  onPhaseChange: (phase: Phase, instructor: AgentRole, assistant: AgentRole) => void
): Promise<{
  phases: PhaseResult[];
  finalCode: string;
}> {
  const phases: PhaseResult[] = [];
  let context = '';
  let finalCode = '';

  const phaseOrder: Phase[] = ['pre-production', 'production', 'post-production'];

  for (const phase of phaseOrder) {
    const pairs = PHASE_PAIRS[phase];

    for (const pair of pairs) {
      onPhaseChange(phase, pair.instructor, pair.assistant);

      const chain = new ChatChain(
        {
          phase,
          instructor: pair.instructor,
          assistant: pair.assistant,
          maxRounds: 10,
          task,
          context,
        },
        apiKey
      );

      const rounds: ChatRoundResult[] = [];
      let isComplete = false;

      while (!isComplete) {
        const result = await chain.runRound();
        rounds.push(result);

        const messages = chain.getMessages();
        const lastTwo = messages.slice(-2);
        for (const msg of lastTwo) {
          onMessage(msg);
        }

        isComplete = result.isComplete;

        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      const lastMessage = chain.getMessages().pop();
      if (lastMessage) {
        context = lastMessage.content;

        if (phase === 'production') {
          finalCode = extractCode(lastMessage.content);
        }
      }

      phases.push({
        phase,
        output: context,
        rounds,
        success: true,
      });
    }
  }

  return { phases, finalCode };
}

function extractCode(content: string): string {
  const codeBlockRegex = /```(?:\w+)?\n([\s\S]*?)```/g;
  const matches = [...content.matchAll(codeBlockRegex)];

  if (matches.length > 0) {
    return matches.map((m) => m[1].trim()).join('\n\n');
  }

  return content;
}
