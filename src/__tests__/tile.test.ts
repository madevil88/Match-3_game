import { Tile } from '../scripts/game/Tile';
import { Field } from '../scripts/game/Field';

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

beforeEach(() => {
  Object.defineProperty(global, 'innerWidth', { value: 800, writable: true, configurable: true });
  Object.defineProperty(global, 'innerHeight', { value: 600, writable: true, configurable: true });
  Object.defineProperty(global, 'crypto', {
    value: { getRandomValues: jest.fn((arr: Uint8Array) => { arr[0] = 128; return arr; }) },
    writable: true,
    configurable: true,
  });
});

describe('Tile', () => {
  describe('constructor', () => {
    it('sets color and creates a sprite', () => {
      const tile = new Tile('blue');
      expect(tile.color).toBe('blue');
      expect(tile.sprite).toBeDefined();
    });
  });

  describe('isNeighbour', () => {
    it('returns true for horizontally adjacent tiles', () => {
      const tile1 = new Tile('red');
      const tile2 = new Tile('blue');
      tile1.field = new Field(0, 0, 8);
      tile2.field = new Field(0, 1, 8);
      expect(tile1.isNeighbour(tile2)).toBe(true);
    });

    it('returns true for vertically adjacent tiles', () => {
      const tile1 = new Tile('red');
      const tile2 = new Tile('blue');
      tile1.field = new Field(0, 0, 8);
      tile2.field = new Field(1, 0, 8);
      expect(tile1.isNeighbour(tile2)).toBe(true);
    });

    it('returns false for diagonal tiles', () => {
      const tile1 = new Tile('red');
      const tile2 = new Tile('blue');
      tile1.field = new Field(0, 0, 8);
      tile2.field = new Field(1, 1, 8);
      expect(tile1.isNeighbour(tile2)).toBe(false);
    });

    it('returns false for non-adjacent tiles', () => {
      const tile1 = new Tile('red');
      const tile2 = new Tile('blue');
      tile1.field = new Field(0, 0, 8);
      tile2.field = new Field(2, 2, 8);
      expect(tile1.isNeighbour(tile2)).toBe(false);
    });

    it('returns false when tile has no field', () => {
      const tile1 = new Tile('red');
      const tile2 = new Tile('blue');
      expect(tile1.isNeighbour(tile2)).toBe(false);
    });
  });

  describe('remove', () => {
    it('destroys sprite and clears the associated field', () => {
      const tile = new Tile('red');
      const field = new Field(0, 0, 8);
      field.setTile(tile);

      tile.remove();

      expect(tile.sprite.destroy).toHaveBeenCalled();
      expect(field.tile).toBeUndefined();
    });
  });

  describe('setPosition', () => {
    it('assigns x and y to the sprite', () => {
      const tile = new Tile('red');
      tile.setPosition({ x: 50, y: 75 });
      expect(tile.sprite.x).toBe(50);
      expect(tile.sprite.y).toBe(75);
    });
  });
});
