# Match-3 Code Review Bugfix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix 15 issues (3 CRITICAL, 8 WARNING, 3 INFO) found during code review of the Match-3 PixiJS game.

**Architecture:** All fixes are isolated to existing files — no new files created. Key structural change: add `destroy()` methods to `GameTimer`, `ScoreManager`, and `Game`; centralise `_isDisabled` management in `_swap`.

**Tech Stack:** TypeScript, PixiJS 8, GSAP 3, Webpack

---

## Files Modified

| File | Changes |
|------|---------|
| `src/scripts/game/Board.ts` | Fix RNG (`Uint8Array`), `getMatches` type, `readonly rows/cols` |
| `src/scripts/game/Tile.ts` | Remove double allocation of `sprite` |
| `src/scripts/game/Field.ts` | Add `clearTile()`, replace external `field.tile = undefined` calls |
| `src/scripts/game/GameTimer.ts` | Add `destroy()` |
| `src/scripts/game/ScoreManager.ts` | Remove `console.log`, fix Graphics API order, add `destroy()` |
| `src/scripts/game/Game.ts` | Fix `_isDisabled` flag, add `destroy()`, use `clearTile()` |
| `src/scripts/system/App.ts` | Fix `Assets.load` aliases, fix `import * as PIXI`, call `destroy()` on reset |

---

## Task 1: Fix biased RNG in Board.ts

**Files:**
- Modify: `src/scripts/game/Board.ts:6-10`

- [ ] **Step 1: Replace `Int8Array` with `Uint8Array` and correct divisor**

Replace the `getRandomRange` function (lines 6–10):

```ts
const getRandomRange = (min: number, max: number): number =>
    Math.floor(
        (window.crypto.getRandomValues(new Uint8Array(1))[0] / 255) *
        (max - min + 1)
    ) + min;
```

`Uint8Array` gives 0–255, dividing by 255 gives uniform [0, 1), `Math.floor(… * (max - min + 1)) + min` gives an unbiased integer in [min, max].

- [ ] **Step 2: Verify build passes**

```bash
cd /Users/serhiichernenko/Documents/work/Match-3_game && npm run build 2>&1 | tail -5
```

Expected: no TypeScript errors.

- [ ] **Step 3: Commit**

```bash
cd /Users/serhiichernenko/Documents/work/Match-3_game && git add src/scripts/game/Board.ts && git commit -m "fix: replace biased Int8Array RNG with Uint8Array/255"
```

---

## Task 2: Fix Assets loading without aliases in App.ts

**Files:**
- Modify: `src/scripts/system/App.ts:38-43`

- [ ] **Step 1: Pass full asset objects to `Assets.load`**

Replace `_loadSprites` method:

```ts
private async _loadSprites(
    assets: { alias: string; src: string }[],
): Promise<void> {
    await Assets.load(assets);
}
```

This registers each asset under its `alias` in the PixiJS cache, so `Assets.get(src)` resolves correctly.

- [ ] **Step 2: Verify build passes**

```bash
cd /Users/serhiichernenko/Documents/work/Match-3_game && npm run build 2>&1 | tail -5
```

- [ ] **Step 3: Commit**

```bash
cd /Users/serhiichernenko/Documents/work/Match-3_game && git add src/scripts/system/App.ts && git commit -m "fix: pass alias+src objects to Assets.load so aliases are registered"
```

---

## Task 3: Remove debug console.log from ScoreManager.ts

**Files:**
- Modify: `src/scripts/game/ScoreManager.ts:67`

- [ ] **Step 1: Delete the `console.log` line**

In `_showResult`, remove:

```ts
console.log(resultText.x, resultText.y);
```

- [ ] **Step 2: Verify build passes**

```bash
cd /Users/serhiichernenko/Documents/work/Match-3_game && npm run build 2>&1 | tail -5
```

- [ ] **Step 3: Commit**

