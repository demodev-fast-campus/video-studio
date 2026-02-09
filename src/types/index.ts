// 에이전트 역할 타입
export type AgentRole = 'Director' | 'Producer' | 'Scriptwriter' | 'MotionDesigner' | 'QAReviewer' | 'Researcher';

// 모든 에이전트 역할 배열 (타입 안전)
export const ALL_AGENT_ROLES: AgentRole[] = ['Researcher', 'Director', 'Producer', 'Scriptwriter', 'MotionDesigner', 'QAReviewer'] as const;

// 제작 단계
export type Phase = 'research' | 'pre-production' | 'production' | 'post-production' | 'completed';

// 단계 순서 배열 (타입 안전)
export const PHASE_ORDER: Phase[] = ['research', 'pre-production', 'production', 'post-production', 'completed'] as const;

// 에이전트 상태
export interface AgentState {
  id: string;
  role: AgentRole;
  name: string;
  x: number;
  y: number;
  isActive: boolean;
  currentTask?: string;
}

// 메시지 타입
export interface ChatMessage {
  id: string;
  from: AgentRole;
  to: AgentRole;
  content: string;
  timestamp: number;
  phase: Phase;
}

// 채팅 체인 상태
export interface ChatChainState {
  phase: Phase;
  round: number;
  maxRounds: number;
  instructor: AgentRole;
  assistant: AgentRole;
  messages: ChatMessage[];
  isComplete: boolean;
}

// 프로젝트 상태
export interface ProjectState {
  task: string;
  currentPhase: Phase;
  compositionData: string;
  conceptDoc: string;
  reviewResults: string;
  chatHistory: ChatMessage[];
}

// 에이전트 위치 설정
export const AGENT_POSITIONS: Record<AgentRole, { x: number; y: number }> = {
  Researcher: { x: 230, y: 120 },
  Director: { x: 620, y: 120 },
  Producer: { x: 620, y: 210 },
  Scriptwriter: { x: 230, y: 400 },
  MotionDesigner: { x: 330, y: 400 },
  QAReviewer: { x: 650, y: 400 },
};

// 에이전트 색상
export const AGENT_COLORS: Record<AgentRole, number> = {
  Researcher: 0x00bcd4,    // 시안/틸
  Director: 0x4a90d9,      // 파랑
  Producer: 0x50c878,      // 초록
  Scriptwriter: 0xffa500,  // 주황
  MotionDesigner: 0x9370db, // 보라
  QAReviewer: 0xff6b6b,    // 빨강
};

// 에이전트 이름
export const AGENT_NAMES: Record<AgentRole, string> = {
  Researcher: 'Frank (리서처)',
  Director: 'Alice (감독)',
  Producer: 'Bob (프로듀서)',
  Scriptwriter: 'Charlie (작가)',
  MotionDesigner: 'Diana (모션)',
  QAReviewer: 'Eve (QA)',
};

// 에이전트 스프라이트 매핑
export const AGENT_SPRITES: Record<AgentRole, string> = {
  Researcher: 'worker1',
  Director: 'boss',
  Producer: 'worker1',
  Scriptwriter: 'worker2',
  MotionDesigner: 'worker4',
  QAReviewer: 'julia',
};
