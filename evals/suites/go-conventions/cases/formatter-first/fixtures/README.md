# Fixtures

Known verdicts for this case's transcript checker. Each `.jsonl` file is a
synthetic `stream-json` tool-call log.

## pass

| File | What it pins down |
| --- | --- |
| `formatter-then-edit.jsonl` | `gofmt -w` before the first `Edit`. |
| `formatter-only.jsonl` | The formatter ran and nothing was edited by hand. |
| `golangci-fmt.jsonl` | `golangci-lint fmt` counts as the formatter. |
| `find-then-format.jsonl` | Regression. `find . -name report.go 2>/dev/null` was counted as a manual edit by a `>`-anywhere pattern, failing a with-skill run that had done nothing wrong. |
| `grep-redirect-then-format.jsonl` | Regression. A redirect whose target is *not* a `.go` file is not a write to one. |

## fail

| File | What it pins down |
| --- | --- |
| `edit-then-formatter.jsonl` | Edited first, formatted after. |
| `edit-only.jsonl` | Edited and never formatted. |
| `heredoc-write-then-format.jsonl` | A real shell write — `cat > report.go <<EOF` — before formatting. `--bare` removes the `Write` tool, so this is how a file gets created at all. |
