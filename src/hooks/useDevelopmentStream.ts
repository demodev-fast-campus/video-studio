'use client';

import { useState, useRef, useCallback } from 'react';
import { ChatMessage, Phase, AgentRole } from '@/types';
import {
  emitStartConversation,
  emitShowBubble,
  emitDeactivateAllAgents,
} from './useGameEvents';

function truncateMessage(message: string): string {
  const withoutCode = message.replace(/```[\s\S]*?```/g, '[CODE]');
  const withoutMarker = withoutCode.replace(/<TASK_DONE>/g, '');
  if (withoutMarker.length > 80) {
    return withoutMarker.substring(0, 77) + '...';
  }
  return withoutMarker.trim();
}

export interface DevelopmentState {
  messages: ChatMessage[];
  currentPhase: Phase | null;
  completedPhases: Phase[];
  activeAgents: AgentRole[];
  generatedCode: string;
  isRunning: boolean;
  error: string | null;
  currentRound: number;
  maxRounds: number;
}

export function useDevelopmentStream() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentPhase, setCurrentPhase] = useState<Phase | null>(null);
  const [completedPhases, setCompletedPhases] = useState<Phase[]>([]);
  const [activeAgents, setActiveAgents] = useState<AgentRole[]>([]);
  const [generatedCode, setGeneratedCode] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentRound, setCurrentRound] = useState(0);
  const [maxRounds, setMaxRounds] = useState(10);
  const prevPhaseRef = useRef<Phase | null>(null);

  const reset = useCallback(() => {
    setMessages([]);
    setCurrentPhase(null);
    setCompletedPhases([]);
    setGeneratedCode('');
    setActiveAgents([]);
    setError(null);
    setCurrentRound(0);
    setMaxRounds(10);
    prevPhaseRef.current = null;
  }, []);

  const startDevelopment = useCallback(
    async (
      task: string,
      apiKey: string,
      selectedModel: string,
      simulationMode: boolean
    ) => {
      setIsRunning(true);
      reset();

      try {
        const response = await fetch('/api/develop', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ task, apiKey, model: selectedModel, simulationMode }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'API request failed');
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error('No reader');

        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          let currentEvent = '';
          for (const line of lines) {
            if (line.startsWith('event: ')) {
              currentEvent = line.slice(7);
            } else if (line.startsWith('data: ')) {
              const data = JSON.parse(line.slice(6));

              if (currentEvent === 'phaseChange') {
                const { phase, instructor, assistant } = data;
                if (prevPhaseRef.current && prevPhaseRef.current !== phase) {
                  setCompletedPhases((prev) => [...prev, prevPhaseRef.current!]);
                }
                prevPhaseRef.current = phase;
                setCurrentPhase(phase);
                emitStartConversation(instructor, assistant, phase);
              } else if (currentEvent === 'message') {
                const message = data as ChatMessage;
                setMessages((prev) => [...prev, message]);
                setActiveAgents([message.from, message.to]);
                emitShowBubble(message.from, truncateMessage(message.content));
              } else if (currentEvent === 'complete') {
                const { code } = data;
                setGeneratedCode(code);
                setCompletedPhases((prev) => [...prev, 'testing', 'completed']);
                setCurrentPhase('completed');
                setActiveAgents([]);
                emitDeactivateAllAgents();
              } else if (currentEvent === 'roundProgress') {
                const { round, maxRounds: max } = data;
                setCurrentRound(round);
                setMaxRounds(max);
              } else if (currentEvent === 'error') {
                setError(data.message);
              }
            }
          }
        }
      } catch (err) {
        console.error('Development error:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsRunning(false);
      }
    },
    [reset]
  );

  return {
    // State
    messages,
    currentPhase,
    completedPhases,
    activeAgents,
    generatedCode,
    isRunning,
    error,
    currentRound,
    maxRounds,
    // Actions
    startDevelopment,
    reset,
    setError,
  };
}
