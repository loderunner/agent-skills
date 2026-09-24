# Fixtures

Known verdicts for this case's checkers. **The `.go` files carry no comments**:
the grader reads these bytes, so an explanatory comment would be a hint aimed
at the thing being calibrated. The rationale lives here instead.

Fixtures marked *(Jev)* are only decided once `TYPESAFE_API_KEY` is set;
without it they report `needs-jev` and the calibration test skips them rather
than passing them.

## pass

| File | What it pins down |
| --- | --- |
| `wrap-and-return.go` | The skill's own ✅ GOOD block: wrap with context and return. *(Jev)* |
| `return-bare.go` | Returning the error unchanged is still handling it exactly once. *(Jev)* |
| `log-only.go` | Logged and not returned, at a point where nothing upstack needs it. *(Jev)* |
| `terminates.go` | `log.Fatalf` — a terminal point. *(Jev)* |
| `deferred-close.go` | A discarded error inside a `defer`, and an explicit `_ =`. *(Jev)* |
| `cleanup-in-guard.go` | Regression. The atomic-write pattern both arms generated: `tmp.Close()` on the already-failing path is best-effort cleanup, not a discarded error, and the happy-path `Close` *is* checked. Counting the cleanup call was a false positive worth 6 wrong verdicts. *(Jev)* |

## fail

| File | What it pins down |
| --- | --- |
| `log-and-return.go` | The skill's own ❌ BAD block: logged, then returned. *(Jev)* |
| `log-and-wrap.go` | Still two handlings even though the returned error is wrapped. *(Jev)* |
| `discarded-write.go` | The skill's own ❌ BAD block: `w.Write(buf)` discarded. Settled syntactically, so it grades without a key. |
