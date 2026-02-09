# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ChatDev Office - A Next.js web application that visualizes multi-agent software development collaboration using Anthropic's Claude API. Styled like a tycoon business simulation game with Gather Town-like 2D office visualization powered by Phaser 3.

## Commands

```bash
pnpm dev       # Start dev server (port 3000)
pnpm build     # Production build
pnpm start     # Run production server
pnpm lint      # Run ESLint
```

## Architecture

### UI Layout

- **Background**: Phaser game canvas (900x550) showing 2D office with pixel art sprites
- **Sidebar (overlay)**: Collapsible control panel (300-700px width) with project input, chat/code tabs, settings
- Game area shifts left when sidebar is open via `paddingRight`

### Multi-Phase Development Workflow

```
Design Phase: CEO (Alice) ↔ CTO (Bob)
  → Coding Phase: CTO ↔ Programmer (Charlie)
  → Testing Phase: Programmer ↔ Reviewer (Diana) ↔ Tester (Eve)
```

### Dual-Agent Pattern

Each phase uses instructor-assistant pairs:
- **Instructor**: Provides directions and requirements
- **Assistant**: Executes tasks and returns results
- Terminates after: `<TASK_DONE>` marker, max 10 rounds, or 2 identical responses

### Key Directories

- `/src/app/` - Next.js App Router pages and API routes
- `/src/app/api/develop/route.ts` - Main SSE endpoint for multi-phase development
- `/src/agents/` - Multi-agent orchestration and role definitions
- `/src/agents/roles/` - Agent system prompts (CEO, CTO, Programmer, Reviewer, Tester)
- `/src/game/` - Phaser game layer (scenes, entities, event bus)
- `/src/components/` - React UI components
- `/src/types/index.ts` - Type definitions + agent colors, positions, names, sprites

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
- Server uses request body `apiKey` or falls back to `process.env.ANTHROPIC_API_KEY`
- `createAnthropicClient(apiKey, model)` factory in `/src/lib/anthropic.ts`
- Default model: `claude-haiku-4-5-20251001`
- Models API: `/api/models` - fetches available models from Anthropic API

### Simulation Mode

- Allows testing the UI without API calls
- Toggle via Settings modal
- Uses mock conversations from `/src/lib/mockResponses.ts`
- Streams pre-defined agent dialogues with realistic delays

### Development Flow (API)

The `/api/develop` endpoint uses SSE for real-time streaming:
- Three phases executed sequentially: `design` → `coding` → `testing`
- Each phase runs instructor-assistant chat pairs with max 10 rounds
- Stops when: `<TASK_DONE>` received, max rounds reached, or same response sent twice
- Code extracted using `/src/lib/codeExtractor.ts` (supports multi-file extraction)
- SSE events: `phaseChange`, `message`, `roundProgress`, `complete`, `error`

## Critical Constraints

1. **Browser Environment Error**: Anthropic SDK blocks client-side usage. Keep Claude API calls in `/api/*` routes only.

2. **Game Canvas SSR**: `/components/GameCanvas.tsx` must use `dynamic()` with `ssr: false` - Phaser requires DOM access.

3. **Environment**: API key can be set via UI settings modal or `ANTHROPIC_API_KEY` in `.env.local`

## Key Files to Start With

1. `/src/app/page.tsx` - Main UI entry point and state orchestration
2. `/src/app/api/develop/route.ts` - Multi-phase development orchestrator
3. `/src/agents/types.ts` - PHASE_PAIRS workflow definition
4. `/src/types/index.ts` - Agent configuration maps
5. `/src/game/scenes/OfficeScene.ts` - Office layout and furniture placement

## New Features (v2)

### Resizable Sidebar
- Drag the left edge of the sidebar to resize (300px-700px)
- Width saved to localStorage (`chatdev_sidebar_width`)
- Hook: `/src/hooks/useResizable.ts`

### Progress Bar
- Shows overall development progress (0-100%)
- Phase indicators (design, coding, testing)
- Component: `/src/components/ProgressBar.tsx`

### Enhanced Code Generation
- Improved agent prompts for complete, executable code
- Multi-file code extraction with filename detection
- `/src/lib/codeExtractor.ts` handles complex code blocks

## Refactored Structure (v3)

### Hooks (`/src/hooks/`)
- `useResizable.ts` - Sidebar resize logic
- `useSettings.ts` - API key, model, simulation mode (localStorage sync)
- `useGameEvents.ts` - Phaser EventBus helpers
- `useDevelopmentStream.ts` - SSE stream processing for development workflow

### Shared Utilities (`/src/lib/`)
- `completion.ts` - TASK_DONE_MARKER, MAX_SAME_RESPONSE_COUNT, checkCompletion()
- `sseEncoder.ts` - SSEEncoder class, SSE_HEADERS
- `messageBuilder.ts` - buildInstructorMessages(), buildAssistantMessages(), createChatMessage()
- `codeParser.ts` - parseCodeToFiles(), detectLanguage()
- `fileTreeBuilder.ts` - buildFileTree()

### Components (`/src/components/`)
- `FileTree.tsx` - FileTreeItem component, FILE_COLORS
- `CodeOutput.tsx` - Uses codeParser and fileTreeBuilder utilities

### Types (`/src/types/index.ts`)
- `ALL_AGENT_ROLES` - Type-safe array of all agent roles
- `PHASE_ORDER` - Type-safe array of phase order
