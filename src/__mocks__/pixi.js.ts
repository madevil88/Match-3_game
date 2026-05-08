const createSpriteMock = () => ({
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
});

export const Sprite = {
  from: jest.fn().mockImplementation(createSpriteMock),
};

export const Container = jest.fn().mockImplementation(() => ({
  addChild: jest.fn(),
  removeChild: jest.fn(),
  removeFromParent: jest.fn(),
  removeAllListeners: jest.fn(),
  on: jest.fn(),
  emit: jest.fn(),
  destroy: jest.fn(),
  eventMode: 'none',
  x: 0,
  y: 0,
  scale: { set: jest.fn() },
  children: [],
  interactive: false,
}));

export const Text = jest.fn().mockImplementation((config: { text?: string } = {}) => ({
  anchor: { set: jest.fn() },
  x: 0,
  y: 0,
  width: 50,
  height: 25,
  text: config.text ?? '',
  scale: { x: 1, y: 1 },
  destroy: jest.fn(),
}));

export const TextStyle = jest.fn().mockImplementation(() => ({}));

export const Graphics = jest.fn().mockImplementation(() => ({
  roundRect: jest.fn().mockReturnThis(),
  rect: jest.fn().mockReturnThis(),
  fill: jest.fn().mockReturnThis(),
  destroy: jest.fn(),
}));

export const Assets = {
  load: jest.fn().mockResolvedValue(undefined),
  get: jest.fn().mockReturnValue({}),
};

export const Application = jest.fn().mockImplementation(() => ({
  init: jest.fn().mockResolvedValue(undefined),
  stage: {
    addChild: jest.fn(),
    removeChildren: jest.fn(),
    eventMode: 'none',
  },
  renderer: {
    background: { alpha: 0 },
    resize: jest.fn(),
  },
  canvas: document.createElement('canvas'),
}));
