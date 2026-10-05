# Documents: READMEs, tutorials, how-tos, concept docs, design docs

Distilled from Technical Writing One (*Audience*, *Documents*, *Paragraphs*), Technical Writing Two
(*Self-editing*, *Organizing large documents*, *Illustrating*), and the style guide pages on
procedures, headings, notices, cross-references, timeless and prescriptive documentation, and
excessive claims.

## Contents

- [Know the audience](#know-the-audience)
- [Open the document well](#open-the-document-well)
- [Organize the document](#organize-the-document)
- [Headings](#headings)
- [Procedures (step-by-step instructions)](#procedures-step-by-step-instructions)
- [Notes, cautions, and warnings](#notes-cautions-and-warnings)
- [Links and cross-references](#links-and-cross-references)
- [Illustrations and screenshots](#illustrations-and-screenshots)
- [Timeless, prescriptive, and factual](#timeless-prescriptive-and-factual)
- [Skeletons for common document types](#skeletons-for-common-document-types)
- [Self-editing](#self-editing)

## Know the audience

Answer these before writing:

1. **Who is the reader?** Start with role (backend engineer, data scientist, SRE, PM, end user).
2. **How close are they to the knowledge?** Engineers on your team know your abbreviations and data
   structures; engineers on other teams, new hires, and external users don't. Knowledge also fades —
   most engineers studied calculus and have forgotten it.
3. **What's their goal?** Why are they reading this right now?
4. **What must they know or be able to do afterward?** Write this as a list of tasks ("list hotels
   by price") or, for a design doc, a list of things to understand ("why Zylmon outperforms
   Zyljeune").

**Beware the curse of knowledge.** Experts forget what novices don't know and make passing
references to things they never explain. As the audience widens, explain more. Read the draft as
the persona would; define or link every term they might not know; state your assumptions
("This guide assumes that you're comfortable running commands in a Linux terminal").

**Compare and contrast with what readers know.** Most work is evolutionary: "Froobus handles the
same use cases as Frambus, but it streams results instead of buffering them."

## Open the document well

Assume many readers read only the first paragraph. The opening should:

- **State the scope:** "This document describes how to publish Markdown files by using Froobus."
- **State the non-scope** when readers might reasonably expect it: "This document doesn't cover
  installing Froobus. For installation, see *Get started*." (Don't list things nobody would expect.)
- **State the audience and prerequisites:** role, assumed knowledge, required reading or software.
- **Summarize the key points.** For design docs and proposals, the conclusion or recommendation
  belongs here, not at the end.

Example introduction:

> This document explains how to publish Markdown files by using Froobus, a publishing system that
> runs on a Linux server and converts Markdown to HTML. It's intended for people who are familiar
> with Markdown syntax and comfortable running simple commands in a Linux terminal. This document
> doesn't explain how to install or configure Froobus; for that, see *Get started*.

Leave out history, credits, and trivia; link to them at the end if they matter. Rewrite the opening
last — it's the hardest part to get right and the most read.

## Organize the document

- **Outline first** (or write freely, then reorganize). Group topics, then order them by when the
  reader needs them.
- **Explain why before asking the reader to do something.** Introduce the tool and what the reader
  will use it for, then list the steps.
- **One concept or task per section.**
- **Introduce information when it becomes relevant** — terms near the steps that use them, history
  at the end if at all.
- **Alternate concept and practice** in tutorials: explain an idea, then have the reader apply it.
- **Disclose progressively:** start with the simplest case, then layer on complexity. Break long
  procedures into sub-tasks. Use headings, lists, tables, and diagrams to break walls of text.
- **One long doc or several short ones?** Short, focused pages work better for newcomers, how-tos,
  and overviews. Long pages work for in-depth tutorials, best-practice guides, and reference that
  readers search rather than read straight through.
- **Navigation:** introduction and summary, logical progression, descriptive headings, a table of
  contents for long pages, links to related material and to what to learn next.
- **Check the draft against the introduction.** Delete sections that don't serve the stated scope,
  or change the scope.

## Headings

- **Sentence case:** "Configure the cache", not "Configure The Cache".
- **Task headings** start with a bare verb: "Create an instance", not "Creating an instance".
- **Concept headings** are noun phrases: "Caching overview", "Migration to version 2".
- **Prefer task language the reader recognizes** over internal tool names: "Create the site", not
  "Run carambola".
- **Avoid *-ing* first words** (they translate inconsistently), except unavoidable nouns like
  "Billing" or "Pricing".
- **Optional sections:** "Optional: Customize your alias".
- **One H1 per page**; don't skip levels; don't use heading levels for visual size.
- **Put text under every heading** before any subheading — at least a sentence of orientation.
- **No numbers, links, or code-only text in headings.** If you must mention a code item, add a noun:
  "Configure the `retry` setting".
- **Unique headings** so readers can navigate and link to them.
- To refer to subsections, write "the following sections", not "these sections" or "this section".

## Procedures (step-by-step instructions)

- **Introduce the procedure** with a complete sentence that adds context beyond the heading: "To
  customize the buttons, follow these steps:" — not a fragment like "To customize the buttons:".
  Skip the introduction if the heading says it all.
- **List prerequisites before the steps**, not in a note halfway through.
- **One action per step**, starting with an imperative verb. Combine tiny sequential menu actions
  ("Click **File > New > Document**.") and include "press **Enter**" in the step that needs it.
- **Say where before what:** "In the Cloud console, go to the **Monitoring** page." Restate the
  location at the start of each procedure.
- **Say why before what** when a goal helps: "To start a new document, click **File > New**." If
  that phrasing makes a required step look optional, use "Start a new document: click …".
- **Action first, result second**, in the same step: "Click **Run**. The query results appear after
  the query runs."
- **Optional steps** begin with "Optional:" (not "(Optional)").
- **Single-step procedures** are a bulleted item, not a numbered list of one.
- **Sub-steps** use lowercase letters, then lowercase Roman numerals.
- **Give only the best way.** If there are multiple methods, pick the accessible, shortest one,
  and put alternatives under separate headings or tabs.
- **Don't repeat procedures**; link to them.
- **Order the parts of a complex step:** the action → the command → placeholder explanations → what
  the command does (if needed) → the output (if needed) → what the result means.
- **Introduce commands by what they do**, not "Run the following command:" — "Deploy the load
  generator:".
- **Don't use directional language** ("the button on the right") or icon descriptions ("click the
  bell icon"); use the element's label.
- **Don't use *please*, *simply*, or *just*** in steps.

## Notes, cautions, and warnings

Readers skip boxes outside their focus, so use notices sparingly — write the text in normal prose
first and only promote it if it truly interrupts the flow.

- **Note:** useful but not necessary; the reader succeeds without it.
- **Caution:** proceed carefully.
- **Warning:** don't do this, or this can't be undone (data loss, security exposure, cost).

Don't use a note for prerequisites, required steps, cross-references, or results of the preceding
step. Don't stack notices back to back.

## Links and cross-references

- **Link selectively.** Every link is a decision and an exit. If a definition or two steps will do,
  put them on the page.
- **Use descriptive link text** — the target's title or a short description — never "click here",
  "this page", "this article", or a bare URL.
- **Introduce standalone references consistently:** "For more information, see [Configure
  logging]." / "For more information about quotas, see [Quotas and limits]." Use *about*, not *on*.
- **Say when a link downloads a file, opens email, or jumps within the page** ("see the *Limits*
  section of this document").
- **Don't link the same target twice** on a page unless the page is long or the links serve
  different entry points.
- Keep punctuation outside the link text; don't wrap link text in quotation marks.

## Illustrations and screenshots

- **Write the caption first**, then draw the picture that proves it. Captions are brief, state the
  takeaway, and focus attention.
- **Limit each diagram** to about one paragraph's worth of information (or five bullet points of
  explanation). Show the big picture first, then zoom into subsystems in separate figures.
- **Focus attention** with a callout or highlight on the relevant part of a busy screenshot.
- **Revise illustrations** like prose: simplify, split, check contrast, confirm the takeaway.
- **Introduce each image** with a complete sentence, and give it alt text that conveys its point.
  Never put information *only* in an image; don't use images of text, code, or terminal output.
- Prefer SVG for diagrams.

## Timeless, prescriptive, and factual

- **Timeless:** document the product as it is. Avoid *new*, *newer*, *old*, *now*, *currently*,
  *presently*, *as of this writing*, *soon*, *eventually*, *latest*, *does not yet*, *in the
  future*. "Windows isn't supported," not "Windows isn't currently supported." If you must compare
  versions, give a reference point: "In version 2.3 and later, …".
- **No pre-announcements** of unreleased features.
- **Prescriptive:** recommend a path rather than presenting a menu of options. Give commands with
  only the arguments the common case needs, and link to the full reference.
- **No excessive claims:** avoid *best*, *simplest*, *fastest*, *always*, *never*, *guarantee*,
  *secure*; cite the source for performance claims; describe security features as helping protect,
  not preventing.

## Skeletons for common document types

These skeletons apply the principles above. Adapt them; drop sections that don't serve the reader.

### README

```markdown
# project-name

One or two sentences: what it does, for whom, and why they'd pick it — ideally compared to
something the reader already knows.

## Before you begin (or: Requirements)

What the reader needs installed or understood, with versions.

## Install

1. Imperative step.
2. Imperative step.

## Quickstart (or: Usage)

The smallest complete example that does something useful, with a sentence that says what it
does, and the expected output ("The output is similar to the following:").

## Configuration

A table when options have several attributes: Option | Description | Default.

## Troubleshooting (optional)

Common errors, their cause, and the fix.

## Contributing / License

Short, with links.
```

Lead with what the reader can *do*, not the project's history or architecture. Keep badges, credits,
and roadmaps out of the opening.

### Tutorial or how-to guide

Title as a task ("Deploy a containerized app"). Open with what the reader builds or achieves,
who it's for, prerequisites, and (for tutorials) objectives and estimated cost. Then numbered
procedures grouped under task headings, verification steps ("The output is similar to the
following:"), cleanup, and "What's next" links.

### Concept or overview page

Noun-phrase title. First paragraph defines the concept and why it matters. Compare to familiar
concepts, then cover how it works, when to use it (and when not), and links to tasks.

### Design doc

Open with scope, non-scope, audience, and the key decision or recommendation in a few sentences.
Then context and goals, the design, alternatives considered (and why they lost), risks, and open
questions. Readers must learn the essentials from page one.

### Runbook or troubleshooting guide

Organize by symptom (what the reader observes), then cause, then fix as numbered steps. Make every
command copy-pasteable with placeholders explained.

### Release notes and changelogs

The exception to timelessness: dates, versions, and "new" are expected. Lead each entry with the
user-visible change, use present or past tense consistently, and say what readers must do for
breaking changes.

## Self-editing

- **Fix organization before style.** Reorder sections before polishing sentences.
- **Read it aloud** (or with a screen reader). Awkward phrasing and overlong sentences become
  obvious.
- **Come back later** with fresh eyes, or change the context (different font, printed copy).
- **Read as your persona.** Is the purpose clear? Is every term defined?
- **Check the doc against its introduction** — the opening is a promise; verify you kept it.
- **Ask a peer to review** against the style guide you follow.