```bash
cd /Users/serhiichernenko/Documents/work/Match-3_game && git add src/scripts/game/ScoreManager.ts && git commit -m "fix: remove debug console.log from ScoreManager._showResult"
```

---

## Task 4: Fix Graphics API call order in ScoreManager._showResult

**Files:**
- Modify: `src/scripts/game/ScoreManager.ts:42-51`

- [ ] **Step 1: Fix fill/rect order to match PixiJS 8 API**

In `_showResult`, replace:

```ts
const background = new Graphics();
background.fill({ color: 0x000000, alpha: 0.75 });
background.rect(
    this._boardParams.x,
    this._boardParams.y,
    this._boardParams.width,
    this._boardParams.height,
);
background.fill();
this.container.addChild(background);
```

With:

```ts
const background = new Graphics();
background.rect(
    this._boardParams.x,
    this._boardParams.y,
    this._boardParams.width,
    this._boardParams.height,
);
background.fill({ color: 0x000000, alpha: 0.75 });
this.container.addChild(background);
```

PixiJS 8: draw shape first, then call `fill({...})` to finalise it — same pattern used in `_createBackground`.

- [ ] **Step 2: Verify build passes**

```bash
cd /Users/serhiichernenko/Documents/work/Match-3_game && npm run build 2>&1 | tail -5
```

- [ ] **Step 3: Commit**

```bash
cd /Users/serhiichernenko/Documents/work/Match-3_game && git add src/scripts/game/ScoreManager.ts && git commit -m "fix: correct Graphics fill/rect order in ScoreManager._showResult"
```

---

## Task 5: Add destroy() to GameTimer

**Files:**
- Modify: `src/scripts/game/GameTimer.ts`

- [ ] **Step 1: Kill the GSAP tween on destroy and stop the interval**

Add `private _tweenAnimation?: gsap.core.Tween;` field, store the tween returned by `gsap.to`, and add `destroy()`:

```ts
import { Container, Text, TextStyle } from 'pixi.js';
import { gsap } from 'gsap';

export class GameTimer {
    public container: Container;
    private _timeLeft: number;
    private _timerText!: Text;
    private _intervalId?: number;
    private readonly _onComplete?: () => void;
    private _tweenAnimation?: gsap.core.Tween;

    public constructor(x: number, y: number, gameTime: number, onComplete?: () => void) {
        this.container = new Container();
        this._timeLeft = gameTime;
        this._onComplete = onComplete;
        this._createTimer(x, y);
        this._startTimer();
    }

    private _createTimer(x: number, y: number): void {
        const style = new TextStyle({
            fontFamily: 'Arial',
            fontSize: 25,
            fill: '#000000'
        });

        this._timerText = new Text({ text: `Time: ${this._timeLeft}`, style });
        this._timerText.x = x;
        this._timerText.y = y - this._timerText.height / 2;
        this.container.addChild(this._timerText);

        this._tweenAnimation = gsap.to(this._timerText.scale, {
            x: 1.05,
            y: 1.05,
            duration: 0.5,
            yoyo: true,
            repeat: -1,
            ease: 'power1.inOut'
        });
    }

    private _startTimer(): void {
        this._intervalId = window.setInterval(() => {
            this._timeLeft--;
            this._timerText.text = `Time: ${this._timeLeft}`;

            if (this._timeLeft <= 0) {
                this.stopTimer();
                if (this._onComplete) this._onComplete();
            }
        }, 1000);
    }

    public stopTimer(): void {
        if (this._intervalId !== undefined) {
            clearInterval(this._intervalId);
            this._intervalId = undefined;
        }
    }

    public destroy(): void {
        this.stopTimer();
        this._tweenAnimation?.kill();
        this.container.destroy({ children: true });
    }
}
```

- [ ] **Step 2: Verify build passes**

```bash
cd /Users/serhiichernenko/Documents/work/Match-3_game && npm run build 2>&1 | tail -5
```

- [ ] **Step 3: Commit**

