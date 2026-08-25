# Database Conventions

## The `store` subpackage pattern (recommended default)

One good way to structure persistence code — not the only valid one, but a
solid default absent a reason to deviate — is to give each feature with
database operations a `store/` subpackage containing:

- **`Store` interface** — abstracts all DB operations for the feature
- **`DBStore`** — implementation backed by `*sql.DB` (or the project's DB
  handle type)
- **Query files** — named by entity: `queries_order.go`,
  `queries_customer.go`, or just `queries.go` when there is only one entity
- **Row types and errors** — defined in the query file that produces them

Handlers should depend on `store.Store` (the interface), never directly on
`*sql.DB`. Wire `store.NewDBStore(db)` once, near the top of the program,
and pass the resulting `Store` down through constructors.

This gives every feature a seam for testing: production code gets a real
`DBStore`, handler tests get a mock of `Store`, and store tests exercise
`DBStore` itself against a mock driver. See `references/testing.md` for
mocking approaches, including the recommended defaults used there.

The pattern's essential part is the seam — a `Store` interface that handlers
depend on instead of a concrete DB handle. The specific naming
(`store/`, `DBStore`) and file layout below are a convention worth reaching
for by default, not a requirement; adapt or drop them if the project already
has an established persistence pattern.

### Split query files by entity

Name query files so it's obvious where a given query lives:
`queries_order.go`, `queries_customer.go`, `queries_shipment.go`. If a file
grows past roughly 400 lines, split it further by entity or by
read/write concern. Use a single `queries.go` only when the feature has
exactly one entity.

### Cross-feature dependencies go through the other feature's store

When feature A needs data owned by feature B, A imports B's `store` package
and depends on `B store.Store` — not on B's handler, and not by
duplicating B's queries. This keeps each feature the single owner of its own
persistence and its own row types.

```go
// package orders
import customerstore "myapp/customers/store"

func NewOrderHandler(orders store.Store, customers customerstore.Store) *OrderHandler
```

## Generated values on `INSERT`

For columns with auto-generated defaults (surrogate IDs, timestamps), split
responsibility between application code and the database:

**Generate IDs (e.g. UUIDs) in application code**, not with database
functions or column defaults. Pass the value explicitly to `INSERT`. This
makes the ID available *before* the insert completes, which simplifies
multi-table transactions (you can reference the new row's ID in the same
transaction) and makes tests deterministic.

**Let the database generate timestamps** (`created_at`, `updated_at`) via
column defaults (`NOW()`). Do not pass timestamp values from application
code for these columns. This keeps timestamps consistent across multiple
app server instances with potentially skewed clocks, and ties the timestamp
to the moment the row actually landed in the database rather than the
moment the application constructed the query.

```sql
-- ✅ GOOD
INSERT INTO orders(id, customer_id) VALUES ($1, $2)
RETURNING id, customer_id, created_at

-- ❌ BAD: generating the ID in the database — the ID isn't known before insert
INSERT INTO orders(customer_id) VALUES ($1)
RETURNING id, customer_id, created_at

-- ❌ BAD: passing created_at from app code — clock skew risk, no benefit
INSERT INTO orders(id, customer_id, created_at) VALUES ($1, $2, $3)
RETURNING id, customer_id, created_at
```

```go
// ✅ GOOD
id := uuid.New()
err := db.QueryRow(
    `INSERT INTO orders(id, customer_id) VALUES ($1, $2) RETURNING id, customer_id, created_at`,
    id, customerID,
).Scan(&order.ID, &order.CustomerID, &order.CreatedAt)
```
