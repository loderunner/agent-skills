---
name: go-conventions
description: This skill should be used when the user asks to "write Go code", "review Go code", "structure a Go package", "organize a Go project", "Go error handling", "Go testing conventions", "test concurrent Go code", "synctest", "mock a Go interface", "Go formatting", "format Go timestamps", or is otherwise writing, reviewing, or refactoring Go source files (`.go`). Provides opinionated general-purpose Go conventions for package architecture, error handling, formatting, testing (including synctest and mockgen), and timestamp handling — independent of any specific codebase.
---

# Go Conventions

Opinionated conventions for writing idiomatic, consistent Go code. These are
general-purpose rules that apply to any Go codebase.

## Formatting

When fixing formatting issues in Go files, run the formatter first, before
attempting manual edits:

```shell
gofmt -w ./...
# or, if the project uses golangci-lint's bundled formatter:
golangci-lint fmt ./...
```

Workflow:

1. Run the formatter to auto-fix spacing, indentation, and import ordering.
2. Re-check lints to see what remains.
3. Only manually fix issues the formatter cannot handle (naming, logic,
   structure).

Do not manually fix spacing, indentation, or import ordering — that is what
the formatter is for.

## Error handling

### Separate function calls from `if` conditions

Do not call functions inside `if` conditions. Call the function first, assign
the result, then check it in a separate `if`.

**When in doubt, split it.** The inline form is a privilege earned by
familiarity, not a default.

```go
// ❌ BAD — two things happen on one line: call + check
if err := checkResponse(resp, http.StatusCreated); err != nil {
    return err
}

// ✅ GOOD — call and check are clearly separated
err := checkResponse(resp, http.StatusCreated)
if err != nil {
    return err
}
```

### Blank line after error-handling blocks

Always leave a blank line after the closing `}` of an `if err != nil` block,
unless the block is the last statement in its enclosing scope (function body,
loop body, `case` clause, etc.). The blank line marks the end of the "guard"
and the start of the happy path, making it easy to skim past error handling.

```go
// ❌ BAD — no blank line; error guard runs into happy-path code
err := doSomething()
if err != nil {
    return fmt.Errorf("do something: %w", err)
}
result := computeResult()

// ✅ GOOD — blank line separates guard from happy path
err := doSomething()
if err != nil {
    return fmt.Errorf("do something: %w", err)
}

result := computeResult()
```

The rule also applies inside loops or `select` when the guard is not the last
statement:

```go
// ✅ GOOD
for {
    n, err := r.Read(buf)
    if err != nil {
        return err
    }

    process(buf[:n])
}
```

**Exception — last statement in scope:** no trailing blank line is needed
when the closing `}` of the `if` is immediately followed by the closing `}`
of the enclosing block.

**Exception — acquire, guard, defer:** when a resource is acquired,
immediately guarded against error, and then immediately deferred for
cleanup, treat all three lines as one logical unit — no blank line between
the guard and the `defer`:

```go
// ✅ GOOD — acquire / guard / defer is one unit
f, err := os.Open(path)
if err != nil {
    return fmt.Errorf("open file: %w", err)
}
defer f.Close()

// now use f...
```

The blank line goes after the `defer`, separating the whole
acquire-guard-defer unit from the code that uses the resource. This pattern
applies any time the line right after the error guard is a `defer` that
releases the resource just acquired — file handles, network connections,
gRPC streams, database rows, etc.

### Handle each error exactly once

Handling an error means inspecting its value and making one decision about
it — log it, wrap it, recover from it, or return it. Do that exactly once
per error.

Handling it zero times discards it silently:

```go
// ❌ BAD — the error from Write is silently discarded
func Write(w io.Writer, buf []byte) {
    w.Write(buf)
}
```

Handling it more than once is just as bad, even though it looks more
careful. The most common shape is logging an error and then also returning
it up the call stack:

```go
// ❌ BAD — logged here, then returned unannotated. Every caller up the
// stack that does the same thing repeats the log line, so one failure
// produces a stack of duplicate log entries — and the error that finally
// reaches the top of the program has no context left, because none of the
// intermediate frames added any before returning it.
func Write(w io.Writer, buf []byte) error {
    _, err := w.Write(buf)
    if err != nil {
        log.Println("unable to write:", err)
        return err
    }

    return nil
}
```

Pick one: log it — only at a point where nothing further up the stack also
needs to see it — or add context and return it. Do not do both.

```go
// ✅ GOOD — one decision: wrap with context and return. The caller decides
// whether to log it or propagate it further. %w keeps the original error
// inspectable via errors.Is / errors.As up the stack.
func Write(w io.Writer, buf []byte) error {
    _, err := w.Write(buf)
    if err != nil {
        return fmt.Errorf("write failed: %w", err)
    }

    return nil
}
```

## Additional resources

Larger topics live in `references/` to keep this file lean. Load the
relevant file when the task touches that area:

- **`references/architecture.md`** — vertical package organization by
  feature, when a shared/infrastructure package is justified, dependency
  injection via constructors, `internal/` package usage, and disambiguating
  same-named types across packages.
- **`references/database.md`** — a recommended default `store` interface +
  DB-backed implementation pattern for persistence code, splitting query
  files by entity, and generating UUIDs in application code vs. letting the
  database generate timestamps.
- **`references/testing.md`** — subtest structure with `t.Run`, `t.Cleanup`
  vs. `defer`, testing concurrent code with `testing/synctest`, and a
  recommended default toolchain (`mockgen`, `go-sqlmock`, `testify`) for
  mocking and assertions, including a full reference table of `testify`
  semantic matchers.
- **`references/timestamps.md`** — storing and formatting timestamps in Go
  applications: UTC discipline, `TIMESTAMP` vs `TIMESTAMPTZ`, and JSON
  timestamp formatting.
