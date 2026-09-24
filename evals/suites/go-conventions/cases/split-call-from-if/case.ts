import { astCheck, defineCase } from '../../../../src/case.js';
import { functionCallsIn } from '../../../../src/checkers/go.js';

/**
 * Narrowings, and why:
 *
 * - Only the `if` initializer is checked, not the condition. Every example in
 *   the skill is the initializer form, and flagging a bare condition would mark
 *   `if errors.Is(err, os.ErrNotExist)` as a violation — idiomatic Go the skill
 *   plainly does not ban. This is a gap in the skill text, not in the grader.
 * - Type conversions to predeclared types and calls to builtins are excluded;
 *   see `isTypeConversion` and `isBuiltinCall`.
 */
export default defineCase({
  claim:
    'Do not call functions inside `if` conditions. Call the function first, assign the result, then check it in a separate `if`.',
  source: 'skills/go-conventions/SKILL.md#L34-L53',
  reps: 3,
  checks: [
    // Every `if`, so compliant ones count as evidence of compliance rather than
    // being invisible. An `if` with no initializer cannot violate.
    astCheck('if-initializer-call', '(if_statement) @unit', (unit) => {
      const initializer = unit.node.childForFieldName('initializer');
      if (initializer === null) {
        return { verdict: 'pass', detail: 'no initializer' };
      }

      const calls = functionCallsIn(initializer);
      if (calls.length === 0) {
        return { verdict: 'pass', detail: 'initializer calls no function' };
      }

      return {
        verdict: 'fail',
        detail: `call inside the \`if\` initializer: ${calls.map((call) => call.text).join(', ')}`,
      };
    }),
  ],
});
