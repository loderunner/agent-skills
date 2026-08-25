# Go Testing Conventions

## Test structure

Use `t.Run` to nest subtests under a single top-level test per handler or
unit under test. Share expensive setup (a server, a client, temp
directories) at the top level and run related subtests underneath it.

```go
func TestHandler(t *testing.T) {
    client, cleanup := setupHandlerTest(t)
    t.Cleanup(cleanup)

    t.Run("ReadFile", func(t *testing.T) {
        t.Run("small file", func(t *testing.T) {
            // ...
        })

        t.Run("large file", func(t *testing.T) {
            // ...
        })
    })

    t.Run("WriteFile", func(t *testing.T) {
        t.Run("overwrite", func(t *testing.T) {
            // ...
        })
    })
}
```

Guidelines:

- **One top-level `Test*` function** per logical unit (there may be
  multiple units in a package).
- **Group by method** as the first level of `t.Run`.
- **Name subtests by scenario**, using lowercase descriptive names.
- Each subtest should be independent — don't rely on state left behind by a
  sibling subtest (ordered E2E tests, above, are the explicit exception).

## Cleanup: `t.Cleanup` over `defer`

Use `t.Cleanup` instead of `defer` for teardown in tests. `t.Cleanup` runs
after the test _and all its subtests_ finish, in LIFO order — which is
almost always what's wanted. `defer` runs when the enclosing function
returns, which for a top-level `Test*` function that launches subtests
means _before_ the subtests finish, causing teardown to happen too early.

```go
// ❌ BAD — cleanup runs before subtests finish
func TestHandler(t *testing.T) {
    svc, cleanup := startService(t)
    defer cleanup()

    t.Run("...", func(t *testing.T) { ... })
}

// ✅ GOOD — cleanup runs after all subtests finish
func TestHandler(t *testing.T) {
    svc, cleanup := startService(t)
    t.Cleanup(cleanup)

    t.Run("...", func(t *testing.T) { ... })
}
```

This applies at every level: top-level tests, subtests, and helpers. When a
helper registers cleanup on behalf of the caller, pass `t` into it and call
`t.Cleanup` inside the helper — don't return a cleanup function for the
caller to `defer`.

```go
// ❌ BAD — caller must remember to defer
func setupDB(t *testing.T) (*sql.DB, func()) {
    db := openTestDB(t)
    return db, func() { db.Close() }
}

// ✅ GOOD — helper self-registers cleanup
func setupDB(t *testing.T) *sql.DB {
    db := openTestDB(t)
    t.Cleanup(func() { db.Close() })
    return db
}
```

**Exception — `defer` inside a `synctest` bubble:** the conventional form
inside a synctest bubble is `defer db.Close()` (see below). This is a
narrow, documented exception; outside synctest bubbles, always use
`t.Cleanup`.

## Testing concurrent code with `testing/synctest`

Use `synctest.Test` to test code involving goroutines, timers, or channel
coordination. It creates an isolated bubble with a fake clock —
`time.Sleep`, `time.After`, `time.NewTimer`, and `time.NewTicker` advance
instantly with no wall-clock delay. The bubble auto-panics when all
goroutines are permanently blocked, giving free deadlock detection.

### When to use it

- The test spawns goroutines and waits on channels or `sync.WaitGroup`.
- The code under test uses `time.Sleep`, `time.After`, `time.NewTimer`,
  `time.NewTicker`, or `context.WithTimeout` — even if the test itself
  looks synchronous.
- The code under test spawns internal goroutines (background workers, retry
  loops with `time.Sleep`) — the bubble covers all goroutines started
  transitively, not just ones started directly in test code.
- The test uses a `select { case <-ch: ... case <-time.After(Xs):
t.Fatal(...) }` deadlock guard — synctest replaces these entirely.

### When NOT to use it

- **Real network I/O** (`net.Listen`, `net.Dial`, TCP/Unix sockets) —
  network operations are not durably blocking; the bubble will deadlock.
