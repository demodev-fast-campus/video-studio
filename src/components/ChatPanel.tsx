'use client';

import { useEffect, useRef } from 'react';
import { ChatMessage, AGENT_COLORS, AGENT_NAMES } from '@/types';

interface ChatPanelProps {
  messages: ChatMessage[];
  isLoading?: boolean;
}

export default function ChatPanel({ messages, isLoading }: ChatPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const formatContent = (content: string) => {
    // 코드 블록 처리
    const parts = content.split(/(```[\s\S]*?```)/g);

    return parts.map((part, index) => {
      if (part.startsWith('```')) {
        const match = part.match(/```(\w+)?\n([\s\S]*?)```/);
        if (match) {
          const code = match[2];
          return (
            <pre
              key={index}
              className="bg-[#0a0a1a] border-2 border-[#3a3a5a] p-2 mt-2 mb-2 overflow-x-auto text-xs"
            >
              <code className="text-[#50c878]">{code}</code>
            </pre>
          );
        }
      }

      // TASK_DONE 마커 제거
      const cleanedPart = part.replace(/<TASK_DONE>/g, '');
      if (!cleanedPart.trim()) return null;

      return (
        <span key={index} className="whitespace-pre-wrap">
          {cleanedPart}
        </span>
      );
    });
  };

  const getAgentColor = (role: string) => {
    const color = AGENT_COLORS[role as keyof typeof AGENT_COLORS];
    return color ? `#${color.toString(16).padStart(6, '0')}` : '#888888';
  };

  return (
    <div className="flex flex-col h-full pixel-panel">
      {/* 헤더 */}
      <div className="flex items-center gap-2 p-3 border-b-4 border-[#3a3a5a]">
        <span className="text-[#4a90d9]">💬</span>
        <h2 className="text-lg pixel-text">에이전트 대화</h2>
      </div>

      {/* 메시지 목록 */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-3 space-y-3"
      >
        {messages.length === 0 ? (
          <div className="text-[#5a5a7a] text-center py-8">
            <div className="text-4xl mb-2">💭</div>
            <p>작업을 입력하면</p>
            <p>에이전트들의 대화가</p>
            <p>여기에 표시됩니다.</p>
          </div>
        ) : (
          messages.map((message) => (
            <div key={message.id} className="flex gap-2">
              {/* 에이전트 아바타 */}
              <div
                className="w-8 h-8 flex items-center justify-center flex-shrink-0 border-2"
                style={{
                  backgroundColor: getAgentColor(message.from),
                  borderColor: '#000',
                }}
              >
                <span className="text-xs">
                  {message.from.charAt(0)}
                </span>
              </div>

              {/* 메시지 내용 */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="text-sm font-bold"
                    style={{ color: getAgentColor(message.from) }}
                  >
                    {AGENT_NAMES[message.from]}
                  </span>
                  <span className="text-[#5a5a7a] text-xs">
                    → {AGENT_NAMES[message.to].split(' ')[0]}
                  </span>
                </div>
                <div className="text-[#c0c0c0] text-sm leading-relaxed bg-[#0a0a1a] p-2 border-2 border-[#2a2a4a]">
                  {formatContent(message.content)}
                </div>
              </div>
            </div>
          ))
        )}

        {isLoading && (
          <div className="flex items-center gap-2 text-[#8a8aaa]">
            <span className="pixel-blink">▌</span>
            <span>에이전트가 응답 중...</span>
          </div>
        )}
      </div>
    </div>
  );
}
