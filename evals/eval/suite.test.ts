import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { ARMS } from '../src/arms.js';
import { loadCases, loadRunArtifact, RUNS_DIR } from '../src/load.js';
import { describeResult, runCase, type Outcome } from '../src/run.js';

/**
 * Grades what `pnpm generate` left on disk.
 *
 * A red test here is a finding about the *skill*, not a broken build: either it
 * fails to teach a claim, or the baseline already satisfies it.
 */
const runDir = process.env.EVAL_RUN ?? join(RUNS_DIR, 'latest');
const haveRun = existsSync(runDir);

const graded = await Promise.all(
  (haveRun ? await loadCases() : []).map(async ({ name, definition }) => ({
    name,
    definition,
    arms: await Promise.all(
      ARMS.map(async (arm) => ({
        arm,
        reps: (
          await Promise.all(
            Array.from({ length: definition.reps }, async (_unused, index) => {
              const dir = join(runDir, arm, name, `rep-${index + 1}`);
              if (!existsSync(dir)) {
                return null;
              }

              const artifact = await loadRunArtifact(dir, `${arm}/${name}/rep-${index + 1}`);

              return { rep: index + 1, artifact, result: await runCase(definition, artifact) };
            }),
          )
        ).filter((entry) => entry !== null),
      })),
    ),
  })),
);

/** Pass rate over the runs that actually graded; skips and errors are neither. */
function rate(outcomes: readonly Outcome[]) {
  const pass = outcomes.filter((outcome) => outcome === 'pass').length;
  const graded = pass + outcomes.filter((outcome) => outcome === 'fail').length;
  const ungraded = outcomes.length - graded;

  return {
    pass,
    graded,
    describe: `${pass}/${graded} passed${ungraded === 0 ? '' : `, ${ungraded} ungraded`}`,
  };
}

describe.skipIf(haveRun)('generation', () => {
  it('needs a run on disk — `pnpm generate` first', () => {
    expect(haveRun, `no run at ${runDir}`).toBe(true);
  });
});

describe.skipIf(!haveRun).each(graded)('$name', ({ definition, arms }) => {
  const withSkill = arms.find((entry) => entry.arm === 'with-skill')?.reps ?? [];
  const baseline = arms.find((entry) => entry.arm === 'baseline')?.reps ?? [];

  it('has artifacts for both arms', () => {
    expect(withSkill, 'no with-skill reps on disk').not.toHaveLength(0);
    expect(baseline, 'no baseline reps on disk').not.toHaveLength(0);
  });

  describe('compliance (with the skill)', () => {
    for (const { rep, artifact, result } of withSkill) {
      it(`rep-${rep} satisfies: ${definition.claim.slice(0, 60)}…`, () => {
        expect(result.outcome, `\n${describeResult(result, artifact)}\n`).toBe('pass');
      });
    }
  });

  it('attribution: the skill beats the baseline', () => {
    const skilled = rate(withSkill.map(({ result }) => result.outcome));
    const bare = rate(baseline.map(({ result }) => result.outcome));

    const report = [
      `with-skill: ${skilled.describe}`,
      `baseline:   ${bare.describe}`,
      '',
      ...baseline
        .filter(({ result }) => result.outcome !== 'pass')
        .map(({ artifact, result }) => describeResult(result, artifact)),
    ].join('\n');

    if (skilled.graded === 0 || bare.graded === 0) {
      expect.fail(`nothing graded in one arm, so attribution is unmeasurable\n\n${report}`);
    }

    expect(skilled.pass / skilled.graded, report).toBeGreaterThan(bare.pass / bare.graded);
  });
});
