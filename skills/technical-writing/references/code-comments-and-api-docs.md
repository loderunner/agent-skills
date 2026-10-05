# Code comments, docstrings, API reference, and sample code

Distilled from the style guide's *API reference code comments*, *Verb forms in reference
documentation*, *Code in text*, and *Code samples* pages, and from *Creating sample code* in
Technical Writing Two.

## Contents

- [Language conventions come first](#language-conventions-come-first)
- [What an API reference must cover](#what-an-api-reference-must-cover)
- [Classes, interfaces, and modules](#classes-interfaces-and-modules)
- [Methods and functions](#methods-and-functions)
- [Parameters, return values, and exceptions](#parameters-return-values-and-exceptions)
- [Deprecations](#deprecations)
- [Inline comments](#inline-comments)
- [Referring to code in prose](#referring-to-code-in-prose)
- [Sample code](#sample-code)
- [Worked example](#worked-example)

## Language conventions come first

Doc-comment syntax and some phrasing rules come from the language, and they win over anything here:

- **Go:** doc comments are full sentences that begin with the name of the thing declared
  ("`Load reads the config file at path and …`"). This overrides "don't repeat the name".
- **Python:** PEP 257 docstrings; a one-line summary in the imperative or descriptive form your
  project already uses, then sections such as `Args:`, `Returns:`, `Raises:` (Google style) or the
  numpydoc/Sphinx equivalents the project uses.
- **Java/Kotlin (Javadoc/KDoc), JS/TS (JSDoc/TSDoc), Rust (rustdoc), C# (XML docs):** use their tags
  (`@param`, `@return`, `@throws`, `# Errors`, `<param>`).

Match whatever the surrounding code already does. Apply the content guidance below inside those
formats.

## What an API reference must cover

Every public element needs a description:

- Every class, interface, struct, enum, and similar type.
- Every constant, field, enum value, and typedef.
- Every method: what it does, each parameter, the return value, and every exception or error it
  can raise.

Strongly recommended:

- A short code sample (about 5–20 lines) at the top of each type's documentation.
- API names, classes, methods, constants, and parameters in code font, linked to their reference
  where the doc generator allows.
- String literals in code font with double quotation marks: `"wrap_content"`.
- Class names spelled exactly as in code (`ActionBar`, not "Action Bar"). Don't pluralize a class
  name; add a noun: "`Intent` objects", not "`Intents`".

## Classes, interfaces, and modules

The **first sentence** is often extracted into summaries and indexes, so make it unique,
descriptive, and short. It states the purpose with information that *can't* be deduced from the
name and signature.

- Don't repeat the class name in the first sentence (unless the language convention requires it,
  as in Go).
- Don't write "This class will…" or "This class does…".
- Don't put a period before the real end of the first sentence — some generators cut the summary at
  the first period. Write "for example", not "e.g.".

> **ActionBar:** A primary toolbar within the activity that can display the activity title,
> app-level navigation, and other interactive items.

After the first sentence, explain how to use the type: how to get or create an instance, key
features, best practices, and pitfalls.

**Constants and fields:** as brief as possible, and link to the methods that use them.

> **DISPLAY_SHOW_HOME:** Show "home" elements in this action bar, leaving more space for other
> navigation elements. This includes the logo and icon. See also: `setDisplayOptions(int)`.

## Methods and functions

**Describe what the method does, in present tense, from the method's point of view** — *gets*,
*creates*, *returns* — not what the caller does with it (*get*, *create*).

| Recommended | Not recommended |
|---|---|
| Creates a task in the specified task list. | Create a new task on the specified task list. |
| Returns the bird with the given ID. | This method will return a bird. |

(Python projects that follow PEP 257's imperative summary line — "Return the bird…" — keep that
convention.)

Choose the opening verb by what the method does:

| Kind of method | Start with | Example |
|---|---|---|
| Does work and returns data | The operation's verb | Adds a bird to the ornithology list and returns the ID of the new entry. |
| Boolean getter | "Checks whether …" | Checks whether the activity is being destroyed to be re-created with a new configuration. |
| Other getter | "Gets the …" / "Returns the …" | Gets the current playback position, in milliseconds. |
| Setter / toggle | "Sets the …" | Sets the maximum number of retries. |
| Updates | "Updates the …" | Updates the display name of the account. |
| Deletes | "Deletes the …" | Deletes the specified snapshot. |
| Registers a callback | "Registers …" | Registers a listener that's called when the download finishes. |
| Callback (`on…`) | "Called by … when …" | Called by the runtime when the buffer fills. Subclasses implement this method to … |
| Factory / convenience constructor | "Creates a …" | Creates a client that uses the default credentials. |

After the first sentence: why and when to use it, prerequisites that must hold before calling it,
required permissions or dependencies and what happens if they're missing ("throws
`SecurityException`", "returns `null`"), side effects, thread-safety, and related APIs.

## Parameters, return values, and exceptions

**Parameters**

- Capitalize the first word and end with a period.
- For non-boolean parameters, start with "The" or "A": "The ID of the bird to get." / "A
  description of the bird."
- For booleans that tell the API to *do* something, say what happens for each value: "If true,
  validates the SSL certificate before proceeding. If false, trusts the certificate without
  validating it."
- For booleans that report an existing state: "True if the zoom is set; false otherwise."
- Don't put *true* and *false* in code font or quotation marks in these descriptions.
- State units, valid ranges, and formats ("The timeout, in seconds. Must be between 1 and 300.").
- For parameters with default behavior, describe each value or range, then end with
  "Default: `30`."

**Return values** — as brief as possible; put details in the method description.

- Non-boolean: start with "The …": "The bird specified by the given ID."
- Boolean: "True if the bird is in the sanctuary; false otherwise."
- Say what's returned in edge cases (empty list, `null`, `None`).

**Exceptions and errors**

- If the generator already inserts "Throws", start with "If …": "If no key is assigned."
- Otherwise start with "Thrown when …": "Thrown when no key is assigned."
- Document each exception type a caller could reasonably handle.

## Deprecations

Tell the reader what to use instead, and put that in the first sentence (it's the only part that
shows up in summaries). Mention the version that deprecated it if you track versions. Later
sentences can explain why.

> Deprecated. Use `CameraPose` instead.
>
> Deprecated since 3.2. Access this field by using the `getField` method.

"Deprecated" means "recommended against, likely to be removed" — not "removed".

## Inline comments

- **Explain why, not what.** Experienced readers can see what the code does; they can't see why it
  does it that way, what constraint forced it, or what will break if they change it.
- **Comment the non-obvious:** magic numbers, workarounds and the bug they work around, ordering
  dependencies, performance tricks, security-sensitive choices, surprising API behavior.
- **Don't narrate obvious code** — but remember that what's obvious to the author can be opaque to a
  newcomer.

  ```python
  # Not recommended: restates the code, ignores the mystery.
  # Create a stream from the text file at /tmp/myfile.
  stream = br.openstream(pathname="/tmp/myfile", mode="z")

  # Recommended: explains the non-obvious part.
  # Mode "z" decompresses gzip data on the fly, so callers get plain text.
  stream = br.openstream(pathname="/tmp/myfile", mode="z")
  ```

- **Short, but clarity beats brevity.** Full sentences for anything longer than a phrase.
- **If you cut a corner, say so** (for example, skipping error handling in an example or a
  known-quadratic algorithm on small inputs) and why.
- **Keep comments true.** A stale comment is worse than none; update comments in the same change
  as the code.
- Apply the core rules: active voice, present tense, consistent terms, no *simply*, no *we* (prefer
  imperative or describing the code), no jokes that need context.
- **TODOs** say what's missing and, if your project does this, who owns it or which issue tracks it:
  `# TODO(#1423): Retry on 503 once the backend supports idempotency keys.`

## Referring to code in prose

In comments, docs, commit messages, and PR descriptions:

- Put code-related text in code font: class, method, function, variable, and parameter names;
  filenames and paths; commands and flags; environment variables; HTTP verbs and status codes
  (`404 Not Found`); data types; literal values (`true`, `"auto"`); and anything the reader types.
- Don't put product names, ordinary URLs the reader visits, or concepts in code font.
- **Don't use code elements as English words.** Add a noun and inflect the noun:

  | Recommended | Not recommended |
  |---|---|
  | The `ADDRESS` constant's value is defined in the `settings.h` file. | `ADDRESS`'s value is defined in `settings.h`. |
  | To add the data, send a `POST` request. | `POST` the data. |
  | You can't call the `close` method before you call `open`. | `Close`ing the file requires you to have `open`ed it. |

- Refer to a method by its name alone (`get`), adding the class only to avoid ambiguity.
- When a class name is also a common word, you can use the plain lowercase word for the concept
  ("an activity") and the code-font name for the actual type (`Activity` class).

## Sample code

Good samples are **correct, concise code that readers can quickly understand and easily reuse with
minimal side effects**.

- **Correct:** builds and runs without errors, does what it claims, has no security holes, follows
  language conventions, and shows the way your team recommends. Test samples like production code;
  untested snippets rot. Don't just reuse unit tests as samples — tests test, samples teach.
- **Concise:** only the essential parts. But never use bad practice to save lines; correctness beats
  brevity.
- **Understandable:** descriptive names, no clever tricks, shallow nesting. Prefer named arguments
  for readers new to an API: `Level(rank=5, dimension=28, opacity=48)`, not `Level(5, 28, 48)`.
- **Commented:** put explanations that belong with the code in comments (people copy them along with
  the code); put long conceptual explanations in prose before the sample.
- **Reusable:** list dependencies and setup, make values easy to customize, and avoid side effects
  when pasted into someone else's program.
- **Runnable:** explain how to run it and show or describe the expected output.
- **Show an anti-example** when there's a common mistake (for example, spaces around `=` in a shell
  assignment), labeled clearly.
- **Sequence samples** from simple to complex: a hello-world, then moderate, then advanced.
- Use realistic, meaningful names instead of `foo`, `bar`, `baz`. Use reserved example data
  (`example.com`, `192.0.2.1`); see `formatting-and-mechanics.md`.
- In code blocks, mark omitted code with a comment in the language's syntax
  (`# Several lines omitted.`), not `...`.

## Worked example

Before:

```python
def fetch(u, t=None, r=True):
    # fetch function
    # this will get the thing from the url, e.g. the json, and returns it
    ...
```

After (Google-style Python docstring):

```python
def fetch_json(url: str, timeout: float | None = None, retry: bool = True) -> dict:
    """Fetches a JSON document over HTTPS and returns it as a dictionary.

    Follows up to five redirects. Responses larger than 10 MB are rejected to
    protect memory in long-running workers.

    Args:
        url: The HTTPS URL of the document. Plain HTTP URLs are rejected.
        timeout: The total time to wait for a response, in seconds. If None,
            waits indefinitely. Default: None.
        retry: If true, retries once after a 5xx response or a connection
            error. If false, raises on the first failure. Default: true.

    Returns:
        The parsed JSON object.

    Raises:
        ValueError: If the URL doesn't use HTTPS or the body isn't valid JSON.
        TimeoutError: If no complete response arrives within `timeout`.
    """
```
