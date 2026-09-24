/** Go-specific readings of a shell command. */

/** True when the command runs a Go formatter over the tree. */
export function isGoFormatter(command: string): boolean {
  return /\b(gofmt|gofumpt|goimports)\b|\bgo\s+fmt\b|\bgolangci-lint\s+fmt\b/.test(command);
}

/**
 * True when a shell command writes to a `.go` file — a redirect, `tee`, `sed -i`.
 *
 * Counted as a manual edit, since `--bare` removes the `Write` tool and this is
 * how a file gets created at all. Matches the redirect *target*, not merely the
 * presence of a `>`: `find . -name report.go 2>/dev/null` is a read.
 */
export function isShellWriteToGo(command: string): boolean {
  if (isGoFormatter(command)) {
    return false;
  }

  return (
    /\d?>>?\s*[^\s;|&<>]*\.go(\s|$|;|&)/.test(command) ||
    /\btee\b(\s+-a)?\s+[^\s;|&]*\.go\b/.test(command) ||
    /\b(sed|perl)\s+-i\b[^;|&]*\.go\b/.test(command)
  );
}
