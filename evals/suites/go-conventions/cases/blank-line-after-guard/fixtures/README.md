# Fixtures

Known verdicts for this case's checkers. **The `.go` files carry no comments**:
the grader reads these bytes, and for this case comments are doubly dangerous —
a comment between the guard and what follows it changes the raw layout the rule
is computed from. The rationale lives here instead.

Fixtures marked *(Jev)* are only decided once `TYPESAFE_API_KEY` is set;
without it they report `needs-jev` and the calibration test skips them rather
than passing them.

## pass

| File | What it pins down |
| --- | --- |
| `blank-line.go` | The skill's own ✅ GOOD block. |
| `loop-guard.go` | The skill's loop example: the rule applies inside a loop when the guard is not the last statement. |
| `last-in-scope.go` | All three shapes of the exception — guard last in a function body, in a `case` clause, and in a loop body. |
| `acquire-guard-defer.go` | The skill's own acquire/guard/defer block. *(Jev)* |
| `defer-body-close.go` | `defer resp.Body.Close()` — a field of the acquired value. *(Jev)* |
| `defer-second-return.go` | `defer cancel()` where `cancel` is a second return value of the same acquire call. *(Jev)* |

## fail

| File | What it pins down |
| --- | --- |
| `no-blank-line.go` | The skill's own ❌ BAD block. |
| `runs-into-call.go` | Guard inside a loop running straight into `process(...)`. |
| `defer-unrelated-mutex.go` | The near-miss: a `defer` follows the guard with no blank line, but it unlocks a mutex locked earlier rather than releasing what was acquired, so the exception does not apply. *(Jev)* |
