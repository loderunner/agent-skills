# Formatting and mechanics

Quick-reference rules from the Google developer documentation style guide. Use this when you need
the specific convention for a list, table, code block, command, placeholder, UI reference, link,
number, date, or punctuation mark. Markdown and HTML forms are given where they differ.

## Contents

- [Lists](#lists)
- [Tables](#tables)
- [Text formatting](#text-formatting)
- [Code in text](#code-in-text)
- [Code blocks and commands](#code-blocks-and-commands)
- [Placeholders](#placeholders)
- [UI elements and keyboard keys](#ui-elements-and-keyboard-keys)
- [Capitalization](#capitalization)
- [Punctuation](#punctuation)
- [Abbreviations](#abbreviations)
- [Numbers, units, dates, and times](#numbers-units-dates-and-times)
- [Example data](#example-data)
- [Images and alt text](#images-and-alt-text)
- [Accessibility checklist](#accessibility-checklist)

## Lists

| Type | Use for |
|---|---|
| Numbered | Steps or anything where order matters. Nested levels: lowercase letters, then lowercase Roman numerals. |
| Bulleted | Unordered items. Make clear whether every item is required. |
| Description list (term + definition) | Pairs, such as a glossary. In Markdown, use bold run-in headings: `- **Term**: description` |
| Table | Items with three or more attributes. |

- **Introduce the list** with a complete sentence, not a fragment the items complete.
  "Use the **Submit** button for any of the following purposes:" — not "Use the **Submit** button
  to:". End with a colon if the list follows immediately; a period if other material intervenes.
  If the heading already gives full context, you can skip the introduction.
- **Parallel items:** same grammatical form, capitalization, and punctuation.
- **Capitalize** the first word of each item (unless case matters, as with code).
- **End punctuation:** add a period to items that are sentences. Omit it for single words, items
  without a verb, items entirely in code font, and items that are only link text. If a list mixes
  both, rewrite it to be parallel or punctuate every item.
- **Run-in headings:** "- **Big**: a short word" (colon → lowercase description, no period unless
  it has a verb), or "- **It increases fuel economy.** By charging…" (period → sentence case and
  period). Don't use a dash to separate the term from the description.
- **No one-item lists.**
- **No *etc.* or *and so on*:** introduce the list as non-exhaustive instead ("data like event
  logs, clickstream data, and transactions").
- In running text, use the serial comma: "zones, regions, and multi-regions".

## Tables

- Use tables for two-dimensional data — three or more related values per item. Use a list if
  there's one column; don't use tables for layout or for code.
- Introduce every table with a complete sentence ("…as listed in the following table:"); not all
  screen readers announce tables.
- Give every column a concise, sentence-case header with no ending punctuation.
- Keep cells short (more than two sentences means the content belongs elsewhere). Keep each column
  parallel — same kind of data in every cell.
- Don't merge cells. Sort rows logically, or alphabetically if no logic applies.
- Avoid tables in the middle of numbered procedures.

## Text formatting

| Formatting | Use for |
|---|---|
| **Bold** (`**text**`) | UI element names and run-in headings (including "**Note**:"). Not for emphasis or product names. |
| *Italic* (`_text_` in Markdown) | Introducing or discussing a term ("words as words"); rare emphasis; titles of full-length works; math variables. |
| `Code font` | Anything code-related; see the following section. |
| Underline | Links only. |

Don't force line breaks inside paragraphs, center or justify text, or override fonts and colors.
Use semantic markup (headings, lists, `code`) rather than visual styling.

## Code in text

Put these in code font: class, method, function, and variable names; parameters and attributes and
their values; filenames, extensions, paths, and directories; commands and command-line tool names
(`kubectl`, `curl`); environment variables; data types; HTTP verbs and status codes
(`404 Not Found`); IP addresses and ports; package names; keywords; database tables and columns;
enum values; placeholders; literal text the reader types; and command output.

Leave in normal text: product, project, and organization names ("the curl project", "Kubernetes");
URLs the reader visits in a browser (better: descriptive link text); email addresses used for
contact.

- Don't add quotation marks around code unless they're part of the code.
- Don't use code elements as verbs or inflect them; add a noun: "send a `POST` request", "the
  `config.yaml` file", "`Intent` objects".
- Refer to methods by name alone (`get`), not `Class.get`, unless it's ambiguous.
- Boolean literals are code (`true`) when they're values; the abstract idea of true/false isn't.
- Describe naming formats rather than using jargon like *camel case*: "no spaces, with the first
  letter of each word capitalized — for example, `AssertionAccount`".

## Code blocks and commands

- **Introduce each code block** with a sentence that says what it does. End with a colon if the
  block follows immediately.
- **Use fenced code blocks** with a language tag in Markdown. Wrap lines at 80 characters.
- **Mark omissions with a comment** in the code's language (`# Several lines omitted.`), not `...`.
- **Copy-pasteable commands:** include only runnable code and placeholders. Don't put `[optional]`,
  `{a|b}`, or `...` syntax in commands meant to be copied; show separate commands for separate
  cases instead, and link to the full reference for all flags.
- **Long commands:** break before flags; end each continued line with ` \` (Linux/macOS) or ` ^`
  (Windows); indent continuation lines by four spaces.
- **Prompts:** for one-liners, the `$` prompt is optional; if a page mixes one-line and multi-line
  examples, use it everywhere. Don't show the current directory in the prompt. Prefer separate
  blocks for input and output.
- **Output:** show it only when it adds value (the reader copies or verifies something). Introduce
  it with "The output is similar to the following:" (or "The output is the following:" if exact).
  Mark omitted output lines with `...` on its own line.
- **Name the command and link to its reference** when you introduce it: "To connect to the
  instance, use the `gcloud compute ssh` command:".
- **Syntax notation** (reference docs only): `[OPTIONAL]`, `{CHOICE_A|CHOICE_B}`, `REPEATED ...`.

## Placeholders

- Write placeholders in **uppercase with underscores**: `PROJECT_ID`, `INSTANCE_NAME`. In Markdown
  running text, use `*`PROJECT_ID`*` or just `` `PROJECT_ID` ``; in HTML, `<code><var>…</var></code>`.
- Don't use `x`, `xxx`, `foo`, or possessives (`MY_PROJECT`, `YOUR_NAME`).
- **Explain every placeholder** the first time you use it, right after the code block:
  - One placeholder: "Replace `BUILD_ID` with the ID of the build that you copied in the preceding
    step."
  - Two or more: "Replace the following:" then a bulleted list, in order of appearance:
    "- `LOCATION`: the location of the reservation — for example, `us-east1`" (lowercase after the
    colon).
- Placeholders in sample output: follow the output with "This output includes the following
  values:" and the same list format.

## UI elements and keyboard keys

- **Bold the exact label** of UI elements: "Click **Save**." Don't put labels in quotation marks.
  If a label is all caps or inconsistently capitalized, use sentence case.
- **Focus on the task** when the UI is obvious ("Refresh the page"); name widgets when the reader
  needs help finding them.
- **Verbs:** *click* (not "click on"), *select* (options, checkboxes), *clear* (a checkbox — not
  "uncheck" or "deselect"), *enter* (text — not "type" or "input"), *press* (keys), *tap* (touch),
  *drag*, *turn on/off*, *go to*, *hold the pointer over* (not "hover").
- **Prepositions:** *in* a dialog, field, list, menu, pane, or window; *on* a page, tab, or toolbar.
- **Menu paths:** "Click **File > New > Document**" (one bold span for the whole path).
- **Don't use UI labels as verbs:** "Click **Save**", not "**Save** the settings".
- **Name elements by label, not appearance or position:** "Click **Menu**", not "the hamburger
  icon" or "the button in the upper-right corner". Leave out trailing ellipses ("Click **Browse**").
- Use *dialog* (not pop-up), *menu* (not drop-down), *expander arrow* (not zippy).
- **Keys:** spell out modifiers and use uppercase letters: `Control+C` (or `Command+C` on macOS).
  Use *press* for keys. Don't include keyboard shortcuts in procedures unless they're the point.

## Capitalization

- **Sentence case** for titles, headings, table headers, captions, list items, and UI references
  (unless the UI uses other casing).
- Don't capitalize for emphasis or because an abbreviation is uppercase: "data manipulation
  language (DML)".
- Don't use all caps or camel case except in names and code that use them.
- Don't rely on case alone to convey meaning (*Pod* versus *pod*).
- After a colon, start with lowercase unless it's a proper noun, heading, quotation, or follows a
  label like *Note*.

## Punctuation

- **Serial comma:** always ("A, B, and C").
- **Commas:** after introductory phrases; before a conjunction joining two independent clauses
  (unless both are very short); between a condition and its consequence ("If the program runs
  slowly, try the `--perf` flag."). Never splice two sentences with a comma.
- **Semicolons:** avoid when you can; use a period instead. Never use them to separate items in a
  simple embedded list.
- **Colons:** the text before a colon that introduces a list must be a complete sentence ("The
  fields are defined as follows:", not "The fields are:").
- **Em dashes** (—), with no spaces around them, mark a break in a sentence or introduce an
  example: "Enter a name—for example, `my-instance`." Don't substitute en dashes or hyphens for em
  dashes; use hyphens for ranges ("5-10 minutes").
- **Parentheses:** keep minimal; readers skip them, so never put essential information inside.
  Don't use them for optional plurals ("file(s)" → "one or more files").
- **Quotation marks:** straight quotes; commas and periods go inside, except after literal strings
  where they'd change the value. Use quotes sparingly — not for UI labels or code.
- **Ellipses:** don't use, except to mark omissions in quoted text.
- **Slashes:** avoid for alternatives ("and/or", "developed/hosted") — write "and", "or", or both
  words. Fine in code and paths.
- **Ampersands:** write *and*, except when quoting a UI label that uses *&*.
- **Exclamation points:** avoid.
- **Hyphens:** hyphenate compound modifiers before a noun ("floating-point number",
  "high-availability cluster") but not after ("the cluster is highly available"). Check the word
  list for fixed spellings (*backend*, *frontend*, *filename*, *read-only*).
- **Possessives:** don't form possessives from product or feature names ("the performance of
  Search", not "Search's performance"); don't use *'s* for plurals ("APIs", "1990s").

## Abbreviations

- Spell out on first use with the abbreviation in parentheses — "Border Gateway Protocol (BGP)" —
  then use the abbreviation. Skip expansion for universally known ones: AI, API, CPU, HTML, PDF,
  RAM, REST, URL, USB.
- Don't abbreviate terms used only once or unrelated to the main topic.
- Don't use *e.g.* (→ *for example*, *such as*), *i.e.* (→ *that is*), *etc.*, *vs.* (→ *versus*),
  *aka*, *approx.*, *w/*, or symbols for words ("10x" → "10 times").
- Don't use abbreviations as verbs ("connect by using SSH", not "ssh into").
- No periods in acronyms ("US", not "U.S.").
- Choose *a*/*an* by pronunciation: "a SQL database", "an SSH key", "an HTTP request".

## Numbers, units, dates, and times

- **Numbers:** spell out zero through nine and any number that starts a sentence; use numerals for
  10 and above, and always with units, versions, and technical values. Spell out ordinals ("first",
  not "1st"). Use commas in numbers of four or more digits in prose (1,000), except years and code.
- **Units:** a (nonbreaking) space between number and unit: "64 GB", "30 s"; no space for %, $,
  or °: "65%". Hyphenate as a modifier: "a 64-bit system". Write rates with *per*: "requests per
  second".
- **Version ranges:** "version 2.2 or later" / "earlier" — not "higher", "above", "2.2+".
- **Dates:** "January 19, 2026"; with the weekday, "Monday, January 19, 2026". Numeric dates only as
  ISO `2026-01-19`. No seasons ("in the fall") — use months or quarters.
- **Times:** 12-hour clock with a space and uppercase AM/PM ("3:45 PM", "3 PM"), unless the product
  uses 24-hour time. Spell out time zones with the UTC offset ("Pacific Standard Time (UTC-8)") and
  avoid them unless necessary.

## Example data

Never use real people, domains, emails, phone numbers, or IP addresses in examples.

- **Domains:** `example.com`, `example.org`, `example.net`.
- **Emails:** a name from the following list at an example domain: `dana@example.com`.
- **People:** diverse given names such as Alex, Amal, Bola, Charlie, Dana, Hao, Izumi, Kai, Kiran,
  Lee, Noam, Nur, Quinn, Raha, Rosario, Sasha, Tal, Yuri; use singular *they*. Surnames as an
  initial: "Quinn N.".
- **Companies:** "Example Organization".
- **IPv4:** `192.0.2.0/24`, `198.51.100.0/24`, `203.0.113.0/24`. **IPv6:** `2001:db8::/32`.
- **Phone numbers:** 800-555-0100 through 800-555-0199.
- **Project or resource names:** meaningful names like `staging`, `frontend-dev`, `orders-db` — not
  `foo`, `bar`, `test123`.

## Images and alt text

- Introduce each image with a complete sentence.
- **Alt text** concisely conveys what the image means in context ("Requests flow from the load
  balancer to three backend services."). Use empty alt text for purely decorative images.
- Captions follow the image, in sentence case, stating the takeaway: "**Figure 1.** Application
  capabilities are separated into services."
- Don't put new information only in an image; don't use images of text, code, or terminal output.
- Don't convey meaning by color alone; ensure 4.5:1 contrast for text.

## Accessibility checklist

The document should still make sense:

- without images, without color, and without sound;
- read aloud by a screen reader (which may skip punctuation and read link text out of context);
- navigated by headings and links alone;
- with a keyboard only, and at high magnification.

Keep sentences short (under about 26 words), avoid directional words (*above*, *below*, *left*,
*right* → *preceding*, *following*), and use meaningful link text.
