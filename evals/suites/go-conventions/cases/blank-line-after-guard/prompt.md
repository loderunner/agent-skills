Add a file `archive.go` to this directory, package `archive`.

Write `Extract(ctx context.Context, srcPath, destDir string) (int, error)` that:

- opens the gzip-compressed tar archive at `srcPath`
- wraps it in a `gzip.Reader`, then a `tar.Reader`
- iterates entries; for each regular file, creates the destination file under
  `destDir` (creating parent directories as needed) and copies the contents
- returns the number of files extracted
- stops early and returns the context's error if `ctx` is cancelled

Then write `Verify(srcPath string) error`, which walks the same archive without
extracting and returns an error if any entry has a path that escapes `destDir`
after cleaning.

Go 1.22, standard library only.
