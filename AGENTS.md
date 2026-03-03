# Repository Guidelines

## Project Structure & Module Organization

This repository is a Next.js App Router project with a Phaser game layer and Remotion rendering pipeline.

- `src/app`: routes, layout, global styles, and API endpoints (`api/develop`, `api/models`)
- `src/components`: UI panels and shared view components
- `src/game`: Phaser scenes, entities, and runtime config
- `src/agents`: multi-agent role prompts and orchestration types
- `src/lib`: LLM/web-search/SSE/composition utilities
- `src/remotion`: video composition root and scene components
- `src/hooks`, `src/types`: reusable state hooks and shared TypeScript types
- `public/assets`: pixel-art sprites/backgrounds

## Build, Test, and Development Commands

Use `pnpm` only.

- `pnpm install`: install dependencies
- `pnpm dev`: run local development server on `http://localhost:3000`
- `pnpm build`: production build
- `pnpm start`: run production server
- `pnpm lint`: run ESLint checks
- `pnpm tsc --noEmit`: optional type-check pass

## Coding Style & Naming Conventions

- Language: TypeScript + React function components
- Indentation: 2 spaces
- Component files: `PascalCase.tsx` (e.g., `VideoOutput.tsx`)
- Hooks: `useXxx.ts` (e.g., `useDevelopmentStream.ts`)
- Utility modules: `camelCase.ts` (e.g., `compositionExtractor.ts`)
- Keep modules focused; prefer small utility functions over monolithic files.

## Testing Guidelines

Automated tests are not configured yet. Until a test framework is introduced:

- run `pnpm lint` and `pnpm tsc --noEmit` before PR
- manually verify key flows: task input, SSE chat updates, video preview, WebM download
- include repro steps for fixed bugs in PR description

## Commit & Pull Request Guidelines

Recent history uses short version-style commits (`v2`, `v3`, `v4`). For new work, use descriptive commits:

- `feat: add Tavily fallback handling`
- `fix: prevent duplicate round progress events`

PRs should include: purpose, changed files/modules, manual test evidence (screenshots/GIF for UI), and linked issue/task if available.

## Security & Configuration Tips

- Keep secrets in `.env.local`; never commit API keys.
- Required: `ANTHROPIC_API_KEY` (or simulation mode).
- Optional: Tavily key for improved web search context.
- Text files must use UTF-8 (`문자 인코딩: UTF-8`).
