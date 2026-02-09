'use client';

import { useEffect, useState } from 'react';
import { EventBus, GameEvents } from '@/game/utils/EventBus';
import { AgentRole, ALL_AGENT_ROLES } from '@/types';

export function useGameEvents() {
  const [isGameReady, setIsGameReady] = useState(false);

  useEffect(() => {
    const handleGameReady = () => setIsGameReady(true);
    EventBus.on(GameEvents.GAME_READY, handleGameReady);
    return () => {
      EventBus.off(GameEvents.GAME_READY, handleGameReady);
    };
  }, []);

  return { isGameReady };
}

/**
 * 대화 시작 이벤트 발송
 */
export function emitStartConversation(
  instructor: AgentRole,
  assistant: AgentRole,
  phase: string
) {
  EventBus.emit(GameEvents.START_CONVERSATION, { instructor, assistant, phase });
}

/**
 * 말풍선 표시 이벤트 발송
 */
export function emitShowBubble(role: AgentRole, text: string) {
  EventBus.emit(GameEvents.SHOW_BUBBLE, { role, text });
}

/**
 * 에이전트 활성 상태 설정
 */
export function emitSetAgentActive(role: AgentRole, active: boolean) {
  EventBus.emit(GameEvents.SET_AGENT_ACTIVE, { role, active });
}

/**
 * 모든 에이전트 비활성화
 */
export function emitDeactivateAllAgents() {
  ALL_AGENT_ROLES.forEach((role) => {
    EventBus.emit(GameEvents.SET_AGENT_ACTIVE, { role, active: false });
  });
}