- **Real OS processes** (`os/exec`, `io.Pipe()`) — file descriptor I/O is
  not durably blocking.
- **Mutex contention stress tests** — tests that deliberately race
  goroutines through `sync.Mutex` to validate thread safety; synctest adds
  no value here.
- **E2E tests** — these hit real services, containers, and filesystems.

### Durably blocking operations

Synctest advances the fake clock and detects deadlocks based on whether
goroutines are "durably blocked". Know the difference:

**Durably blocking (synctest-compatible):**

- Channel send/receive on channels created inside the bubble
- `sync.Cond.Wait()`
- `sync.WaitGroup.Wait()` (when `Add` was called inside the bubble)
- `time.Sleep`, `time.After`, `time.NewTimer`, `time.NewTicker`
- `synctest.Wait()`

**Not durably blocking (causes deadlocks if used as sync points):**

- `sync.Mutex.Lock()` / `sync.RWMutex.Lock()`
- Real I/O (network, filesystem, pipes)
- `select {}` (bare select with no channel cases)

Brief, uncontended mutex usage is fine — it only causes problems when the
test expects goroutines to block on a mutex as a synchronization signal.

### Pattern

```go
t.Run("retries on failure", func(t *testing.T) {
    synctest.Test(t, func(t *testing.T) {
        // All setup, goroutines, and assertions inside the bubble.
        svc := NewService(mockDep)

        go svc.Start(ctx)
        synctest.Wait() // block until all goroutines are durably blocked

        ch <- input
        result := <-output
        require.Equal(t, expected, result)
    })
})
```

### Rules

1. **Wrap at the subtest level.** Each subtest gets its own bubble. All
   setup (mocks, channels, DB handles) must be created inside the bubble so
   their channels and goroutines belong to it.
2. **Use `synctest.Wait()` after launching goroutines.** It blocks until all
   other goroutines reach a durable blocking point, replacing
   `time.Sleep`-based readiness hacks and eliminating scheduling races.
3. **Replace `time.After` deadlock guards with direct channel reads.** The
   bubble auto-panics on real deadlocks, making manual timeout guards dead
   code:

   ```go
   // ❌ Before synctest
   select {
   case msg := <-ch:
       // ...
   case <-time.After(2 * time.Second):
       t.Fatal("timeout")
   }

   // ✅ Inside synctest bubble
   msg := <-ch
   ```

4. **Keep `time.Sleep` and `time.Since` calls as-is.** They use the fake
   clock automatically; duration assertions remain valid because the fake
   clock advances by the requested amount.
5. **Mind ordering races between goroutines.** When multiple goroutines
   consume from different channels, their scheduling is non-deterministic.
   Use `synctest.Wait()` to ensure one step completes before feeding the
   next:

   ```go
   // Ensure the routing goroutine forwards data to sendCh
   // BEFORE sending exit — otherwise exit may win the race.
   session.WriteStdin(ctx, []byte("data"))
   synctest.Wait()
   exitCh <- exitMsg
   ```

6. **`go-sqlmock` is compatible** with synctest. The internal
   `database/sql.connectionOpener` goroutine blocks on a bubble-aware
   channel and exits when `db.Close()` is called. Always `defer db.Close()`
   inside the bubble.

## Mocking

The recommended default toolchain below (`mockgen`, `go-sqlmock`,
`testify`) is a solid, well-worn combination — reach for it absent a reason
to do otherwise. It is not a hard requirement: a project with an
established alternative (e.g. hand-rolled fakes, a different assertion
library) should stay consistent with itself rather than mixing toolchains.

### Prefer generated mocks over hand-written ones

Where mocks are used, generate them with `go.uber.org/mock/mockgen` rather
than writing mock structs by hand — generated mocks stay in sync with the
interface automatically and eliminate boilerplate. Regenerate mocks (e.g.
via `go generate ./...`, or whatever generation command the project
defines) after changing an interface.

### Exceptions — when not to use gomock

- **Function types** (e.g. `type ReadinessWaiter func(...)`) — use function
  literals directly; gomock does not support non-interface types.