```bash
cd /Users/serhiichernenko/Documents/work/Match-3_game && git add src/scripts/game/GameTimer.ts && git commit -m "fix: add destroy() to GameTimer to stop interval and kill GSAP tween"
```

---

## Task 6: Add destroy() to ScoreManager

**Files:**
- Modify: `src/scripts/game/ScoreManager.ts`

- [ ] **Step 1: Store result timeline reference and add destroy()**

Add `private _resultTimeline?: gsap.core.Timeline;` field. In `_showResult`, assign `this._resultTimeline = gsap.timeline(...)`. Add `destroy()` method:

At the top of the class, add the field after `_onReset`:

```ts
private _resultTimeline?: gsap.core.Timeline;
```

In `_showResult`, replace:

```ts
const timeline = gsap.timeline({ repeat: -1, yoyo: true });

timeline
    .to(resultText, { duration: 1, pixi: { tint: 0xff3000 }, alpha: 1 })
    .to(resultText, { duration: 1, pixi: { tint: 0xffc700 }, alpha: 0.4 })
    .to(resultText, { duration: 1, pixi: { tint: 0xff3000 }, alpha: 1 })
    .to(resultText, { duration: 1, pixi: { tint: 0xffc700 }, alpha: 0.4 });
```

With:

```ts
this._resultTimeline = gsap.timeline({ repeat: -1, yoyo: true });

this._resultTimeline
    .to(resultText, { duration: 1, pixi: { tint: 0xff3000 }, alpha: 1 })
    .to(resultText, { duration: 1, pixi: { tint: 0xffc700 }, alpha: 0.4 })
    .to(resultText, { duration: 1, pixi: { tint: 0xff3000 }, alpha: 1 })
    .to(resultText, { duration: 1, pixi: { tint: 0xffc700 }, alpha: 0.4 });
```

Add `destroy()` method at end of class (before closing brace):

```ts
public destroy(): void {
    this._resultTimeline?.kill();
    this._gameTimer.destroy();
    this.container.destroy({ children: true });
}
```

- [ ] **Step 2: Verify build passes**

```bash
cd /Users/serhiichernenko/Documents/work/Match-3_game && npm run build 2>&1 | tail -5
```

- [ ] **Step 3: Commit**

```bash
cd /Users/serhiichernenko/Documents/work/Match-3_game && git add src/scripts/game/ScoreManager.ts && git commit -m "fix: add destroy() to ScoreManager, store and kill result GSAP timeline"
```

---

## Task 7: Fix getMatches() return type in Board.ts

**Files:**
- Modify: `src/scripts/game/Board.ts:133-156`

- [ ] **Step 1: Add explicit Tile[] filter to remove undefined from match arrays**

Replace `getMatches()` method:

```ts
public getMatches(): Tile[][] {
    return this.fields
        .filter((field) => field.tile !== undefined)
        .flatMap((checkingField) => {
            const checkingTile = checkingField.tile!;
            return this._combinationRules
                .map((offsets) => {
                    const matchedTiles = offsets.map((offset) => {
                        const field = this.getField(
                            checkingField.row + offset.row,
                            checkingField.col + offset.col,
                        );
                        return field?.tile;
                    });

                    const isValid = matchedTiles.every(
                        (tile) => tile !== undefined && tile.color === checkingTile.color,
                    );

                    if (!isValid) return null;
                    const tiles = matchedTiles.filter((t): t is Tile => t !== undefined);
                    return [checkingTile, ...tiles];
                })
                .filter((match): match is Tile[] => match !== null);
        });
}
```

- [ ] **Step 2: Verify build passes**

```bash
cd /Users/serhiichernenko/Documents/work/Match-3_game && npm run build 2>&1 | tail -5
```

- [ ] **Step 3: Commit**

```bash
cd /Users/serhiichernenko/Documents/work/Match-3_game && git add src/scripts/game/Board.ts && git commit -m "fix: remove Tile|undefined from getMatches return via explicit filter"
```

---

## Task 8: Make Board.rows and Board.cols readonly

**Files:**
- Modify: `src/scripts/game/Board.ts:24-25`

