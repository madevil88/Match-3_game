import { ScoreManager } from '../scripts/game/ScoreManager';
import type { FieldRect } from '../scripts/game/Board';

jest.mock('gsap');

jest.mock('../scripts/game/GameTimer', () => ({
  GameTimer: jest.fn().mockImplementation(() => ({
    container: { addChild: jest.fn(), removeFromParent: jest.fn() },
    stopTimer: jest.fn(),
    reposition: jest.fn(),
    destroy: jest.fn(),
  })),
}));

const makeConfig = (winScore = 5) => ({ winScore, gameTime: 15 }) as any;
const makeRect = (): FieldRect => ({ x: 0, y: 100, width: 300, height: 300 });

beforeEach(() => {
  jest.useFakeTimers();
  Object.defineProperty(globalThis, 'innerWidth', { value: 800, writable: true, configurable: true });
});
afterEach(() => jest.useRealTimers());

describe('ScoreManager', () => {
  it('decreaseScore decrements the score', () => {
    const sm = new ScoreManager(makeConfig(5), makeRect(), jest.fn());
    const { Text } = require('pixi.js') as { Text: jest.Mock };
    const scoreNode = Text.mock.results
      .map((r: jest.MockResult<{ text: string }>) => r.value)
      .find((v: { text: string } | undefined) => v?.text?.startsWith?.('Score:'));
    sm.decreaseScore();
    expect(scoreNode?.text).toBe('Score: 4');
    sm.destroy();
  });

  it('stops the timer when score reaches 0', () => {
    const { GameTimer } = require('../scripts/game/GameTimer') as { GameTimer: jest.Mock };
    const sm = new ScoreManager(makeConfig(1), makeRect(), jest.fn());
    const timerInstance = GameTimer.mock.results[GameTimer.mock.results.length - 1].value;
    sm.decreaseScore();
    expect(timerInstance.stopTimer).toHaveBeenCalled();
    sm.destroy();
  });

  it('ignores further decrements after result is shown', () => {
    const sm = new ScoreManager(makeConfig(1), makeRect(), jest.fn());
    sm.decreaseScore(); // reaches 0 → win
    const { Text } = require('pixi.js') as { Text: jest.Mock };
    const scoreNode = Text.mock.results
      .map((r: jest.MockResult<{ text: string }>) => r.value)
      .find((v: { text: string } | undefined) => v?.text?.startsWith?.('Score:'));
    const textAfterWin = scoreNode?.text;
    sm.decreaseScore(); // should be ignored
    expect(scoreNode?.text).toBe(textAfterWin);
    sm.destroy();
  });
});
