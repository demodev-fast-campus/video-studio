import { AgentRole, ChatMessage, Phase } from '@/types';

// Mock conversation data for simulation/demo mode
interface MockConversation {
  phase: Phase;
  instructor: AgentRole;
  assistant: AgentRole;
  exchanges: Array<{
    from: AgentRole;
    to: AgentRole;
    content: string;
  }>;
}

export function generateMockConversations(task: string): MockConversation[] {
  return [
    // Design Phase: CEO ↔ CTO
    {
      phase: 'design',
      instructor: 'CEO',
      assistant: 'CTO',
      exchanges: [
        {
          from: 'CEO',
          to: 'CTO',
          content: `안녕하세요! 오늘 우리가 개발할 프로젝트는 "${task}"입니다.

이 프로젝트의 기술적인 요구사항과 아키텍처를 설계해주세요. 어떤 기술 스택을 사용하면 좋을까요?`,
        },
        {
          from: 'CTO',
          to: 'CEO',
          content: `네, CEO님. "${task}" 프로젝트를 분석해봤습니다.

## 기술 스택 제안
- **프론트엔드**: React + TypeScript
- **스타일링**: Tailwind CSS
- **상태 관리**: React hooks (useState, useEffect)

## 핵심 기능
1. 사용자 인터페이스 구현
2. 데이터 처리 로직
3. 반응형 디자인

이 스택으로 진행해도 될까요?`,
        },
        {
          from: 'CEO',
          to: 'CTO',
          content: `좋습니다! 제안하신 기술 스택이 적절해 보입니다.

추가로 고려해야 할 사항:
1. 사용자 경험 최적화
2. 성능 고려
3. 확장성

이 방향으로 개발을 진행해주세요. <TASK_DONE>`,
        },
        {
          from: 'CTO',
          to: 'CEO',
          content: `네, 알겠습니다. 설계가 완료되었습니다.

## 최종 설계 요약
- React + TypeScript 기반 SPA
- Tailwind CSS로 반응형 UI
- 모듈화된 컴포넌트 구조

이제 Programmer에게 구현을 요청하겠습니다. <TASK_DONE>`,
        },
      ],
    },
    // Coding Phase: CTO ↔ Programmer
    {
      phase: 'coding',
      instructor: 'CTO',
      assistant: 'Programmer',
      exchanges: [
        {
          from: 'CTO',
          to: 'Programmer',
          content: `Programmer님, 다음 프로젝트를 구현해주세요: "${task}"

## 기술 요구사항
- React + TypeScript
- Tailwind CSS
- 단일 컴포넌트로 구현

시작해주세요!`,
        },
        {
          from: 'Programmer',
          to: 'CTO',
          content: `네, CTO님. 코드를 작성하겠습니다.

\`\`\`tsx
import React, { useState } from 'react';

interface AppProps {
  title?: string;
}

export default function App({ title = "${task}" }: AppProps) {
  const [count, setCount] = useState(0);
  const [isActive, setIsActive] = useState(false);

  const handleClick = () => {
    setCount(prev => prev + 1);
    setIsActive(true);
    setTimeout(() => setIsActive(false), 200);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          {title}
        </h1>

        <div className="text-center mb-6">
          <span className={\`text-6xl font-bold transition-transform \${isActive ? 'scale-110' : 'scale-100'}\`}>
            {count}
          </span>
        </div>

        <button
          onClick={handleClick}
          className="w-full py-3 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors shadow-md hover:shadow-lg"
        >
          Click me!
        </button>

        <p className="text-gray-500 text-sm text-center mt-4">
          Built with React + TypeScript + Tailwind CSS
        </p>
      </div>
    </div>
  );
}
\`\`\`

구현이 완료되었습니다. 리뷰 부탁드립니다. <TASK_DONE>`,
        },
      ],
    },
    // Testing Phase: Programmer ↔ Reviewer
    {
      phase: 'testing',
      instructor: 'Programmer',
      assistant: 'Reviewer',
      exchanges: [
        {
          from: 'Programmer',
          to: 'Reviewer',
          content: `Reviewer님, 방금 작성한 코드 리뷰 부탁드립니다.

주요 구현 사항:
- React 함수형 컴포넌트
- TypeScript 타입 정의
- Tailwind CSS 스타일링
- 상태 관리 (useState)`,
        },
        {
          from: 'Reviewer',
          to: 'Programmer',
          content: `코드 리뷰를 완료했습니다.

## 리뷰 결과: ✅ 승인

### 장점
1. 깔끔한 컴포넌트 구조
2. 적절한 TypeScript 타입 사용
3. 반응형 디자인 적용
4. 접근성 고려 (버튼 상호작용)

### 개선 제안 (선택사항)
- 애니메이션 효과가 적절함
- 에러 바운더리 추가 고려

전체적으로 잘 작성된 코드입니다. <TASK_DONE>`,
        },
      ],
    },
  ];
}

export function createMockMessage(
  exchange: MockConversation['exchanges'][0],
  phase: Phase
): ChatMessage {
  return {
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    from: exchange.from,
    to: exchange.to,
    content: exchange.content,
    timestamp: Date.now(),
    phase,
  };
}

// Delay utility for simulating streaming
export const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
