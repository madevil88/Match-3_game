# Match-3 Game — Claude Code Instructions

## Project Overview
Browser-based Match-3 puzzle game. TypeScript + PixiJS 8 + GSAP 3, bundled with Webpack 5.

## Commands
- `npm start` — webpack-dev-server at http://127.0.0.1:8080
- `npm run build` — production build to `dist/`
- `npm test` — Jest unit tests
- `npm run e2e` — Playwright E2E tests (auto-starts dev server)

## Architecture
```
src/scripts/
  game/     — Board, Field, Game, GameTimer, ScoreManager, Tile
  system/   — App (PIXI bootstrap), Config (game params)
  utils.ts  — getSprite() factory
src/__tests__/  — Jest unit tests
src/__mocks__/  — pixi.js and gsap mocks for Jest
e2e/            — Playwright specs
```

## Key Conventions
- All game classes live in `src/scripts/game/`
- Config lives in `src/scripts/system/Config.ts` — edit this to change grid size, score, timer
- PIXI and gsap must be fully mocked in unit tests (`src/__mocks__/`)
- E2E tests run against the live webpack-dev-server via Playwright

## TypeScript
- `tsconfig.json` — for webpack/production (`"module": "ES2015"`)
- `tsconfig.jest.json` — for Jest (`"module": "CommonJS"`)
