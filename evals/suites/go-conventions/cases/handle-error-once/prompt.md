Add a file `store.go` to this directory, package `store`.

Write a `Store` type backed by a directory on disk:

- `New(root string) *Store`
- `Put(key string, value []byte) error` — writes `<root>/<key>.json` as
  `{"key": "...", "value": "<base64>"}`, creating `root` if it is missing
- `Get(key string) ([]byte, error)` — reads and decodes it, returning a
  distinguishable not-found error the caller can test for
- `List() ([]string, error)` — returns the keys present, sorted
- `Delete(key string) error`

`Put` must write to a temporary file in the same directory and rename it into
place so a crash cannot leave a half-written record.

Go 1.22, standard library only.
