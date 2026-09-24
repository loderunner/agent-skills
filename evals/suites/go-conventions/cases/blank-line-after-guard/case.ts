import { choice } from '@typesafe-ai/sdk';
import { defineCase, jevCheck } from '../../../../src/case.js';
import { blankLineAfter, isLastInScope, nextStatement, stripComments } from '../../../../src/checkers/ast.js';
import { acquireStatement, ERROR_GUARD_QUERY, isErrorGuard } from '../../../../src/checkers/go.js';
import { OTHER } from '../../../../src/checkers/jev.js';

/**
 * Narrowings, and why:
 *
 * - A guard is an `if` comparing an identifier to `nil` whose name contains
 *   "err". Without type information that is the only available proxy, and it
 *   keeps `if node != nil` out of the population.
 * - Both exceptions are settled positionally except one question: whether a
 *   `defer` immediately following the guard releases what was just acquired.
 *   Only that goes to Jev.
 * - A comment cannot change the verdict in the skill's favour; see
 *   `blankLineAfter` and `nextStatement`.
 */
export default defineCase({
  claim:
    'Always leave a blank line after the closing `}` of an `if err != nil` block, unless the block is the last statement in its enclosing scope, or is immediately followed by a `defer` releasing the resource just acquired.',
  source: 'skills/go-conventions/SKILL.md#L55-L118',
  reps: 3,
  checks: [
    jevCheck('blank-line-after-guard', ERROR_GUARD_QUERY, {
      prefilter: (unit) => {
        if (!isErrorGuard(unit)) {
          return { verdict: 'pass', detail: 'not an error guard' };
        }

        if (isLastInScope(unit.node)) {
          return { verdict: 'pass', detail: 'last statement in its scope' };
        }

        if (blankLineAfter(unit)) {
          return { verdict: 'pass', detail: 'blank line follows the guard' };
        }

        // The two exceptions interact: a guard can be both last in scope and
        // followed by a defer. Position settles that above, so only the
        // acquire/guard/defer question is left.
        const next = nextStatement(unit.node);
        if (next?.type !== 'defer_statement') {
          return {
            verdict: 'fail',
            detail: `no blank line; the guard runs straight into ${next?.type ?? 'nothing'}: ${JSON.stringify(next?.text.split('\n')[0] ?? '')}`,
          };
        }

        return undefined;
      },
      state: (unit) => {
        const acquire = acquireStatement(unit.node);
        const deferred = nextStatement(unit.node);

        return {
          acquire: acquire === null ? '' : stripComments(acquire).split('\n')[0] ?? '',
          deferred_call: deferred === null ? '' : stripComments(deferred),
        };
      },
      question: choice(
        'The Go code acquired a resource, guarded it against an error, and then deferred a call. Does the deferred call release the resource that the acquire statement produced?',
        {
          releases_acquired:
            'The deferred call releases, closes, cancels, or unlocks the value the acquire statement produced. This includes releasing a field of it, as in `defer resp.Body.Close()` after `resp, err := http.Get(url)`, and releasing a second return value of the same call, as in `defer cancel()` after `stream, cancel, err := open(ctx)`.',
          unrelated:
            'The deferred call releases something the acquire statement did not produce, or does unrelated work. For example `defer mu.Unlock()` for a mutex locked somewhere earlier, `defer wg.Done()`, or `defer log.Println("done")`.',
          [OTHER]: 'Neither description fits the code shown.',
        },
      ),
      pass: ['releases_acquired'],
      fail: ['unrelated'],
    }),
  ],
});
