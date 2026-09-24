Create `client.go` in this directory, package `client`.

It should define a `Client` struct holding a `*http.Client` and a base URL
string, with a `New(baseURL string) *Client` constructor.

Add a method `CreateWidget(ctx context.Context, name string) (string, error)`
that:

- builds a JSON request body `{"name": "<name>"}`
- POSTs it to `<baseURL>/widgets` using `http.NewRequestWithContext`
- expects HTTP 201; any other status is an error reporting the status
- decodes the response body as `{"id": "..."}` and returns the id

Then add `DeleteWidget(ctx context.Context, id string) error`, which sends a
DELETE to `<baseURL>/widgets/<id>` and expects HTTP 204.

Go 1.22, standard library only. Nothing needs to compile against a real server.
