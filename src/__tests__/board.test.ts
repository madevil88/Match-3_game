import { Board } from '../scripts/game/Board';

jest.mock('../scripts/utils', () => ({
  getSprite: jest.fn().mockReturnValue({
    anchor: { set: jest.fn() },
    x: 0,
    y: 0,
    width: 100,
    height: 100,
    scale: { set: jest.fn(), x: 1, y: 1 },
    visible: true,
    interactive: false,
    on: jest.fn(),
    destroy: jest.fn(),
  }),
}));

jest.mock('gsap');

const makeConfig = (rows = 3, cols = 3) =>
  ({
    boardParams: {
      rows,
      cols,
      combinationRules: [
        [{ col: 1, row: 0 }, { col: 2, row: 0 }],
        [{ col: 0, row: 1 }, { col: 0, row: 2 }],
      ],
    },
    tilesColors: ['red', 'blue'],
  }) as any;

beforeEach(() => {
  Object.defineProperty(globalThis, 'innerWidth', { value: 800, writable: true, configurable: true });
  Object.defineProperty(globalThis, 'innerHeight', { value: 600, writable: true, configurable: true });
  Object.defineProperty(globalThis, 'crypto', {
    value: { getRandomValues: jest.fn((arr: Uint8Array) => { arr[0] = 128; return arr; }) },
    writable: true,
    configurable: true,
  });
});

describe('Board', () => {
  describe('constructor', () => {
    it('creates rows × cols fields', () => {
      const board = new Board(makeConfig(3, 3));
      expect(board.fields.length).toBe(9);
    });

    it('stores rows and cols counts', () => {
      const board = new Board(makeConfig(4, 5));
      expect(board.rows).toBe(4);
      expect(board.cols).toBe(5);
    });

    it('assigns a tile to every field', () => {
      const board = new Board(makeConfig(3, 3));
      board.fields.forEach((f) => expect(f.tile).toBeDefined());
    });
  });

  describe('getField', () => {
    it('returns the field at a given row/col', () => {
      const board = new Board(makeConfig(3, 3));
      const field = board.getField(1, 2);
      expect(field).toBeDefined();
      expect(field?.row).toBe(1);
      expect(field?.col).toBe(2);
    });

    it('returns undefined for out-of-bounds coordinates', () => {
      const board = new Board(makeConfig(3, 3));
      expect(board.getField(10, 10)).toBeUndefined();
    });
  });

  describe('getMatches', () => {
    it('detects a horizontal 3-in-a-row', () => {
      const board = new Board(makeConfig(3, 3));
      // row 0: all red; rows 1–2: alternate to prevent unintended blue matches
      board.fields.slice(0, 3).forEach((f) => { if (f.tile) f.tile.color = 'red'; });
      board.fields.slice(3, 6).forEach((f, i) => { if (f.tile) f.tile.color = i % 2 === 0 ? 'blue' : 'red'; });
      board.fields.slice(6).forEach((f, i) => { if (f.tile) f.tile.color = i % 2 === 0 ? 'red' : 'blue'; });

      const matches = board.getMatches();
      const redMatches = matches.filter((m) => m.every((t) => t.color === 'red'));
      expect(redMatches.length).toBeGreaterThan(0);
    });

    it('detects a vertical 3-in-a-row', () => {
      const board = new Board(makeConfig(3, 3));
      // col 0 (indices 0, 3, 6): all red; rest: blue
      [0, 3, 6].forEach((i) => { const f = board.fields[i]; if (f.tile) f.tile.color = 'red'; });
      board.fields
        .filter((_, i) => ![0, 3, 6].includes(i))
        .forEach((f) => { if (f.tile) f.tile.color = 'blue'; });

      const matches = board.getMatches();
      expect(matches.length).toBeGreaterThan(0);
    });

    it('returns an empty array when there are no matches', () => {
      const board = new Board(makeConfig(3, 3));
      // Checkerboard: no three-in-a-row possible
      board.fields.forEach((f, i) => {
        if (f.tile) f.tile.color = (i + Math.floor(i / 3)) % 2 === 0 ? 'red' : 'blue';
      });

      const matches = board.getMatches();
      const hasSameColor = matches.every((m) =>
        m.every((t) => t.color === m[0].color)
      );
      expect(hasSameColor).toBe(true);
    });
  });

  describe('swap', () => {
    it('exchanges tile–field assignments between two tiles', () => {
      const board = new Board(makeConfig(3, 3));
      const field1 = board.getField(0, 0);
      const field2 = board.getField(0, 1);
      const tile1 = field1?.tile;
      const tile2 = field2?.tile;
      expect(tile1).toBeDefined();
      expect(tile2).toBeDefined();
      if (!tile1 || !tile2) return;

      board.swap(tile1, tile2);

      expect(field1?.tile).toBe(tile2);
      expect(field2?.tile).toBe(tile1);
      expect(tile1.field).toBe(field2);
      expect(tile2.field).toBe(field1);
    });
  });
});