- [ ] **Step 1: Add `readonly` modifier**

Replace:

```ts
public rows: number;
public cols: number;
```

With:

```ts
public readonly rows: number;
public readonly cols: number;
```

- [ ] **Step 2: Verify build passes**

```bash
cd /Users/serhiichernenko/Documents/work/Match-3_game && npm run build 2>&1 | tail -5
```

- [ ] **Step 3: Commit**

```bash
cd /Users/serhiichernenko/Documents/work/Match-3_game && git add src/scripts/game/Board.ts && git commit -m "fix: make Board.rows and Board.cols readonly"
```

---

## Task 9: Remove Tile double allocation

**Files:**
- Modify: `src/scripts/game/Tile.ts:12-13`

- [ ] **Step 1: Remove the eager `new Sprite(Texture.EMPTY)` initialiser**

Replace class field declaration:

```ts
public field: Field | undefined;
public sprite: Sprite;
public color: string;
```

The constructor already assigns `this.sprite = getSprite(this.color)` so no initialiser is needed. Also remove the `Texture` import if it is no longer used anywhere else in the file.

Full updated `Tile.ts`:

```ts
import { Sprite } from 'pixi.js';
import { gsap } from 'gsap';
import { getSprite } from '../utils';
import { Field } from './Field';

type Position = {
    x: number;
    y: number;
};

export class Tile {
    public field: Field | undefined;
    public sprite!: Sprite;
    public color: string;

    public constructor(color: string) {
        this.color = color;
        this.sprite = getSprite(this.color);
        this.sprite.anchor.set(0.5);
    }

    public setPosition(position: Position): void {
        this.sprite.x = position.x;
        this.sprite.y = position.y;
    }

    public moveTo(position: Position, duration: number, delay?: number, ease?: string): Promise<void> {
        return new Promise((resolve) => {
            gsap.to(this.sprite, {
                duration,
                delay,
                ease,
                pixi: {
                    x: position.x,
                    y: position.y
                },
                onComplete: resolve
            });
        });
    }

    public isNeighbour(tile: Tile): boolean {
        if (!this.field || !tile.field) {
            return false;
        }
        return Math.abs(this.field.row - tile.field.row) + Math.abs(this.field.col - tile.field.col) === 1;
    }

    public remove(): void {
        if (!this.sprite) {
            return;
        }
        this.sprite.destroy();
        if (this.field) {
            this.field.clearTile();
        }
    }

    public fallDownTo(position: Position, delay: number): Promise<void> {
        return this.moveTo(position, 0.5, delay, 'bounce.out');
    }
}
```

Note: `remove()` now calls `this.field.clearTile()` — this will be defined in Task 10.

- [ ] **Step 2: Verify build passes**

```bash
cd /Users/serhiichernenko/Documents/work/Match-3_game && npm run build 2>&1 | tail -5
```

- [ ] **Step 3: Commit**

```bash
cd /Users/serhiichernenko/Documents/work/Match-3_game && git add src/scripts/game/Tile.ts && git commit -m "fix: remove eager Sprite(Texture.EMPTY) allocation in Tile, use clearTile()"
```

---

## Task 10: Add clearTile() to Field and replace external mutations

**Files:**
- Modify: `src/scripts/game/Field.ts`
- Modify: `src/scripts/game/Game.ts` (external `field.tile = undefined` → `field.clearTile()`)

- [ ] **Step 1: Add `clearTile()` to Field**

Add after `setTile()` in `Field.ts`:

```ts
public clearTile(): void {
    if (this.tile) {
        this.tile.field = undefined;
    }
    this.tile = undefined;
}
```

- [ ] **Step 2: Replace external `field.tile = undefined` assignments in Game.ts**

In `_fallDownTo` (Game.ts ~line 166):

Replace:
```ts
fallingField.tile = undefined;
```
With:
```ts
fallingField.clearTile();
```

