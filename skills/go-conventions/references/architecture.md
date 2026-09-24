# Go Package Architecture

The general patterns apply to any Go codebase: services, CLIs, libraries.
The backend section covers how those patterns look in an HTTP or RPC
service.

## General patterns

### Organize vertically by feature, not by layer

Organize Go code **vertically by feature**. A feature package owns its full
vertical slice: entry points, logic, persistence, and any types specific to
that feature.

Do not organize by layer type. Avoid `handlers/`, `models/`, `types/`,
`repository/`, or `controllers/` packages that group code by what it *is*
rather than what it *does*.

When adding a new feature, create a new top-level package for it. That
package owns all the code the feature needs.

### Shared packages are the exception, not the default

Some code is genuinely cross-cutting and belongs in a dedicated package.
This is infrastructure, not business logic. It carries no domain knowledge.

**What qualifies:**

- Configuration loading
- Thin shared helpers with no domain knowledge (e.g. a TLS config helper, a
  low-level transport dialer)

**What does not qualify:**

- Shared domain types. These belong in the feature that owns them.
- Any package whose name is a layer type (`handlers`, `models`,
  `repositories`, `services`)

Before creating a shared package, check whether the code actually needs to
be shared, or whether it's being pulled out prematurely. A second real
caller is the bar, not anticipated reuse.

### Dependency injection through constructors

Inject dependencies through constructors, not through globals or runtime
lookup. Constructor injection is explicit and checked by the compiler;
lookup fails at runtime and hides the dependency graph.

```go
// ✅ GOOD: explicit, compiler-enforced
func NewSyncer(client *http.Client, cache Cache, dest string) *Syncer

// ❌ BAD: hidden dependency on a package-level global set somewhere in main
var cache Cache

func (s *Syncer) Run(ctx context.Context) error {
    v, ok := cache.Get(key)
    // ...
}
```

### Disambiguate same-named types across packages

When types across sibling packages share a name (e.g. `Store`, `Client`,
`Config`), disambiguate at the call site with an import alias rather than
renaming the type itself. Each package can export its own `Store`; when a
caller needs more than one, alias the imports:

```go
import (
    orderstore "myapp/orders/store"
    customerstore "myapp/customers/store"
)
```

### `internal/` for genuinely shared infrastructure

Go's compiler enforces that packages under an `internal/` directory are
only importable by code rooted at the parent of that `internal/` directory.
This is a language-level restriction, not just a convention. Use it for
thin, truly shared infrastructure used by multiple binaries or features that
has no domain knowledge of its own (e.g. mTLS certificate loading, a raw
socket dialer).

Do not add domain types, shared business logic, or cross-feature data models
to `internal/`. That pulls layer-based organization back in through the
side door.

### Validate what comes in, sanitize what goes out

Treat the edge of the program as a boundary. Everything crossing it inward
is untrusted until validated; everything crossing it outward is sanitized
before it leaves.

**What comes in:** flags, environment variables, config files, request
paths/headers/payloads, responses from upstream services, database rows,
files read from disk, messages off a queue. Data your own program wrote
earlier still counts: storage outlives the code that wrote it, and another
version or another program may have written it since.

**What goes out:** response payloads, logs and error messages, persisted
rows and files, requests to upstream services, metrics labels.

#### Validate at the edge, then trust the invariants

Validate once, where data enters, by converting it into a type that can only
hold valid values. Code past the boundary takes that type and does not
re-check it. Validation scattered through the core is noise that obscures
the real logic, and it is always incomplete somewhere.

```go
// ✅ GOOD: parse at the edge into a type that carries the invariant
type Port uint16

func ParsePort(s string) (Port, error) {
    n, err := strconv.ParseUint(s, 10, 16)
    if err != nil || n == 0 {
        return 0, fmt.Errorf("invalid port %q", s)
    }

    return Port(n), nil
}

func Listen(p Port) error // trusts p, no checks

// ❌ BAD: raw input flows inward, every consumer re-validates (or forgets to)
func Listen(port string) error {
    n, err := strconv.Atoi(port)
    if err != nil || n <= 0 || n > 65535 {
        // ...
    }
    // ...
}
```

- Validation includes parsing. Decode structured data (JSON, YAML, env
  strings, query params) into typed structs at the boundary. Do not pass raw
  `map[string]any`, `[]byte` or strings inward and pick fields out later.
- Once there is more than a handful of rules, use a library instead of
  hand-rolled checks: e.g. `spf13/viper` to load and bind configuration from
  files, env and flags, or the web framework's built-in binding and
  validation (struct tags such as `go-playground/validator`) for request
  payloads. Declarative rules are easier to read, harder to forget, and
  produce consistent error messages. Hand-write checks only for a few simple
  fields or invariants the library can't express.
- Fail fast: reject invalid config and flags at startup, not on first use.
- Reject rather than repair. Silently coercing bad input hides bugs upstream.
- Upstream responses and database rows get the same treatment as user
  input: check required fields, ranges and enum values when decoding, not
  when a nil pointer surfaces three calls later.

#### Sanitize on the way out

Decide explicitly what leaves the program. It should never follow from the
shape of an internal struct.

- Serialize through dedicated output types, not domain or storage structs. A
  field added to an internal struct later (a password hash, an internal ID)
  must not leak by default.
- Keep secrets out of logs and errors: give secret-bearing types a
  `String()` / `LogValue()` that redacts, and don't wrap raw payloads into
  error messages.
- Validate before persisting, so storage never holds a value the next reader
  would reject. Escape or parameterize for the target format (SQL
  placeholders, `html/template`, `filepath.Clean` plus a root check for
  paths).

## Backend services

### Feature package layout

In a service, a feature package holds its HTTP or RPC handlers, and its
database operations live in a `store/` subpackage (see
`references/database.md` for that pattern in detail).

```
orders/
  handler.go            # HTTP handler
  handler_*.go
  handler_*_test.go
  store/
    store.go             # Store interface, DBStore, NewDBStore
    queries_order.go      # OrderRow, order CRUD and list
    queries_customer.go   # customer lookups used by this feature
    queries_*_test.go     # sqlmock tests
    mock_store.go         # generated by mockgen
  name.go
```

### Shared infrastructure in a service

On top of the general list, these qualify as shared infrastructure in a
service:

- Connection pools or clients shared by multiple features (e.g. an RPC
  client pool)
- Middleware (logging, request ID). This usually stays in the service root
  alongside `main.go`.

A shared `Store` interface does not qualify. Each feature has its own
persistence layer.

### Context values are for request-scoped data, not dependencies

Do not pull dependencies out of the request context. It is the service
flavor of runtime lookup: a service locator that fails at runtime instead
of at compile time.

```go
// ✅ GOOD: explicit, compiler-enforced
func NewOrderHandler(store store.Store, clients ClientPool, bucket string) *OrderHandler

// ❌ BAD: implicit, breaks at runtime
func (h *OrderHandler) Create(ctx context.Context) error {
    pool := requestContext(ctx).Value("clientPool").(*ClientPool) // service locator anti-pattern
}
```

Request-scoped context values (`context.Context`, framework-specific
`Locals`/`Get` helpers) are for request-scoped values only: authenticated
user ID, request ID, trace spans. They are not for dependencies a
constructor could have taken instead.

### Request and response boundaries

Decode each request into a request type, validate it (framework binding or
a validator), then convert it to domain types before calling into the
feature's logic. Respond through a dedicated response type built from the
result. Never marshal a `store` row or domain struct directly into a
response.
