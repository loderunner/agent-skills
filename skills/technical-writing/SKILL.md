---
name: technical-writing
description: Write and edit clear developer-facing text using the principles from Google's technical writing courses and developer documentation style guide. Use this whenever you write, rewrite, or review READMEs, docs pages, tutorials, how-to guides, design docs, runbooks, API reference docs, docstrings, code comments, error messages, validation or log messages, CLI help text, release notes, commit messages, or PR descriptions — and whenever the user asks to make technical text clearer, shorter, more readable, more consistent, or "better written", even if they never mention style guides or Google.
---

# Technical writing

This skill distills Google's *Technical Writing One*, *Technical Writing Two*, and *Error Messages*
courses plus the *Google developer documentation style guide* into rules you can apply while
writing. The single idea behind all of them:

> good documentation = what the reader needs to do their task − what the reader already knows

Clarity for the intended reader beats every other rule here, including the rule you are about to
apply. When a guideline would make a specific piece of text worse, break it.

## Workflow

1. **Identify the artifact and the reader.** Who reads this (role, and how close they are to the
   subject), what they already know, and what they must be able to do afterward. Infer this from
   context — the codebase, the user's phrasing, where the text will live — and state any assumption
   briefly instead of interrogating the user.
2. **Read the matching reference** before drafting anything non-trivial:

   | You're writing or reviewing                                                    | Read                                         |
   |--------------------------------------------------------------------------------|----------------------------------------------|
   | Error, warning, validation, exception, or log messages; CLI failure output      | `references/error-messages.md`               |
   | Code comments, docstrings, API reference, sample code                           | `references/code-comments-and-api-docs.md`   |
   | READMEs, tutorials, how-tos, concept docs, design docs, runbooks, release notes | `references/documents.md`                    |
   | Formatting details: lists, tables, code font, commands, placeholders, UI text, links, numbers, dates, punctuation, example data | `references/formatting-and-mechanics.md` |
   | Whether a specific word or phrase is OK; inclusive replacements                 | `references/word-list.md`                    |

3. **Draft** using the core rules below.
4. **Self-edit** with the checklist at the end of this file. Fix organization before sentences, and
   sentences before punctuation.
5. **Respect local conventions.** The order of authority is: the project's own style and existing
   terminology → the language's documentation conventions (godoc, PEP 257, Javadoc, JSDoc, rustdoc)
   → these guidelines → a dictionary. If the codebase calls something a "workspace", don't call it a
   "project" in its docs.

## Core rules

These apply to every artifact. The reference files add artifact-specific detail.

### Words

- **Define unfamiliar terms** on first use, or link to a good existing definition. If a document
  introduces many terms, add a glossary.
- **Use one term per concept, everywhere.** Readers treat a synonym as a signal that you mean
  something different, so "directory" in one sentence and "folder" in the next sends them hunting
  for a distinction that doesn't exist. To use a short form, introduce it once: "Protocol Buffers
  (protobufs)".
- **Acronyms:** spell out on first use with the acronym in parentheses, then use only the acronym.
  Only coin an acronym if it is much shorter *and* appears many times. Don't expand ones every
  reader knows (API, URL, HTML, CPU, PDF).
- **Treat pronouns like pointers.** Use one only after its noun, close to it, and never when another
  noun sits in between. *It*, *they*, *this*, and *that* cause the most null-pointer errors in
  readers' heads; put a noun after *this* or *that* ("this user ID", not "this").
- **Prefer short, common words:** *use* (not utilize/leverage), *start* (not commence), *so* (not
  consequently), *to* (not in order to), *can* (not is able to), *lets you* (not allows you to),
  *because* (not as/since), *after* (not once), *although* (not while).
