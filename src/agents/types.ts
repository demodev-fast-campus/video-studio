import { AgentRole, Phase } from '@/types';

// 에이전트 시스템 프롬프트
export interface AgentSystemPrompt {
  role: AgentRole;
  systemPrompt: string;
  description: string;
}

// 채팅 체인 설정
export interface ChatChainConfig {
  phase: Phase;
  instructor: AgentRole;
  assistant: AgentRole;
  maxRounds: number;
  task: string;
  context?: string;
}

// 채팅 라운드 결과
export interface ChatRoundResult {
  instructorMessage: string;
  assistantResponse: string;
  round: number;
  isComplete: boolean;
}

// 페이즈 결과
export interface PhaseResult {
  phase: Phase;
  output: string;
  rounds: ChatRoundResult[];
  success: boolean;
}

// 전체 개발 결과
export interface DevelopmentResult {
  task: string;
  designDoc: string;
  code: string;
  review: string;
  testResults: string;
  phases: PhaseResult[];
}

// 에이전트 역할별 설명
export const AGENT_DESCRIPTIONS: Record<AgentRole, string> = {
  CEO: '회사의 CEO로서 비전을 제시하고 요구사항을 명확히 합니다.',
  CTO: 'CTO로서 기술적 결정을 내리고 아키텍처를 설계합니다.',
  Programmer: '프로그래머로서 실제 코드를 작성합니다.',
  Reviewer: '코드 리뷰어로서 코드 품질을 검토합니다.',
  Tester: '테스터로서 기능을 검증합니다.',
};

// 단계별 대화 쌍 정의
export const PHASE_PAIRS: Record<Phase, { instructor: AgentRole; assistant: AgentRole }[]> = {
  design: [
    { instructor: 'CEO', assistant: 'CTO' },
  ],
  coding: [
    { instructor: 'CTO', assistant: 'Programmer' },
  ],
  testing: [
    { instructor: 'Programmer', assistant: 'Reviewer' },
    { instructor: 'Reviewer', assistant: 'Tester' },
  ],
  completed: [],
};
