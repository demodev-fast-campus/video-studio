# Video Studio

게더타운 스타일 2D 오피스에서 멀티 에이전트가 협업해 영상 시나리오(JSON)를 만들고, Remotion으로 미리보기/다운로드까지 수행하는 실험형 웹 앱입니다.

- 에셋 출처: [Free Office Pixel Art](https://arlantr.itch.io/free-office-pixel-art)

## 핵심 기능

- Phaser 기반 가상 오피스에서 에이전트 이동/대화 시각화
- `research -> pre-production -> production -> post-production` 페이즈 파이프라인
- Anthropic Claude 기반 멀티 에이전트 대화 스트리밍(SSE)
- 웹 검색 컨텍스트 주입(Tavily 우선, 실패 시 DuckDuckGo)
- Remotion Player 미리보기 + WebM 렌더링 다운로드
- 시뮬레이션 모드(LLM 키 없이 동작) 지원

## 에이전트 역할

| Role           | 설명                               |
| -------------- | ---------------------------------- |
| Researcher     | 웹 검색을 통해 주제 핵심 정보 조사 |
| Director       | 크리에이티브 방향 설정             |
| Producer       | 제작 계획 구체화                   |
| Scriptwriter   | 영상 구성 JSON 작성                |
| MotionDesigner | 구성 검토 및 보완                  |
| QAReviewer     | 최종 결과 검증                     |

## 실행 방법

### 1. 의존성 설치

```bash
pnpm install
```

### 2. 환경 변수 준비

```bash
cp .env.example .env.local
```

`.env.local` 예시:

```bash
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

### 3. 개발 서버 실행

```bash
pnpm dev
```

브라우저에서 `http://localhost:3000` 접속.

## 사용 흐름

1. 우측 패널에 제작할 영상 주제를 입력
2. 필요 시 설정에서 API Key/Model/Simulation Mode 설정
3. `시작` 버튼 클릭
4. 대화 탭에서 에이전트 협업 로그 확인
5. 영상 탭에서 Remotion 프리뷰 확인 및 WebM 다운로드

## API 엔드포인트

- `POST /api/develop`: 멀티 에이전트 파이프라인 실행(SSE)
- `POST /api/models`: Anthropic 모델 목록 조회(12시간 캐시)

## 프로젝트 구조

```text
src/
├── app/
│   ├── page.tsx
│   ├── layout.tsx
│   └── api/
│       ├── develop/route.ts
│       └── models/route.ts
├── agents/
│   ├── roles/
│   └── types.ts
├── components/
│   ├── GameCanvas.tsx
│   ├── ChatPanel.tsx
│   ├── VideoOutput.tsx
│   ├── ProgressBar.tsx
│   └── SettingsModal.tsx
├── game/
│   ├── scenes/
│   ├── entities/
│   └── main.tsx
├── hooks/
├── lib/
└── remotion/
```

## 기술 스택

- Next.js 16 (App Router), React 19, TypeScript
- Phaser 3
- Remotion 4 (`@remotion/player`, `@remotion/web-renderer`)
- Anthropic SDK
- Tailwind CSS 4

## 라이선스

MIT
