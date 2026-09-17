import { GlobalRegistrator } from '@happy-dom/global-registrator';
import { afterAll, afterEach, beforeAll, mock } from 'bun:test';
import { cleanup } from '@testing-library/react';

GlobalRegistrator.register();
Reflect.set(globalThis, 'IS_REACT_ACT_ENVIRONMENT', true);

// mute console errors
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = () => {
  };
});
afterAll(() => {
  console.error = originalConsoleError;
});

// automatic unmount
afterEach(() => {
  cleanup();
  mock.clearAllMocks();
});

Reflect.set(globalThis, 'asyncAction', (cb: CallableFunction, ms = 0): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      cb();
      setTimeout(resolve, ms);
    });
  });
});