- **Adapters** that embed a generated "unimplemented" base and delegate to
  real handlers (common with gRPC) — these are integration test wiring, not
  mocks.
- **Trivial value-holder structs** used to test the interface's own utility
  functions, not to stand in for a dependency.

### Naming

Name mock instance variables with a `mock` prefix, e.g. `mockStore`,
`mockStream`, `mockClient`.

### Controller setup

Create `gomock.NewController(t)` at the start of each subtest. In
gomock v0.3+, the controller auto-cleans up via `t.Cleanup` — no
`defer ctrl.Finish()` needed.

```go
t.Run("happy path", func(t *testing.T) {
    ctrl := gomock.NewController(t)
    mockStore := store_mock.NewMockStore(ctrl)

    mockStore.EXPECT().InsertOrder(gomock.Any(), gomock.Any(), "pending").Return(order, nil)

    // ... act and assert ...
})
```

When subtests share a single mock instance (e.g. an args-validation group
where only one subtest reaches the code that calls the mock), create the
controller at the outer `t.Run` level and use `.AnyTimes()` for methods
that may or may not be called.

### Expectation style

- Use `gomock.Any()` for arguments the test doesn't care about (typically
  `context.Context`).
- Use concrete values for arguments that matter to the test.
- Use `gomock.InOrder(...)` only when call order across multiple mocks
  needs verification.
- Use `.Times(n)`, `.AnyTimes()`, `.MaxTimes(n)`, `.MinTimes(n)` to control
  cardinality.
- Use `.DoAndReturn(func(...) ...)` when the mock needs to compute a return
  value or perform a side effect (e.g. tracking bytes written).

```go
// context.Context — use Any()
mockStore.EXPECT().InsertOrder(gomock.Any(), gomock.Any(), "pending", gomock.Any()).Return(order, nil)

// Stateful return via DoAndReturn
var written int64
mockStream.EXPECT().Send(gomock.Any()).DoAndReturn(func(msg *pb.Msg) error {
    written += int64(len(msg.GetChunk()))
    return nil
}).AnyTimes()
mockStream.EXPECT().CloseAndRecv().DoAndReturn(func() (*pb.Resp, error) {
    return &pb.Resp{BytesWritten: written}, nil
})
```

### Generated file conventions

Keep mocks in a `mock_/` subdirectory colocated with the interface they
mock. The `mock_/` package owns its own generation via a `generate.go` file
with a `//go:generate` directive; the parent package has no
mock-related code.

- **Package name**: `<parent>_mock` (e.g. `store_mock`, `client_mock`)
- **Directory**: `mock_/` — visually distinct, globbable as `**/mock_/`
- **Own project interfaces**: `mock_/generate.go` invokes mockgen with the
  full module import path; output goes to `mock_/<name>.go`
- **Proto-generated interfaces**: `mock_/generate.go` invokes mockgen with
  `-source=../*.pb.go`
- **External interfaces** (e.g. gRPC streams): `mock_/generate.go` invokes
  mockgen with the full import path of the external package
- Commit all generated mock files to the repository

## Sqlmock

`github.com/DATA-DOG/go-sqlmock` is a good default for testing code that
calls `*sql.DB` directly. It provides a mock driver that intercepts queries
and lets tests set expectations without a real database. (An
integration-test suite that runs against a real or containerized database
instead is a reasonable alternative — pick one approach and stay consistent
within a package.)

### Setup

```go
db, mock, err := sqlmock.New()
require.NoError(t, err)
defer func() { _ = db.Close() }()
```

Always call `mock.ExpectationsWereMet()` at the end of the test:

```go
require.NoError(t, mock.ExpectationsWereMet())
```

### `WithArgs`

Include `WithArgs` on expectations whenever the arguments are simple and
deterministic — it validates that the correct values are passed to the
query, not just that some query ran.

```go
mock.ExpectExec("UPDATE orders").
    WithArgs(orderID, "shipped").
    WillReturnResult(sqlmock.NewResult(0, 1))
```

