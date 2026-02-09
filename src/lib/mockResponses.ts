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
    // Research Phase: Researcher ↔ Director
    {
      phase: 'research',
      instructor: 'Researcher',
      assistant: 'Director',
      exchanges: [
        {
          from: 'Researcher',
          to: 'Director',
          content: `안녕하세요 감독님! "${task}"에 대한 리서치 리포트를 준비했습니다.

## 리서치 리포트: "${task}"

### 1. 주제 개요
"${task}"는 현재 디지털 콘텐츠 업계에서 주목받고 있는 주제입니다.

### 2. 최신 트렌드
- 숏폼 콘텐츠와 모션 그래픽의 결합이 증가
- AI 기반 영상 제작 도구의 급성장
- 데이터 시각화를 통한 스토리텔링 확대

### 3. 핵심 데이터
- 영상 콘텐츠 소비율: 전년 대비 30% 증가
- 모션 그래픽 시장 규모: 연평균 8.5% 성장
- 평균 시청 지속 시간: 15초 이내 최적

### 4. 영상 제작 제안
- 핵심 메시지를 3-5개 장면으로 간결하게 구성
- 다크 배경 + 밝은 액센트 색상 조합 권장
- 각 장면 2-4초로 집중력 유지

이 리서치를 바탕으로 크리에이티브 방향을 설정해주세요. <TASK_DONE>`,
        },
        {
          from: 'Director',
          to: 'Researcher',
          content: `좋은 리서치 감사합니다! 핵심 데이터와 트렌드를 잘 정리해주셨네요.

이 리서치를 바탕으로 영상 컨셉을 수립하겠습니다.

주요 반영 사항:
- 15초 이내 최적 → 총 15초(450프레임) 구성
- 3-5개 장면 → 5개 장면 구성
- 다크 배경 + 밝은 액센트 색상 적용

프로듀서에게 구체적인 컨셉 브리프를 전달하겠습니다. <TASK_DONE>`,
        },
      ],
    },
    // Pre-production Phase: Director ↔ Producer
    {
      phase: 'pre-production',
      instructor: 'Director',
      assistant: 'Producer',
      exchanges: [
        {
          from: 'Director',
          to: 'Producer',
          content: `프로듀서님, "${task}" 영상의 컨셉 브리프입니다.

## 컨셉 브리프
- **목적**: "${task}"를 시각적으로 전달하는 모션 그래픽 영상
- **톤 & 무드**: 전문적이면서도 현대적인 느낌
- **색상 방향**: 다크 배경에 블루/그린 액센트
- **장면 구성**: 타이틀 → 핵심 내용 3장면 → 아웃트로
- **총 길이**: 15초 (450프레임, 30fps)

제작 계획을 수립해주세요.`,
        },
        {
          from: 'Producer',
          to: 'Director',
          content: `네, 감독님. 제작 계획을 수립했습니다.

## 제작 계획
- **총 길이**: 15초 (450프레임, 30fps)
- **장면 수**: 5개
- **컬러 스킴**: 다크 네이비 + 블루/그린 액센트

## 장면 구성
1. **타이틀 카드** (3초) - fade
2. **핵심 메시지 1** (3초) - slide
3. **핵심 메시지 2** (3초) - zoom
4. **핵심 메시지 3** (3초) - slide
5. **아웃트로** (3초) - fade

작가에게 전달하겠습니다. <TASK_DONE>`,
        },
      ],
    },
    // Production Phase 1: Producer ↔ Scriptwriter
    {
      phase: 'production',
      instructor: 'Producer',
      assistant: 'Scriptwriter',
      exchanges: [
        {
          from: 'Producer',
          to: 'Scriptwriter',
          content: `작가님, "${task}" 영상 스크립트를 JSON으로 작성해주세요.

## 제작 명세
- 5개 장면, 30fps, 총 450프레임
- 컬러: primary=#4a90d9, secondary=#50c878, background=#0a0a1a, text=#ffffff
- 각 장면 90프레임 (3초)`,
        },
        {
          from: 'Scriptwriter',
          to: 'Producer',
          content: `스크립트를 작성했습니다.

\`\`\`json
{
  "title": "${task}",
  "scenes": [
    {
      "id": "scene-1",
      "title": "${task}",
      "content": "AI 기술로 만드는 새로운 영상 경험",
      "durationInFrames": 90,
      "transition": "fade",
      "backgroundColor": "#1a1a2e",
      "textColor": "#ffffff"
    },
    {
      "id": "scene-2",
      "title": "혁신적인 접근",
      "content": "멀티 에이전트 협업으로 완성되는 영상",
      "durationInFrames": 90,
      "transition": "slide",
      "backgroundColor": "#16213e",
      "textColor": "#e0e0e0"
    },
    {
      "id": "scene-3",
      "title": "핵심 기술",
      "content": "AI가 기획부터 제작까지 자동으로 처리",
      "durationInFrames": 90,
      "transition": "zoom",
      "backgroundColor": "#0f3460",
      "textColor": "#ffffff"
    },
    {
      "id": "scene-4",
      "title": "무한한 가능성",
      "content": "당신의 아이디어를 영상으로 실현합니다",
      "durationInFrames": 90,
      "transition": "slide",
      "backgroundColor": "#16213e",
      "textColor": "#e0e0e0"
    },
    {
      "id": "scene-5",
      "title": "감사합니다",
      "content": "Video Studio와 함께하세요",
      "durationInFrames": 90,
      "transition": "fade",
      "backgroundColor": "#1a1a2e",
      "textColor": "#ffffff"
    }
  ],
  "colorScheme": {
    "primary": "#4a90d9",
    "secondary": "#50c878",
    "background": "#0a0a1a",
    "text": "#ffffff"
  },
  "fps": 30,
  "totalDurationInFrames": 450
}
\`\`\`

모션 디자이너에게 검토를 요청하겠습니다. <TASK_DONE>`,
        },
      ],
    },
    // Production Phase 2: Scriptwriter ↔ MotionDesigner
    {
      phase: 'production',
      instructor: 'Scriptwriter',
      assistant: 'MotionDesigner',
      exchanges: [
        {
          from: 'Scriptwriter',
          to: 'MotionDesigner',
          content: `모션 디자이너님, 영상 스크립트 JSON을 검토해주세요.

주요 포인트:
- 5개 장면, 총 15초
- fade/slide/zoom 전환 효과 혼합
- 다크 네이비 계열 배경색`,
        },
        {
          from: 'MotionDesigner',
          to: 'Scriptwriter',
          content: `검토 완료했습니다.

## 검토 결과
1. 장면 흐름이 자연스럽습니다
2. 전환 효과가 다양하게 적용되어 있습니다
3. 컬러 톤이 일관됩니다

전체적으로 양호합니다. QA에게 전달하겠습니다. <TASK_DONE>`,
        },
      ],
    },
    // Post-production Phase: MotionDesigner ↔ QAReviewer
    {
      phase: 'post-production',
      instructor: 'MotionDesigner',
      assistant: 'QAReviewer',
      exchanges: [
        {
          from: 'MotionDesigner',
          to: 'QAReviewer',
          content: `QA 리뷰어님, 최종 영상 스크립트 JSON을 검증해주세요.

검증 포인트:
- JSON 유효성
- 타이밍 일관성
- 색상 코드 유효성`,
        },
        {
          from: 'QAReviewer',
          to: 'MotionDesigner',
          content: `최종 검증을 완료했습니다.

## 검증 결과: PASS

| 항목 | 상태 | 비고 |
|------|------|------|
| JSON 유효성 | PASS | 구조 정상 |
| 타이밍 검증 | PASS | 90x5 = 450 프레임 일치 |
| 장면 수 | PASS | 5개 장면 |
| 색상 유효성 | PASS | 모든 hex 코드 유효 |

최종 승인합니다. <TASK_DONE>`,
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
