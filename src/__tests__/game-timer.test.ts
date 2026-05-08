import { GameTimer } from '../scripts/game/GameTimer';

jest.mock('gsap');

beforeEach(() => jest.useFakeTimers());
afterEach(() => jest.useRealTimers());

describe('GameTimer', () => {
  it('calls onComplete when time reaches 0', () => {
    const onComplete = jest.fn();
    const timer = new GameTimer(0, 0, 3, onComplete);
    jest.advanceTimersByTime(3000);
    expect(onComplete).toHaveBeenCalledTimes(1);
    timer.stopTimer();
  });

  it('does NOT call onComplete before time runs out', () => {
    const onComplete = jest.fn();
    const timer = new GameTimer(0, 0, 5, onComplete);
    jest.advanceTimersByTime(4000);
    expect(onComplete).not.toHaveBeenCalled();
    timer.stopTimer();
  });

  it('stopTimer prevents further ticks', () => {
    const onComplete = jest.fn();
    const timer = new GameTimer(0, 0, 5, onComplete);
    jest.advanceTimersByTime(2000);
    timer.stopTimer();
    jest.advanceTimersByTime(10000);
    expect(onComplete).not.toHaveBeenCalled();
  });

  it('works without an onComplete callback', () => {
    const timer = new GameTimer(0, 0, 2);
    expect(() => jest.advanceTimersByTime(3000)).not.toThrow();
    timer.stopTimer();
  });
});
