/**
 * 에이전트 메시지 빌더 유틸리티
 */

import { AgentRole, ChatMessage, Phase } from '@/types';
import { MessageContent } from '@/lib/anthropic';
import { ChatChainConfig } from '@/agents/types';

/**
 * 고유 메시지 ID 생성
 */
export function generateMessageId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * ChatMessage 객체 생성
 */
export function createChatMessage(
  from: AgentRole,
  to: AgentRole,
  content: string,
  phase: Phase
): ChatMessage {
  return {
    id: generateMessageId(),
    from,
    to,
    content,
    timestamp: Date.now(),
    phase,
  };
}

/**
 * Instructor 메시지 빌드
 */
export function buildInstructorMessages(
  config: ChatChainConfig,
  messages: ChatMessage[],
  round: number
): MessageContent[] {
  const result: MessageContent[] = [];

  if (round === 1) {
    result.push({
      role: 'user',
      content: `## 작업
${config.task}

${config.context ? `## 이전 단계 결과\n${config.context}\n\n` : ''}## 지시
${config.assistant} 역할의 팀원과 대화하여 이 작업을 완수해주세요.
작업이 완료되면 응답 마지막에 "<TASK_DONE>"을 포함해주세요.`,
    });
  } else {
    const recentMessages = messages.slice(-4);
    for (const msg of recentMessages) {
      result.push({
        role: msg.from === config.instructor ? 'assistant' : 'user',
        content: msg.content,
      });
    }
  }

  return result;
}

/**
 * Assistant 메시지 빌드
 */
export function buildAssistantMessages(
  config: ChatChainConfig,
  messages: ChatMessage[],
  instructorMessage: string
): MessageContent[] {
  const result: MessageContent[] = [];

  if (messages.length > 1) {
    const recentMessages = messages.slice(-5, -1);
    for (const msg of recentMessages) {
      result.push({
        role: msg.to === config.assistant ? 'user' : 'assistant',
        content: msg.content,
      });
    }
  }

  result.push({
    role: 'user',
    content: instructorMessage,
  });

  return result;
}