Chain order: `WithArgs` before `WillReturnResult` / `WillReturnError`.

**Skip `WithArgs` when the arguments are too intricate to validate
meaningfully:**

- `INSERT`s with long, complete rows (many columns, especially when one or
  more args are randomly generated, e.g. `uuid.New()`)
- Arguments with non-deterministic values (e.g. array args built from map
  iteration)

In these cases, omit `WithArgs` rather than resorting to `sqlmock.AnyArg()`
for most of the arguments — that adds noise without catching real bugs.

### Expectation count

Set one expectation per query call. If the code under test calls two
`UPDATE`s, register two `ExpectExec` calls. A missing expectation causes the
query to return an error at runtime — and if that error is only logged (not
returned), `ExpectationsWereMet()` will still pass despite the query having
failed silently.

### `ExpectQuery` vs `ExpectExec`

- `ExpectQuery` — for `SELECT` and any statement that returns rows
  (`INSERT ... RETURNING`)
- `ExpectExec` — for `INSERT`, `UPDATE`, `DELETE` that return only a result

## Test assertions

`github.com/stretchr/testify` is the recommended default for test
assertions — it's not the only viable library (the standard library's bare
`if got != want { t.Errorf(...) }` works too), but where a project uses
testify, apply it consistently:

- **Prefer `require`** for immediate failure on assertion errors (fail
  fast).
- **Use `assert` only** when running multiple assertions where seeing all
  failures at once provides useful context.
- **Never call a function or method directly inside the assertion** — always
  capture the result in a temporary variable first.
- **Prefer semantic matchers** over generic assertions for better failure
  messages.

### Temporary variable rule

```go
// ❌ BAD
require.NoError(t, os.WriteFile(path, data, perm))
require.Equal(t, codes.NotFound, st.Code())
require.Empty(t, registry.List())

// ✅ GOOD
err := os.WriteFile(path, data, perm)
require.NoError(t, err)

stCode := st.Code()
require.Equal(t, codes.NotFound, stCode)

items := registry.List()
require.Empty(t, items)
```

Type conversions (`int32(x)`, `string(b)`) and built-in functions (`len`)
are exempt from this rule.

### Example

```go
import (
    "github.com/stretchr/testify/assert"
    "github.com/stretchr/testify/require"
)

func TestSomething(t *testing.T) {
    // require for critical setup — fail immediately
    err := startContainer(ctx)
    require.NoError(t, err, "failed to start container")

    // require for single assertions — fail fast
    result, err := doSomething()
    require.NoError(t, err)
    require.Equal(t, expected, result)

    // assert only when multiple assertions provide useful context together
    assert.Equal(t, expected1, result1, "first assertion")
    assert.Equal(t, expected2, result2, "second assertion")
    assert.Equal(t, expected3, result3, "third assertion")
}
```

## Semantic matchers

Use the most specific matcher available. Generic assertions like `True`,
`False`, and `Equal` are a last resort for when no semantic matcher exists.

### Basic

| Instead of                           | Use                               |
| ------------------------------------ | --------------------------------- |
| `assert.Equal(t, 3, len(items))`     | `assert.Len(t, items, 3)`         |
| `assert.True(t, slice.Contains(x))`  | `assert.Contains(t, slice, x)`    |
| `assert.False(t, slice.Contains(x))` | `assert.NotContains(t, slice, x)` |
| `assert.True(t, x == nil)`           | `assert.Nil(t, x)`                |
| `assert.True(t, x != nil)`           | `assert.NotNil(t, x)`             |
| `assert.True(t, x == "")`            | `assert.Empty(t, x)`              |
| `assert.True(t, x != "")`            | `assert.NotEmpty(t, x)`           |
| `assert.True(t, x == 0)`             | `assert.Zero(t, x)`               |
| `assert.True(t, x != 0)`             | `assert.NotZero(t, x)`            |

### Numeric comparisons

