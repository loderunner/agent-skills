import { loadEnv } from 'vite';
import { defineConfig } from 'vitest/config';

/**
 * Two projects, because the two kinds of test answer different questions.
 *
 * `bench` tests the bench's own code against known-correct answers: red means
 * the bench is broken. `eval` is the measurement: red means the skill failed to
 * teach a claim, or the baseline already satisfied it.
 */
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    test: {
      reporters: ['verbose'],
      projects: [
        {
          test: { name: 'bench', include: ['tests/**/*.test.ts'], env, testTimeout: 60_000 },
        },
        {
          // Grading a run makes one Jev call per unit, over the network.
          test: { name: 'eval', include: ['eval/**/*.test.ts'], env, testTimeout: 120_000 },
        },
      ],
    },
  };
});
