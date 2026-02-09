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

// 전체 제작 결과
export interface DevelopmentResult {
  task: string;
  conceptDoc: string;
  compositionCode: string;
  review: string;
  reviewResults: string;
  phases: PhaseResult[];
}

// 에이전트 역할별 설명
export const AGENT_DESCRIPTIONS: Record<AgentRole, string> = {
  Researcher: '리서처로서 웹 검색을 통해 주제에 대한 핵심 정보를 조사합니다.',
  Director: '영상 감독으로서 크리에이티브 비전을 설정하고 방향을 제시합니다.',
  Producer: '프로듀서로서 비전을 구체적인 제작 계획으로 변환합니다.',
  Scriptwriter: '작가로서 영상 구성 스크립트를 JSON 형식으로 작성합니다.',
  MotionDesigner: '모션 디자이너로서 스크립트를 검토하고 보완합니다.',
  QAReviewer: 'QA 리뷰어로서 최종 결과물을 검증합니다.',
};

// 단계별 대화 쌍 정의
export const PHASE_PAIRS: Record<Phase, { instructor: AgentRole; assistant: AgentRole }[]> = {
  'research': [
    { instructor: 'Researcher', assistant: 'Director' },
  ],
  'pre-production': [
    { instructor: 'Director', assistant: 'Producer' },
  ],
  'production': [
    { instructor: 'Producer', assistant: 'Scriptwriter' },
    { instructor: 'Scriptwriter', assistant: 'MotionDesigner' },
  ],
  'post-production': [
    { instructor: 'MotionDesigner', assistant: 'QAReviewer' },
  ],
  'completed': [],
};
