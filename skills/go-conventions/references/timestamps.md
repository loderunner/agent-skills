# Timestamps

A common source of subtle bugs in Go backends is mixing timezone-aware and
timezone-naive timestamps across the database, application code, and API.
Pick one discipline and apply it consistently.

## A consistent UTC discipline

For applications that don't need to store per-event timezone information
(most backend services), store and transmit all timestamps in UTC. Treat
timezone information as a display concern the frontend applies when
rendering, never as something stored or transmitted by the backend.

## Database

Decide deliberately between `TIMESTAMP` (no timezone) and `TIMESTAMPTZ`
(timezone-aware, normalized to UTC internally by Postgres):

- If the application has committed to storing everything in UTC and never
  needs to reconstruct the original timezone an event occurred in, plain
  `TIMESTAMP` is simpler and makes the "always UTC" invariant explicit in
  the schema — there's no timezone field to accidentally misuse.
- If the application genuinely needs the source timezone (e.g. "what time
  did this happen for the user"), use `TIMESTAMPTZ` and store the offset
  deliberately, rather than reconstructing it after the fact.

Whichever is chosen, apply it consistently across the schema — don't mix
`TIMESTAMP` and `TIMESTAMPTZ` for logically similar columns.

## Go

- Always call `time.Now().UTC()`, not `time.Now()`, when constructing a
  timestamp in application code outside of a database write. `time.Now()`
  returns a value in the local timezone of the machine running the process,
  which varies between environments (a developer's laptop vs. a production
  server) and silently reintroduces timezone drift.
- Be aware of driver-specific behavior when scanning timestamp columns. For
  example, `lib/pq` returns `time.Time` values with `time.UTC` as their
  location when scanning `TIMESTAMP` (no-timezone) columns — don't
  re-convert or adjust these values, since there's no timezone information
  to convert from. Confirm the equivalent behavior for whichever driver is
  in use before assuming it matches.

## API / JSON

When an API guarantees all timestamps are UTC, format them with a literal
`Z` suffix rather than a variable offset:

```go
const apiTimestampFormat = "2006-01-02T15:04:05.000Z"
```

Do not use `time.RFC3339` or `time.RFC3339Nano` for this — both format with
a variable timezone offset (`Z07:00`), which contradicts an API that has
already committed to UTC-only and makes clients handle offsets that never
actually vary.
