/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'jest-environment-jsdom',
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: './tsconfig.jest.json' }],
  },
  moduleNameMapper: {
    '^pixi\\.js$': '<rootDir>/src/__mocks__/pixi.js.ts',
    '^gsap$': '<rootDir>/src/__mocks__/gsap.ts',
    '^gsap/PixiPlugin$': '<rootDir>/src/__mocks__/gsap-pixi-plugin.ts',
  },
  testMatch: ['<rootDir>/src/__tests__/**/*.test.ts'],
};
