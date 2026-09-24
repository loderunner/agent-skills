# Fixtures

Known verdicts for this case's checkers. **The `.go` files carry no comments**:
the grader reads these bytes, so an explanatory comment would be a hint aimed
at the thing being calibrated. The rationale lives here instead.

## pass

| File | What it pins down |
| --- | --- |
| `separated.go` | The skill's own ✅ GOOD block. |
| `comma-ok.go` | `if v, ok := m[k]; ok` and a type assertion: an initializer with no call. Idiomatic, and the skill doesn't ban it. |
| `type-conversion.go` | `int64(x)`, `string(b)`, `float64(x)` parse as `call_expression` but are not function calls. |
| `builtin.go` | `len`, `cap` — predeclared functions, excluded for the same reason. |
| `no-initializer.go` | `errors.Is(...)` and `strings.HasPrefix(...)` in a bare condition. Documents the narrowing: conditions are not checked, because flagging these would be a wrong verdict. |

## fail

| File | What it pins down |
| --- | --- |
| `inline-call.go` | The skill's own ❌ BAD block. |
| `selector-call.go` | `pkg.Do()` — a call through a selector expression. |
| `nested-call.go` | `len(mustList())` — the call is nested below a builtin, so a predicate inspecting only the initializer's top-level expression would miss it. |
