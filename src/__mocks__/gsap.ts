const createTween = () => ({ kill: jest.fn() });
const createTimeline = () => ({
  to: jest.fn().mockReturnThis(),
  kill: jest.fn(),
});

export const gsap = {
  to: jest.fn().mockImplementation(createTween),
  timeline: jest.fn().mockImplementation(createTimeline),
  killTweensOf: jest.fn(),
  registerPlugin: jest.fn(),
};
