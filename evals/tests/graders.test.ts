import { describe, expect, it } from 'vitest';
import { jevConfigured } from '../src/checkers/jev.js';
import { loadCases, loadFixtures } from '../src/load.js';
import { describeResult, runCase } from '../src/run.js';

/**
 * A wrong grader is invisible, because Jev gives no rationale. Each case carries
 * fixtures with known verdicts — mostly lifted from the skill's own GOOD/BAD
 * blocks, plus the near-misses that would otherwise produce a confidently wrong
 * number. A grader that cannot classify the skill's own examples grades nothing.
 *
 * This is the only bench file that spends Jev budget, so it skips wholesale
 * without a key rather than reporting untested graders as green.
 */
const calibrations = await Promise.all(
  (await loadCases()).map(async (loaded) => ({
    ...loaded,
    pass: await loadFixtures(loaded.dir, 'pass'),
    fail: await loadFixtures(loaded.dir, 'fail'),
  })),
);

describe('case discovery', () => {
  it('found at least one case', () => {
    expect(calibrations).not.toHaveLength(0);
  });
});

describe.skipIf(!jevConfigured()).each(calibrations)('$suite/$name', ({ definition, pass, fail }) => {
  it('has fixtures for both verdicts', () => {
    expect(pass, 'no fixtures/pass/ files').not.toHaveLength(0);
    expect(fail, 'no fixtures/fail/ files').not.toHaveLength(0);
  });

  for (const [expected, artifacts] of [
    ['pass', pass],
    ['fail', fail],
  ] as const) {
    for (const artifact of artifacts) {
      it(`${artifact.label} is graded ${expected}`, async () => {
        const result = await runCase(definition, artifact);

        expect(result.outcome, `\n${describeResult(result, artifact)}\n`).toBe(expected);
      });
    }
  }
});
