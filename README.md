[에셋](https://arlantr.itch.io/free-office-pixel-art)

# ChatDev Office

게더타운 스타일의 2D 가상공간에서 ChatDev 방식의 멀티에이전트가 협업하여 소프트웨어를 개발하는 시각화 웹 서비스입니다.

## 기술 스택

- **Frontend**: Next.js 16 (App Router) + TypeScript
- **Game Engine**: Phaser 3 (dynamic import, SSR disabled)
- **LLM**: Anthropic Claude API (멀티에이전트)
- **Styling**: Tailwind CSS

## 에이전트 역할

| 에이전트             | 역할                              |
| -------------------- | --------------------------------- |
| CEO (Alice)          | 프로젝트 비전 제시, 요구사항 정의 |
| CTO (Bob)            | 기술적 결정, 아키텍처 설계        |
| Programmer (Charlie) | 코드 작성                         |
| Reviewer (Diana)     | 코드 리뷰                         |
| Tester (Eve)         | 테스트 수행                       |

## 개발 프로세스

1. **Design Phase**: CEO ↔ CTO (요구사항 분석, 아키텍처 설계)
2. **Coding Phase**: CTO ↔ Programmer (코드 작성)
3. **Testing Phase**: Programmer ↔ Reviewer ↔ Tester (리뷰 및 테스트)

## 설치 및 실행

### 1. 의존성 설치

```bash
pnpm install
```

### 2. 환경 변수 설정

`.env.local` 파일을 생성하고 Anthropic API 키를 설정하세요:

```bash
cp .env.example .env.local
# .env.local 파일을 편집하여 API 키 입력
```

```
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

### 3. 개발 서버 실행

```bash
pnpm dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

## 사용 방법

1. 텍스트 입력창에 만들고 싶은 프로그램을 설명합니다.
   - 예: "간단한 계산기 만들어줘"
   - 예: "할 일 목록 앱을 만들어줘"

2. "개발 시작" 버튼을 클릭합니다.

3. 에이전트들이 가상 오피스에서 이동하며 대화하는 것을 관찰합니다.

4. 개발이 완료되면 생성된 코드가 화면에 표시됩니다.

## 프로젝트 구조

```
src/
├── app/                      # Next.js App Router
│   ├── page.tsx              # 메인 페이지
│   ├── layout.tsx
│   └── api/chat/route.ts     # LLM API 엔드포인트
│
├── components/
│   ├── GameCanvas.tsx        # Phaser 게임 래퍼
│   ├── ChatPanel.tsx         # 에이전트 대화 패널
│   ├── AgentStatus.tsx       # 에이전트 상태 표시
│   ├── TaskProgress.tsx      # 작업 진행 상황
│   └── CodeOutput.tsx        # 생성된 코드 표시
│
├── game/
│   ├── main.tsx              # Phaser 게임 설정
│   ├── scenes/
│   │   ├── OfficeScene.ts    # 메인 오피스 씬
│   │   └── PreloadScene.ts   # 에셋 로딩
│   ├── entities/
│   │   └── Agent.ts          # 에이전트 스프라이트
│   ├── utils/
│   │   └── EventBus.ts       # React-Phaser 통신
│   └── config.ts             # 게임 설정
│
├── agents/
│   ├── types.ts              # 에이전트 타입 정의
│   ├── AgentManager.ts       # 에이전트 관리자
│   ├── ChatChain.ts          # ChatDev 채팅 체인
│   └── roles/                # 역할별 에이전트 프롬프트
│
├── lib/
│   └── anthropic.ts          # Claude API 클라이언트
│
└── types/
    └── index.ts              # 공통 타입
```

## 시각화 요소

- 에이전트가 맵에서 이동하며 대화
- 말풍선으로 현재 대화 표시
- 작업 단계별 에이전트 위치 변경 (회의실, 개발실 등)
- 실시간 코드 생성 결과 표시

## Dual-Agent 패턴

- **Instructor**: 지시 제공
- **Assistant**: 지시 수행 및 결과 반환
- 최대 10라운드 또는 2회 동일 결과 시 종료

## 라이선스

MIT