In `_removeStartMatches` — tiles are removed via `tile.remove()` which now calls `field.clearTile()` internally, so no change needed there.

Check `Board.ts` for any direct `field.tile = undefined` — replace with `field.clearTile()` if found.

In `Board.ts` there are no direct `field.tile = undefined` assignments in the reviewed code. Verify:
```bash
grep -n "\.tile = undefined" /Users/serhiichernenko/Documents/work/Match-3_game/src/scripts/game/Board.ts
```

- [ ] **Step 3: Verify build passes**

```bash
cd /Users/serhiichernenko/Documents/work/Match-3_game && npm run build 2>&1 | tail -5
```

- [ ] **Step 4: Commit**

```bash
cd /Users/serhiichernenko/Documents/work/Match-3_game && git add src/scripts/game/Field.ts src/scripts/game/Game.ts src/scripts/game/Tile.ts && git commit -m "fix: add Field.clearTile() and replace external field.tile=undefined mutations"
```

---

## Task 11: Fix _swap disabled flag bug and rename to _isDisabled

**Files:**
- Modify: `src/scripts/game/Game.ts`

- [ ] **Step 1: Rename `_disabled` → `_isDisabled` throughout Game.ts**

There are 6 occurrences. Apply rename-all:

| Old | New |
|-----|-----|
| `private _disabled: boolean = false` | `private _isDisabled: boolean = false` |
| `if (this._disabled)` | `if (this._isDisabled)` |
| `this._disabled = true` (in `_swap`) | `this._isDisabled = true` |
| `this._disabled = false` (in `_onFallDownOver`) | remove (see step 2) |

- [ ] **Step 2: Fix control flow — move flag reset to `_swap`, remove from `_onFallDownOver`**

Replace `_swap` method:

```ts
private async _swap(selectedTile: Tile, tile: Tile): Promise<void> {
    this._isDisabled = true;

    if (!tile.field || !selectedTile.field) {
        this._isDisabled = false;
        return;
    }

    const posA = { ...selectedTile.field.position };
    const posB = { ...tile.field.position };

    await selectedTile.moveTo(posB, 0.2);
    await tile.moveTo(posA, 0.2);

    this._board.swap(selectedTile, tile);
    this._clearSelection(tile);

    const matches = this._board.getMatches();
    if (matches.length) {
        await this._processMatches(matches);
    } else {
        await selectedTile.moveTo(posA, 0.2);
        await tile.moveTo(posB, 0.2);
        this._board.swap(tile, selectedTile);
    }

    this._isDisabled = false;
}
```

Replace `_onFallDownOver` method (remove `this._disabled = false`):

```ts
private async _onFallDownOver(): Promise<void> {
    const matches = this._board.getMatches();

    if (matches.length) {
        await this._processMatches(matches);
    }
}
```

- [ ] **Step 3: Verify build passes**

```bash
cd /Users/serhiichernenko/Documents/work/Match-3_game && npm run build 2>&1 | tail -5
```

- [ ] **Step 4: Commit**

```bash
cd /Users/serhiichernenko/Documents/work/Match-3_game && git add src/scripts/game/Game.ts && git commit -m "fix: centralise _isDisabled reset in _swap, fix permanent board lock on no-match swap"
```

---

## Task 12: Add destroy() to Game

**Files:**
- Modify: `src/scripts/game/Game.ts`

- [ ] **Step 1: Add destroy() that cleans up board tiles, score manager and removes all listeners**

Add `destroy()` method to `Game` class:

```ts
public destroy(): void {
    this._board.container.removeAllListeners();
    this._board.fields.forEach((field) => {
        if (field.tile) {
            gsap.killTweensOf(field.tile.sprite);
            field.tile.sprite.destroy();
        }
        field.container.destroy({ children: true });
    });
    this._scoreManager.destroy();
    this.container.destroy({ children: true });
}
```

Add `import { gsap }` at the top if not already present (it is already imported in `Game.ts` — verify with `grep "import.*gsap" src/scripts/game/Game.ts`).

