# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Video Studio - A Next.js web application that visualizes multi-agent video production collaboration using Anthropic's Claude API. Styled like a tycoon business simulation game with Gather Town-like 2D studio visualization powered by Phaser 3. Outputs Remotion-based motion graphic/presentation videos.

## Commands

```bash
pnpm dev       # Start dev server (port 3000)
pnpm build     # Production build
pnpm start     # Run production server
pnpm lint      # Run ESLint
```

## Architecture

### UI Layout

- **Background**: Phaser game canvas (900x550) showing 2D studio with pixel art sprites
- **Sidebar (overlay)**: Collapsible control panel (300-700px width) with project input, chat/video tabs, settings
- Game area shifts left when sidebar is open via `paddingRight`

### Multi-Phase Production Workflow

```
Research Phase: Researcher (Frank) ↔ Director (Alice)
  → Pre-production Phase: Director (Alice) ↔ Producer (Bob)
  → Production Phase: Producer ↔ Scriptwriter (Charlie), Scriptwriter ↔ MotionDesigner (Diana)
  → Post-production Phase: MotionDesigner ↔ QAReviewer (Eve)
```

### Dual-Agent Pattern

Each phase uses instructor-assistant pairs:
- **Instructor**: Provides directions and requirements
- **Assistant**: Executes tasks and returns results
- Terminates after: `<TASK_DONE>` marker, max 3 rounds, or 2 identical responses

### Key Directories

- `/src/app/` - Next.js App Router pages and API routes
- `/src/app/api/develop/route.ts` - Main SSE endpoint for multi-phase production
- `/src/app/api/render-video/route.ts` - MP4 rendering endpoint using @remotion/renderer
- `/src/agents/` - Multi-agent orchestration and role definitions
- `/src/agents/roles/` - Agent system prompts (Researcher, Director, Producer, Scriptwriter, MotionDesigner, QAReviewer)
- `/src/game/` - Phaser game layer (scenes, entities, event bus)
- `/src/components/` - React UI components
- `/src/types/index.ts` - Type definitions + agent colors, positions, names, sprites
- `/src/types/remotion.ts` - VideoScene, VideoCompositionProps types
- `/src/remotion/` - Remotion composition and scene components

### Agent Roles

| Role | Name | Sprite | Color | Description |
|------|------|--------|-------|-------------|
| Researcher | Frank | worker1 | 0x00bcd4 | Web research, topic analysis |
| Director | Alice | boss | 0x4a90d9 | Creative vision, concept brief |
| Producer | Bob | worker1 | 0x50c878 | Production planning, scene specs |
| Scriptwriter | Charlie | worker2 | 0xffa500 | VideoCompositionProps JSON creation |
| MotionDesigner | Diana | worker4 | 0x9370db | Visual review, timing/color refinement |
| QAReviewer | Eve | julia | 0xff6b6b | Final validation, JSON verification |

### Production Phases

| Phase | Label | Description |
|-------|-------|-------------|
| research | 리서치 | Researcher ↔ Director web research analysis |
| pre-production | 기획 | Director ↔ Producer concept discussion |
| production | 제작 | Script JSON creation + motion design review |
| post-production | 후반작업 | QA validation and final approval |
| completed | 완료 | All phases done |

### React ↔ Phaser Communication

`/src/game/utils/EventBus.ts` - Custom EventEmitter for bidirectional communication:
- `GAME_READY`: Game initialization complete
- `START_CONVERSATION`: Phase begins with new agent pair
- `SHOW_BUBBLE`: Display agent speech bubble
- `SET_AGENT_ACTIVE`: Toggle agent animation state

### API Key & Model Handling

- Client stores key in localStorage (`chatdev_anthropic_api_key`)
- Client stores selected model in localStorage (`chatdev_selected_model`)
- Client stores simulation mode flag in localStorage (`chatdev_simulation_mode`)
- Client stores Tavily API key in localStorage (`chatdev_tavily_api_key`)
- Server uses request body `apiKey` or falls back to `process.env.ANTHROPIC_API_KEY`
- `createAnthropicClient(apiKey, model)` factory in `/src/lib/anthropic.ts`
- Default model: `claude-haiku-4-5-20251001`
- Models API: `/api/models` - fetches available models from Anthropic API

