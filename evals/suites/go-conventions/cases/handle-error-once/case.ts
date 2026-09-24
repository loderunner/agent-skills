import { choice } from '@typesafe-ai/sdk';
import { astCheck, defineCase, jevCheck } from '../../../../src/case.js';
import {
  calleeLeaf,
  ERROR_GUARD_QUERY,
  ERROR_RETURNING_METHODS,
  insideDefer,
  insideErrorGuardBody,
  isErrorGuard,
} from '../../../../src/checkers/go.js';
import { OTHER } from '../../../../src/checkers/jev.js';

/**
 * Narrowings, and why:
 *
 * - The "handled more than once" half is classified by Jev, one guard body at a time.
 * - The "discarded entirely" half is settled syntactically over a small
 *   allowlist of method names. Asking Jev whether an arbitrary call like
 *   `process(buf)` returns an error asks it to invent type information it does
 *   not have, which it will answer confidently and wrongly. Narrowing to
 *   knowable signatures trades recall for a verdict that is actually true.
 * - A discarded error inside a `defer`, assigned to `_`, or on the cleanup path
 *   inside an `if err != nil` block is not counted: all three are a decision
 *   rather than an oversight.
 */
export default defineCase({
  claim:
    'Handle each error exactly once. Handling it zero times discards it silently; handling it more than once — the common shape being logging it and also returning it — is just as bad.',
  source: 'skills/go-conventions/SKILL.md#L120-L171',
  reps: 3,
  checks: [
    jevCheck('handled-more-than-once', ERROR_GUARD_QUERY, {
      prefilter: (unit) =>
        isErrorGuard(unit) ? undefined : { verdict: 'pass', detail: 'not an error guard' },
      state: (unit) => ({ error_handling_block: unit.snippet }),
      question: choice('This Go block handles an error. What does it do with the error?', {
        returns_wrapped:
          'Returns or propagates the error after adding context — `fmt.Errorf("...: %w", err)`, `errors.Wrap`, or a new error naming the operation. It does not also log, print, or record it.',
        returns_bare:
          'Returns or propagates the error unchanged, and does nothing else with it.',
        logs_only:
          'Logs, prints, or records the error and does NOT return or propagate it — for example `log.Println(err)` followed by `continue`, or by nothing at all.',
        terminates:
          'Ends the program, test, or goroutine — `panic`, `log.Fatal`, `log.Fatalf`, `os.Exit`, `t.Fatal`, `t.Fatalf`.',
        logs_and_returns:
          'BOTH logs, prints, or records the error AND returns or propagates it. For example `log.Println("unable to write:", err)` followed by `return err`.',
        [OTHER]: 'None of these descriptions fits the block shown.',
      }),
      pass: ['returns_wrapped', 'returns_bare', 'logs_only', 'terminates'],
      fail: ['logs_and_returns'],
    }),

    astCheck('discarded-entirely', '(expression_statement (call_expression) @call) @unit', (unit) => {
      const call = unit.captures.call;
      if (call === undefined) {
        return undefined;
      }

      const leaf = calleeLeaf(call);
      if (leaf === undefined || !ERROR_RETURNING_METHODS.has(leaf)) {
        // Not knowable syntactically, so outside what this check measures.
        return undefined;
      }

      if (insideDefer(call)) {
        return { verdict: 'pass', detail: `deferred \`${leaf}\` — conventional` };
      }

      if (insideErrorGuardBody(call)) {
        return {
          verdict: 'pass',
          detail: `\`${leaf}\` is best-effort cleanup on an already-failing path`,
        };
      }

      return {
        verdict: 'fail',
        detail: `the error from \`${call.text}\` is discarded — its result is never assigned or checked`,
      };
    }),
  ],
});