- [ ] **Step 2: Verify build passes**

```bash
cd /Users/serhiichernenko/Documents/work/Match-3_game && npm run build 2>&1 | tail -5
```

- [ ] **Step 3: Commit**

```bash
cd /Users/serhiichernenko/Documents/work/Match-3_game && git add src/scripts/game/Game.ts && git commit -m "fix: add Game.destroy() to clean up sprites, listeners and score manager"
```

---

## Task 13: Fix App.resetGame() to call destroy() and fix PIXI import

**Files:**
- Modify: `src/scripts/system/App.ts`

- [ ] **Step 1: Replace `import * as PIXI` with named import**

Replace:
```ts
import * as PIXI from "pixi.js";
import { Assets, Application, Container } from "pixi.js";
```

With:
```ts
import { Assets, Application, Container, extensions } from "pixi.js";
```

Wait — `PixiPlugin.registerPIXI(PIXI)` needs the full PIXI namespace. Check what `registerPIXI` actually requires:

```bash
grep -r "registerPIXI" /Users/serhiichernenko/Documents/work/Match-3_game/node_modules/gsap/PixiPlugin.js 2>/dev/null | head -3
```

If `registerPIXI` only needs `{ Sprite, Texture, ... }` we can pass named imports. If it needs the full namespace object, keep `import * as PIXI` — the WARNING is INFO-level and should not break things.

**Safe approach:** Keep `import * as PIXI` for `registerPIXI`, but remove the duplicate named imports that are already covered by `PIXI.*`. Simplify to:

```ts
import * as PIXI from "pixi.js";
import { gsap } from "gsap";
import { PixiPlugin } from "gsap/PixiPlugin";
import { Config } from "./Config";
import { Game } from "../game/Game";
```

Then use `PIXI.Assets`, `PIXI.Application`, `PIXI.Container` instead of separate named imports — OR keep named imports and just remove the duplicate `* as PIXI` if `registerPIXI` accepts an object. Choose the option that compiles cleanly.

- [ ] **Step 2: Update `_scene` type and call `destroy()` on reset**

Update the `_scene` field type to `Game` instead of `{ container: Container }`:

```ts
private _scene!: Game;
```

Update `resetGame()` to call `destroy()`:

```ts
public resetGame(): void {
    this._scene.destroy();
    this._scene = new Game(this._config);
    this._app.stage.eventMode = "static";
    this._app.stage.addChild(this._scene.container);
}
```

Also update `run()` assignment:

```ts
this._scene = new Game(this._config);
```

(type is now `Game`, not the anonymous `{ container: Container }` — remove old cast if present)

- [ ] **Step 3: Verify build passes**

```bash
cd /Users/serhiichernenko/Documents/work/Match-3_game && npm run build 2>&1 | tail -5
```

- [ ] **Step 4: Commit**

```bash
cd /Users/serhiichernenko/Documents/work/Match-3_game && git add src/scripts/system/App.ts && git commit -m "fix: call Game.destroy() on reset, type _scene as Game, clean PIXI import"
```

---

## Task 14: Final build verification

- [ ] **Step 1: Full clean build**

```bash
cd /Users/serhiichernenko/Documents/work/Match-3_game && npm run build 2>&1
```

Expected: webpack compilation successful, 0 TypeScript errors.

- [ ] **Step 2: Start dev server and smoke-test**

```bash
cd /Users/serhiichernenko/Documents/work/Match-3_game && npm run start &
```

Open `http://localhost:8080` (or whatever port webpack serves on).

Verify:
- Game loads and tiles render
- Clicking tiles selects/swaps them
- Matches are removed and new tiles fall in
- Score decrements
- Timer counts down
- "You win!" shows when score reaches 0
- "Game Over!" shows when timer runs out
- Reset button starts a fresh game without console errors

- [ ] **Step 3: Tag completion**

```bash
cd /Users/serhiichernenko/Documents/work/Match-3_game && git log --oneline -15
```

Confirm all 13 fix commits are present.
