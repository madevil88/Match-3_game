import { Field } from '../scripts/game/Field';
import { Tile } from '../scripts/game/Tile';

let spriteCallCount = 0;
const spriteMocks: ReturnType<typeof createSpriteMock>[] = [];

const createSpriteMock = () => ({
  anchor: { set: jest.fn() },
  x: 0,
  y: 0,
  width: 100,
  height: 100,
  scale: { set: jest.fn(), x: 1, y: 1 },
  visible: true,
  on: jest.fn(),
  destroy: jest.fn(),
});

jest.mock('../scripts/utils', () => ({
  getSprite: jest.fn().mockImplementation(() => {
    const mock = createSpriteMock();
    spriteMocks.push(mock);
    return mock;
  }),
}));

jest.mock('gsap');

beforeEach(() => {
  spriteCallCount = 0;
  spriteMocks.length = 0;
  Object.defineProperty(global, 'innerWidth', { value: 800, writable: true, configurable: true });
  Object.defineProperty(global, 'crypto', {
    value: { getRandomValues: jest.fn((arr: Uint8Array) => { arr[0] = 128; return arr; }) },
    writable: true,
    configurable: true,
  });
});

describe('Field', () => {
  describe('constructor', () => {
    it('stores row, col, and creates a sprite', () => {
      const field = new Field(2, 3, 8);
      expect(field.row).toBe(2);
      expect(field.col).toBe(3);
      expect(field.sprite).toBeDefined();
      expect(field.tile).toBeUndefined();
    });
  });

  describe('position', () => {
    it('returns x = col * sprite.width', () => {
      const field = new Field(0, 3, 8);
      expect(field.position.x).toBe(3 * field.sprite.width);
    });

    it('returns y = row * sprite.height', () => {
      const field = new Field(2, 0, 8);
      expect(field.position.y).toBe(2 * field.sprite.height);
    });
  });

  describe('setTile', () => {
    it('links tile and field to each other', () => {
      const field = new Field(1, 1, 8);
      const tile = new Tile('red');
      field.setTile(tile);
      expect(field.tile).toBe(tile);
      expect(tile.field).toBe(field);
    });
  });

  describe('clearTile', () => {
    it('removes tile and clears tile.field', () => {
      const field = new Field(0, 0, 8);
      const tile = new Tile('blue');
      field.setTile(tile);
      field.clearTile();
      expect(field.tile).toBeUndefined();
      expect(tile.field).toBeUndefined();
    });

    it('does not throw when field has no tile', () => {
      const field = new Field(0, 0, 8);
      expect(() => field.clearTile()).not.toThrow();
    });
  });

  describe('select / unselect', () => {
    it('makes the selected sprite visible on select()', () => {
      const field = new Field(0, 0, 8);
      // _selected is the 2nd sprite created in the constructor
      const selectedSprite = spriteMocks[1];
      field.select();
      expect(selectedSprite.visible).toBe(true);
    });

    it('hides the selected sprite on unselect()', () => {
      const field = new Field(0, 0, 8);
      const selectedSprite = spriteMocks[1];
      field.select();
      field.unselect();
      expect(selectedSprite.visible).toBe(false);
    });
  });
});
