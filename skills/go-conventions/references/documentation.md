# Writing documentation

Tone and style for prose in a Go project: doc comments, READMEs, guides,
error and log messages that a person reads, and PR descriptions. Distilled
from the Google developer documentation style guide.

The goal is documentation a developer in a hurry can scan, trust, and act on.
Most rules below serve that: clear, direct, and still true a year from now.

**Precedence.** Project-specific style wins, then Go's own conventions
(`go doc` comment format, `gofmt`), then this file. These are guidelines, not
laws. Break one when it makes the text clearer, and stay consistent within
the document.

## Tone

Sound like a knowledgeable friend who knows what the developer is trying to
do: conversational and respectful, not slangy, cute, or stiff.

```text
❌ Dude! This API is totally awesome!
❌ The API documented by this page may enable the acquisition of information
   pertaining to user preferences.
✅ This API lets you collect data about what your users like.
```

- Use contractions, especially negations. Readers skim past *not* but rarely
  misread *don't*.
- Skip *please*, *simply*, *just*, *easy*, *quickly*, exclamation marks,
  *let's*, pop-culture references, and internet slang. They add noise, and
  *simply* insults the reader when the step isn't simple.
- Avoid figurative language, including anthropomorphism ("the parser sees a
  token", "the cache knows"). It's less precise and harder to translate.
  Write "the parser reads a token".
- Prefer plain words: *use*, not *utilize*; *so*, not *consequently*; *some*,
  not *a number of*. Many readers aren't native English speakers, and short,
  simple sentences translate best.
- Keep articles (*a*, *an*, *the*), even in headings: "Create a client", not
  "Create client".
- Treat jargon as a cost. Write around it, use a more specific word, or
  define it once on first use.

## Voice, person, and tense

- **Active voice.** Make the doer the subject: "The server sends an
  acknowledgment", not "An acknowledgment is sent". Passive is fine when the
  actor is irrelevant or the object is the point ("The file is saved").
- **Present tense** for general behavior: "The handler returns a 404", not
  "will return". Use future tense only for something that genuinely happens
  later ("The file is archived the next time the backup runs"). Avoid the
  hypothetical *would*.
- **Second person.** Address the reader as *you* and use the imperative for
  instructions. Reserve *user* for the end users of the software the reader
  is building. Avoid *we* unless it clearly means the authoring organization.
- Be consistent about who *you* is (a library consumer? an operator?).

## Timeless and honest

Write about how the code works now. Docs get read long after they're
written.

- Cut time-anchored words that describe capabilities: *now*, *new*, *currently*,
  *soon*, *latest*, *eventually*, *does not yet*, *existing*, *as of this
  writing*. They're either implied or wrong in a month. Release notes and
  changelogs are the exception.
- Don't promise or pre-announce features. Document what exists. Put plans in
  an issue, not in a comment.
- Don't make claims you can't verify or that one incident would falsify.
  Avoid *best*, *fastest*, *never*, *always*, *guarantees*, *ensures*, and
  *secure* unless it's literally true. "Helps prevent" is honest where
  "prevents" is a bet. Cite the source for performance numbers.

## Recommendations and requirements

Avoid *should*: readers can't tell whether it's optional. Say which you mean:

| Meaning | Write |
|---|---|
| Required | "You must…" or a plain imperative |
| Recommended | "We recommend…" (or *should* for widely accepted practice) |
| Optional | "You can…" |
| Expected outcome | State it: "The call returns 10 items." |
| Possible outcome | "might" or "can" |

Be prescriptive. When there are several ways to do a task, document the
best one for the common case instead of a menu. Alternatives make readers
stop and decide.

## Structure

- **Conditions first, then the instruction**, so readers can skip what
  doesn't apply: "If you use a proxy, set `HTTPS_PROXY`", not "Set
  `HTTPS_PROXY` if you use a proxy". Same for goals: "To delete the record,
  call `Delete`."
- **Most important information first**, in the sentence, the paragraph, and
  the document. Readers scan.
- **One idea per paragraph**, in as few sentences as it takes. Past five or
  six sentences, split or cut. A one-sentence paragraph is fine.
- **Headings** use sentence case and are unique on the page. Start
  task headings with a bare verb ("Configure the client"); use a noun phrase
  for concepts ("Client configuration"). Avoid a leading *-ing* word, numbers
  for sequence, links, and code in headings. Use one H1, don't skip levels,
  and don't leave a heading empty. When an H2 introduces H3s, say "The
  following sections describe…", not "this section".
- **Links** are decisions and detours, so be selective. Don't link the same
  target repeatedly on a page. Explain a term in a sentence instead of
  linking when a sentence is enough. Link text is the page title or a
  descriptive phrase, never "click here" or a bare URL.

## Lists and procedures

- Use a **numbered list** only when order matters, a **bulleted list** for
  the rest, and a **description list** (`- **Term**: explanation`) when every
  item needs a gloss. Never a list of one item.
- Introduce a list with a complete sentence that ends in a colon, not a
  sentence fragment the items finish. Write "You can do any of the
  following:", not "You can:".
- Keep items parallel. Capitalize each item and end it with a period, except
  single words, fragments without a verb, and items that are entirely code or
  a link.
- Don't end a list with *etc.* Introduce the list so it reads as
  non-exhaustive ("such as…").
- In a procedure, one action per step. Start each step with an imperative
  verb, and put the place before the action ("In your terminal, run…") and
  the goal before the action ("To start the server, run…").
- Mark an optional step with `Optional:` at the start.
- Don't orient with *above*, *below*, or *right-hand side*. Use "the
  following example" or "the preceding section". It breaks for screen
  readers and translation.
- Introduce a command by what it does ("Start the database:"), not "Run the
  following command:".

## Code in prose

- Put anything code-related in backticks: identifiers, package and file
  names, paths, flags, environment variables, JSON fields, HTTP methods, and
  literal values. Write "the `Close` method", not "the Close method".
- Name HTTP status codes like this: an HTTP `404 Not Found` status code. Use
  `2xx` for a range.
- Don't inflect or repurpose code names as ordinary words. Write "the
  `Retry` option's default", not "`Retry`'s default"; "send a `POST`
  request", not "`POST` the data".
- Introduce every code block with a sentence. Mark omissions with a comment
  in the language (`// ...`), not a bare `...`.
- Use uppercase placeholders with underscores (`API_KEY`), never
  `your_api_key` or `<key>`. Explain each placeholder right after the
  block: "Replace `API_KEY` with your key." For several, use "Replace the
  following:" and a description list in the order they appear.
- Use safe example data. Use `example.com`, `example.org`, or `example.net`;
  the documentation IP ranges `192.0.2.0/24`, `198.51.100.0/24`, and
  `203.0.113.0/24`; and `2001:db8::/32` for IPv6. Never use real emails,
  names, phone numbers, or customer data. Use meaningful names such as
  `staging`, not `foo`/`bar`/`baz`.

## Go doc comments

Go's doc comment convention takes priority where it conflicts with the
general advice above.

- **Start with the identifier's name**, then a present-tense verb in the
  third person: "Client sends requests to…", "Open returns…", "Close
  releases…". This is the opposite of some style guides' advice not to repeat
  the name, and is what `go doc` and linters expect.
- **Make the first sentence stand alone.** Tools show it in package indexes
  and search results, so say what the thing does and end it with a period.
  Use *for example* instead of *e.g.* to avoid ending the summary early.
- **Say what the signature can't.** Don't restate types or parameter names.
  Cover the *why*, preconditions, side effects, ownership and lifetime,
  concurrency safety, and what the zero value does.
- **Document failure.** State which errors a function returns, including
  sentinel errors callers match with `errors.Is` or `errors.As`, and what
  happens when a dependency is missing.
- **Booleans:** "reports whether X" is idiomatic Go for functions returning
  `bool`: "Valid reports whether the token hasn't expired."
- **Deprecation:** put a paragraph starting `Deprecated:` in the comment and
  name the replacement: "Deprecated: Use NewClient instead."
- **Package comments** open with "Package name …" and give the purpose in one
  sentence, then how to use it. Add a short example, ideally as a runnable
  `Example` function in a test file, so it's compiled and can't rot.
- **Formatting** in doc comments is minimal: indent code blocks, use `- ` for
  bullets, and use `# Heading` for headings. `gofmt` normalizes these.
- **Inline `//` comments** explain *why* the code does something surprising,
  not *what* it does. The same tone, tense, and timelessness rules apply, so
  drop *TODO: fix soon* in favor of an issue link.

## Quick review checklist

Before finishing a piece of documentation, check whether it:

1. Says the important thing first?
2. Uses active voice and present tense?
3. Is free of *simply*, *just*, *please*, *now*, *currently*, *should*?
4. Puts every identifier, path, and flag in backticks?
5. Uses only safe example data and explained placeholders?
6. Follows Go doc comment form, if it's a comment?
