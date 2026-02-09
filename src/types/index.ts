// 에이전트 역할 타입
export type AgentRole = 'CEO' | 'CTO' | 'Programmer' | 'Reviewer' | 'Tester';

// 모든 에이전트 역할 배열 (타입 안전)
export const ALL_AGENT_ROLES: AgentRole[] = ['CEO', 'CTO', 'Programmer', 'Reviewer', 'Tester'] as const;

// 개발 단계
export type Phase = 'design' | 'coding' | 'testing' | 'completed';

// 단계 순서 배열 (타입 안전)
export const PHASE_ORDER: Phase[] = ['design', 'coding', 'testing', 'completed'] as const;

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
  generatedCode: string;
  designDoc: string;
  testResults: string;
  chatHistory: ChatMessage[];
}

// 에이전트 위치 설정
export const AGENT_POSITIONS: Record<AgentRole, { x: number; y: number }> = {
  CEO: { x: 200, y: 150 },
  CTO: { x: 350, y: 150 },
  Programmer: { x: 500, y: 300 },
  Reviewer: { x: 350, y: 300 },
  Tester: { x: 200, y: 300 },
};

// 에이전트 색상
export const AGENT_COLORS: Record<AgentRole, number> = {
  CEO: 0x4a90d9,      // 파랑
  CTO: 0x50c878,      // 초록
  Programmer: 0xffa500, // 주황
  Reviewer: 0x9370db,  // 보라
  Tester: 0xff6b6b,   // 빨강
};

// 에이전트 이름
export const AGENT_NAMES: Record<AgentRole, string> = {
  CEO: 'Alice (CEO)',
  CTO: 'Bob (CTO)',
  Programmer: 'Charlie (Dev)',
  Reviewer: 'Diana (Reviewer)',
  Tester: 'Eve (Tester)',
};

// 에이전트 스프라이트 매핑
export const AGENT_SPRITES: Record<AgentRole, string> = {
  CEO: 'boss',
  CTO: 'worker1',
  Programmer: 'worker2',
  Reviewer: 'worker4',
  Tester: 'julia',
};
