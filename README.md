# Match-3 Game

A browser-based Match-3 puzzle game built with TypeScript, PixiJS, and GSAP.

## Gameplay

- An 8×8 grid of coloured tiles is displayed.
- Click a tile to select it, then click an adjacent tile to swap them.
- When 3 or more tiles of the same colour align horizontally or vertically, they are removed and new tiles fall in from above.
- Chain reactions are resolved automatically.
- **Win:** reduce the score counter to 0 before the timer runs out.
- **Lose:** the timer reaches 0.

## Tech Stack

| Tool | Purpose |
|------|---------|
| [PixiJS 8](https://pixijs.com/) | 2D WebGL renderer |
| [GSAP 3](https://gsap.com/) | Tile movement and UI animations |
| TypeScript 5 | Type-safe source |
| Webpack 5 | Bundling and dev server |
| Jest 29 + ts-jest | Unit tests |
| Playwright 1.55 | End-to-end tests |

## Project Structure

```
src/
  scripts/
    game/
      Board.ts          — field grid, tile creation, match detection
      Field.ts          — single grid cell
      Game.ts           — game loop, swap logic, tile fall
      GameTimer.ts      — countdown timer
      ScoreManager.ts   — score display and win/lose overlay
      Tile.ts           — individual tile with animation helpers
    system/
      App.ts            — PixiJS application bootstrap
      Config.ts         — game configuration (grid size, win score, timer)
    utils.ts            — sprite factory
  __tests__/            — Jest unit tests
  __mocks__/            — pixi.js and gsap mocks for Jest
e2e/                    — Playwright end-to-end tests
assets/                 — images and HTML template
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Install

```bash
npm install
```

### Run (development)

```bash
npm start
# Opens at http://127.0.0.1:8080
```

### Build (production)

```bash
npm run build
# Output in dist/
```

## Tests

### Unit tests

```bash
npm test
```

Tests cover core game logic — `Tile`, `Field`, `Board` (match detection, swap), `GameTimer`, and `ScoreManager`.

### E2E tests

Playwright tests run against the live dev server (started automatically):

```bash
npm run e2e
```

## Configuration

Edit [src/scripts/system/Config.ts](src/scripts/system/Config.ts) to adjust game parameters:

```typescript
boardParams: { rows: 8, cols: 8 }  // grid dimensions
winScore: 10                        // matches required to win
gameTime: 15                        // seconds per round
tilesColors: [...]                  // tile colour set
```

## Deployment

The project includes a `vercel.json` for zero-config deployment on [Vercel](https://vercel.com/):

```bash
vercel
```