- **Write literally.** Skip idioms, metaphors, sports or pop-culture references, slang, and humor.
  They confuse non-native readers and break machine translation ("a piece of cake", "out of the
  box", "sanity check", "kill two birds").

### Sentences

- **Use active voice:** actor + verb + target. Make clear *who* does what — the reader, the server,
  the client, the compiler. Passive is fine when the actor is unknown or irrelevant ("The database
  was purged in January").
- **Pick strong, specific verbs** over *is*, *occurs*, *happens*: "Dividing by zero raises the
  exception," not "The exception occurs when dividing by zero."
- **Delete "There is / There are"** and promote the real subject: "The `met_trick` variable stores
  the current accuracy."
- **One idea per sentence**, ideally under about 26 words. When a sentence strings items together
  with commas or *or*, turn it into a list.
- **Cut filler:** "causes the triggering of" → "triggers"; "provides a detailed description of" →
  "describes"; "at this point in time" → "now"; drop *just*, *please note*, *basically*, *actually*.
- **Put the condition or goal first** so readers can skip what doesn't apply: "To delete the file,
  click **Delete**." / "If the build fails, then check the logs."
- **Use present tense** for how things behave. Use *will* only for something that truly happens
  later; avoid *would*.
- **Address the reader as *you*;** use the imperative for instructions. Avoid *we*, *let's*, and
  *the user* (reserve *user* for the end users of the reader's software).
- **Say how mandatory something is:** *must* = required; *we recommend* = recommended; *can* =
  optional or possible; *might* = uncertain. Avoid *should* (readers can't tell required from
  nice-to-have), *may* (except legal text), and *could*.
- **State things positively.** Use contractions like *don't* and *isn't* (harder to misread than
  "do not"), but avoid double negatives and exceptions to exceptions.
- **Keep helper words** that remove ambiguity: *then* after *if*, *that* in "the rules that you
  defined", and articles (*a*, *the*) even in headings.
- **Be factual, not promotional.** Replace adjectives with data ("225–250% faster", not "blazingly
  fast"). Avoid claims that can become false: *best*, *fastest*, *secure*, *guarantees*, *always*,
  *never*. Say a feature "helps protect" rather than "prevents".
- **Avoid subjective or condescending words:** *simple*, *simply*, *easy*, *just*, *quickly*,
  *obviously*, *carefully*, *properly*. What's easy for you may not be for the reader.

### Paragraphs

- **Lead with the point.** Busy readers read first sentences and skip the rest.
- **One topic per paragraph**, usually three to five sentences. Break up walls of text; merge
  strings of one-sentence paragraphs.
- Good explanatory paragraphs answer **what** (the fact), **why** (it matters), and **how** (to use
  it, or how you know it's true).

### Lists and tables

- **Numbered list** when order matters; **bulleted list** when it doesn't; **table** when each item
  has three or more attributes.
- **Keep items parallel** in grammar, capitalization, and punctuation. Start numbered steps with an
  imperative verb.
- **Introduce every list and table** with a complete sentence ending in a colon, often using "the
  following": "Take the following steps to install the package:"

### Documents

- **Open with scope, audience, and key points.** Say what the doc covers (and notable things it
  doesn't), who it's for, and what they need first. Assume the reader stops after the first
  paragraph.
- **Be timeless.** In product docs, avoid *new*, *now*, *currently*, *soon*, *latest*, *as of this
  writing*, and anything that announces future features. (Release notes and changelogs are the
  exception.)
- **Be prescriptive.** When there are several ways to do something, recommend one.
- **Headings:** sentence case. Task headings start with a bare verb ("Create an instance"); concept
  headings are noun phrases ("Migration overview"). Don't start with an *-ing* verb, don't skip
  levels, and put some text under every heading.

### Tone

Conversational, friendly, and respectful — a knowledgeable colleague, not a salesperson or a
comedian. No exclamation points, no *please* in instructions, no apologies or jokes in errors, no
"Oops!".

### Accessibility and global readers

- **Descriptive link text:** "see [Configure logging](…)", never "click here" or "this doc".
- **No directional language:** *preceding*/*following*, not *above*/*below*/*left*/*right*.
- **Don't rely on color alone** to convey meaning; give images alt text that states their point.
- **Unambiguous dates:** "January 19, 2026" or `2026-01-19`, never `01/02/26`.
- **Inclusive terms:** *allowlist/denylist*, *primary/replica*, singular *they*, *person-hours*.
  See `references/word-list.md`.

## Reviewing or editing existing text

When the user asks you to review, tighten, or improve text:

1. **Fix structure first, then sentences, then mechanics.** Reordering a doc so the key point comes
   first matters more than fixing a comma.
2. **Preserve meaning and accuracy.** Never invent facts to fill a gap. If an error message needs a
   fix you can't know, or a doc omits a prerequisite, insert a clearly marked placeholder
   (`[link to quota docs]`) or ask, rather than guessing.
3. **Prioritize.** Lead with the issues that most hurt comprehension; skip trivia unless the user
   wants a line edit.
4. **Show your work proportionally.** For a long text, list the main issues (quote → why it's a
   problem → fix), then give the full revision. For a sentence or two, give the rewrite and a
   one-line rationale.
5. **Keep the author's voice and conventions** where they don't conflict with clarity.
6. **Keep the scope and structure you were given.** When editing a section, keep its heading level
   and don't add sections, prerequisites, or steps the source didn't need. Restructure only what
   makes the existing content clearer.

## Short-form text

Commit messages, PR descriptions, changelog entries, CLI `--help`, and log lines follow the same
core rules: key point first, specific verbs, present tense or imperative, and terminology that
matches the code. Follow the repository's existing conventions (for example, Conventional Commits)
when they exist. Release notes are the one place where *new* and dates are appropriate.

## Self-edit checklist

Before you hand over any text, check:

- [ ] Does the opening tell this reader what this is and why they care?
- [ ] Is every term defined or linked on first use, and used consistently afterward?
- [ ] Is it clear who performs each action? Any passive voice that hides the actor?
- [ ] Any sentence over ~26 words or carrying two ideas? Any embedded list that should be a list?
- [ ] Any *there is/are*, *should*, *simply/easy/just*, *please*, *currently/new*, *above/below*,
      *e.g./i.e.*, *etc.*, or ambiguous *it/this/that*?
- [ ] Are list items parallel, and do steps start with imperative verbs?
- [ ] Is code, and only code, in `code font`, with placeholders explained?
- [ ] Would a non-native English reader or a translation tool understand every sentence literally?
- [ ] Could anything be cut without losing information the reader needs?
