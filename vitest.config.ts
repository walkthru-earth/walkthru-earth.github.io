import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['components/**/*.test.{ts,tsx}', 'lib/**/*.test.{ts,tsx}'],
    environment: 'node',
  },
});