### Simulation Mode

- Allows testing the UI without API calls
- Toggle via Settings modal
- Uses mock conversations from `/src/lib/mockResponses.ts`
- Streams pre-defined agent dialogues with realistic delays

### Output Format

The system produces `VideoCompositionProps` JSON:
- Rendered as Remotion Player preview in the sidebar
- Can be downloaded as MP4 via `/api/render-video` endpoint
- JSON structure: title, scenes[], colorScheme, fps, totalDurationInFrames

### Development Flow (API)

The `/api/develop` endpoint uses SSE for real-time streaming:
- Four phases executed sequentially: `research` → `pre-production` → `production` → `post-production`
- Research phase performs web search (Tavily/DuckDuckGo) and injects results as context
- Each phase runs instructor-assistant chat pairs with max 3 rounds
- Stops when: `<TASK_DONE>` received, max rounds reached, or same response sent twice
- Composition JSON extracted from all messages (reverse order) using `/src/lib/compositionExtractor.ts`
- SSE events: `phaseChange`, `message`, `roundProgress`, `complete`, `error`

## Critical Constraints

1. **Browser Environment Error**: Anthropic SDK blocks client-side usage. Keep Claude API calls in `/api/*` routes only.

2. **Game Canvas SSR**: `/components/GameCanvas.tsx` must use `dynamic()` with `ssr: false` - Phaser requires DOM access.

3. **Remotion SSR**: `@remotion/renderer` and `@remotion/bundler` are server-only packages, configured in `next.config.ts` as `serverExternalPackages`.

4. **Environment**: API key can be set via UI settings modal or `ANTHROPIC_API_KEY` in `.env.local`

## Key Files to Start With

1. `/src/app/page.tsx` - Main UI entry point and state orchestration
2. `/src/app/api/develop/route.ts` - Multi-phase production orchestrator
3. `/src/agents/types.ts` - PHASE_PAIRS workflow definition
4. `/src/types/index.ts` - Agent configuration maps
5. `/src/types/remotion.ts` - Video composition type definitions
6. `/src/game/scenes/OfficeScene.ts` - Studio layout and furniture placement

## Remotion Integration

### Composition Structure
- `/src/remotion/VideoComposition.tsx` - Main composition rendering scenes as Sequences
- `/src/remotion/scenes/TitleScene.tsx` - Title card with spring animation
- `/src/remotion/scenes/ContentScene.tsx` - Content slides with text + background
- `/src/remotion/scenes/OutroScene.tsx` - Outro/credits scene
- `/src/remotion/utils/animations.ts` - Transition helpers (fade/slide/zoom)

### Rendering
- Remotion Player for preview in VideoOutput component
- `/api/render-video` for MP4 export using `@remotion/bundler` + `@remotion/renderer`

## Hooks (`/src/hooks/`)
- `useResizable.ts` - Sidebar resize logic
- `useSettings.ts` - API key, model, simulation mode, Tavily API key (localStorage sync)
- `useGameEvents.ts` - Phaser EventBus helpers
- `useDevelopmentStream.ts` - SSE stream processing for production workflow

## Shared Utilities (`/src/lib/`)
- `completion.ts` - TASK_DONE_MARKER, MAX_SAME_RESPONSE_COUNT, checkCompletion()
- `sseEncoder.ts` - SSEEncoder class, SSE_HEADERS
- `messageBuilder.ts` - buildInstructorMessages(), buildAssistantMessages(), createChatMessage()
- `compositionExtractor.ts` - extractCompositionProps(), createFallbackComposition()
- `webSearch.ts` - performWebSearch() using Tavily and DuckDuckGo

## Components (`/src/components/`)
- `VideoOutput.tsx` - Remotion Player preview + MP4 download + JSON code view
- `ChatPanel.tsx` - Agent conversation display
- `ProgressBar.tsx` - Phase progress (리서치/기획/제작/후반작업)
- `GameCanvas.tsx` - Phaser wrapper with SSR disabled

## Phaser Studio Layout

Room labels:
- `RESEARCH LAB` (research) - top-left
- `DIRECTOR ROOM` (pre-production) - top-right
- `EDITING SUITE` (production) - bottom-left
- `PREVIEW ROOM` (post-production) - bottom-right

Title: `VIDEO STUDIO`