| Instead of               | Use                              |
| ------------------------ | -------------------------------- |
| `assert.True(t, x > 0)`  | `assert.Positive(t, x)`          |
| `assert.True(t, x < 0)`  | `assert.Negative(t, x)`          |
| `assert.True(t, a > b)`  | `assert.Greater(t, a, b)`        |
| `assert.True(t, a >= b)` | `assert.GreaterOrEqual(t, a, b)` |
| `assert.True(t, a < b)`  | `assert.Less(t, a, b)`           |
| `assert.True(t, a <= b)` | `assert.LessOrEqual(t, a, b)`    |

For floating point comparisons with tolerance, use `InDelta` or
`InEpsilon`:

```go
assert.InDelta(t, expected, actual, 0.01)    // absolute delta
assert.InEpsilon(t, expected, actual, 0.01)  // relative error
```

### Errors

| Instead of                                         | Use                               |
| -------------------------------------------------- | --------------------------------- |
| `assert.True(t, err != nil)`                       | `assert.Error(t, err)`            |
| `assert.True(t, err == nil)`                       | `assert.NoError(t, err)`          |
| `assert.True(t, errors.Is(e, tgt))`                | `assert.ErrorIs(t, e, tgt)`       |
| `assert.Equal(t, err.Error(), msg)`                | `assert.EqualError(t, err, msg)`  |
| `assert.True(t, strings.Contains(err.Error(), s))` | `assert.ErrorContains(t, err, s)` |

For error type assertions: `assert.ErrorAs(t, err, &target)`

### Type and interface

| Instead of                                              | Use                                            |
| ------------------------------------------------------- | ---------------------------------------------- |
| `assert.Equal(t, reflect.TypeOf(x), reflect.TypeOf(y))` | `assert.IsType(t, expected, actual)`           |
| Check interface implementation                          | `assert.Implements(t, (*Interface)(nil), obj)` |

### String and pattern

| Instead of                                    | Use                           |
| --------------------------------------------- | ----------------------------- |
| `assert.True(t, regexp.MatchString(pat, s))`  | `assert.Regexp(t, pat, s)`    |
| `assert.False(t, regexp.MatchString(pat, s))` | `assert.NotRegexp(t, pat, s)` |

### File system

| Instead of                     | Use                            |
| ------------------------------ | ------------------------------ |
| Check file exists              | `assert.FileExists(t, path)`   |
| Check file does not exist      | `assert.NoFileExists(t, path)` |
| Check directory exists         | `assert.DirExists(t, path)`    |
| Check directory does not exist | `assert.NoDirExists(t, path)`  |

### Panics

| Instead of                      | Use                                       |
| ------------------------------- | ----------------------------------------- |
| Check function panics           | `assert.Panics(t, func() { ... })`        |
| Check function does not panic   | `assert.NotPanics(t, func() { ... })`     |
| Check panic with specific value | `assert.PanicsWithValue(t, expected, fn)` |
| Check panic with specific error | `assert.PanicsWithError(t, errStr, fn)`   |

### Pointer identity

| Instead of                     | Use                             |
| ------------------------------ | ------------------------------- |
| `assert.True(t, ptr1 == ptr2)` | `assert.Same(t, ptr1, ptr2)`    |
| `assert.True(t, ptr1 != ptr2)` | `assert.NotSame(t, ptr1, ptr2)` |

### Time

```go
assert.WithinDuration(t, expected, actual, 10*time.Second)
assert.WithinRange(t, actual, start, end)
```

### Structured data

```go
assert.JSONEq(t, expectedJSON, actualJSON)
assert.YAMLEq(t, expectedYAML, actualYAML)
```

### Collections

For unordered slice comparison:

```go
// Good: order-independent comparison
assert.ElementsMatch(t, actual, []string{"a", "b", "c"})

// Bad: fragile if order changes
assert.Equal(t, []string{"a", "b", "c"}, actual)
```

For subset checking:

```go
assert.Subset(t, []int{1, 2, 3}, []int{1, 2})      // passes: subset
assert.NotSubset(t, []int{1, 2, 3}, []int{1, 4})   // passes: not a subset
```
