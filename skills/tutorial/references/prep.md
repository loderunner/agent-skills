# Sub-skill: preparing the course

Read this file when the task is to design, plan, or scope a tutorial, course, syllabus, or crash course — before any teaching happens.

Two phases, in order: **build the thing, then extract the course from it.** The order is the whole idea.

## Why build first

A syllabus written from memory looks fine and falls apart in chapter six, when the pieces you imagined don't actually fit together. Building first buys four things you cannot get any other way:

- **Real chapter order.** Dependency order is discovered, not recalled. You find out that the test fixtures have to exist before the repository chapter by hitting the wall, not by predicting it.
- **Real gotchas.** Every subtlety you list is one you personally tripped over in *this* version of *these* libraries. Remembered gotchas go stale — the flag moved, the default changed, the error message is different now.
- **Honest sizing.** You know which parts took three lines and which took an hour. That is what makes some chapters short and one chapter long, correctly.
- **An answer key that works.** Later sessions teach against a reference that provably runs, so a learner's "this doesn't work" can be checked rather than argued with.

## Phase 0 — scope it

Before building, ask two to four questions, and only the ones where guessing wrong means rebuilding. Good candidates: a fork in the architecture (sync or async, REST or gRPC), which hard case to feature, where a cross-cutting concern like testing lives. Bad candidates: anything you can decide yourself and mention later.

Settle what is deliberately **out** of scope, and say so. A course that also covers auth, logging, deployment and CI teaches none of them well. Cutting them is the decision that makes the rest teachable.

## Phase 1 — build it

Build the smallest thing that genuinely exercises every part of the stack the learner named. "Smallest" is not "toy": include at least one deliberately hard case, because the easy CRUD path teaches almost nothing and the subtleties all live in the hard one.

**Verify it.** Not "it looks right" — run it. Tests pass, the thing responds, the migration goes both ways. And measure the specific claims you intend to make later: if the course is going to say "this avoids the N+1", count the queries and know the number. An unverified claim in a TOC becomes a chapter that teaches something false.

**Keep a surprise log.** This is the mechanism that makes phase 2 work, so keep it deliberately. Every time you get surprised, make a judgement call, look something up, or watch something fail in a way you didn't expect — write down one line. A flag whose default is the opposite of what you assumed. A tool that generates almost-correct output. Two plausible designs where you picked one. An error message that named the wrong cause.

That log *is* the course. A section built around a real entry from it teaches something; a section built around a topic name teaches a definition.

**When there is nothing to run** — a concept you can't execute, a vendor API you have no key for, a system design — work the problem end to end anyway: write the config, draw the architecture, trace the request path, and check your reasoning against primary sources. Partial verification is still verification: a workflow file you can lint, a query you can `EXPLAIN`, a schema you can validate all move claims out of the guess column.

## The report before phase 2

When the build is done, say plainly, in a few lines: what got built, what you verified and with what result (numbers, not adjectives), which judgement calls you made and what the alternative was, and what you left out. Then continue into phase 2 — don't wait for permission, but do make the record visible so it can be challenged.

A judgement call worth surfacing looks like: *"I included migrations even though they weren't on the stack list, because teaching `create_all()` builds a habit that has to be unlearned immediately. It's one short chapter and easy to drop."*

## Phase 2 — extract the TOC

Build order is the first draft of teaching order, not the final one: you backtracked, and the learner shouldn't. Straighten it, then split it.

**A chapter** is a coherent capability — the thing that exists at the end of it. **A section** is one problem, sized so that a later session can hand it over as a small increment of code and stop. If you can't imagine what code a section produces, it's a topic, not a section, and it needs to be rewritten or merged.

Every section gets a one-line summary of what the learner *does*, not what the section is *about*. Where a surprise-log entry belongs to a section, name it in that summary — "the enum trap: autogenerate creates the type but never drops it" is worth ten times "covers Alembic enums", because it tells a later session what the section is *for*.

Let the shape be uneven. Real material isn't uniform: if one chapter has fourteen sections because that's where the difficulty is, that's the honest answer, and evening it out would hide exactly the thing the learner came for.

Close with a chapter on what was deliberately left out and where it would attach, plus the natural next step past the course. It costs a paragraph and it stops the omissions from reading as oversights.

**Mark every claim as demonstrated or reasoned.** A later session reading the TOC cannot tell the difference by looking, and the cost of guessing wrong is teaching something false with total confidence. So say which is which, in the section itself or in a short verification record at the end — what you ran, and what it showed. Do this even when the build was fully runnable and everything got measured: "all of it was verified, here is the test count and the numbers behind each claim" is a one-line record, and its absence is indistinguishable from nobody having checked.

## What to leave behind

Later chapters get written in fresh sessions with none of this context, so the output has to stand alone. Save, durably — a project doc, a repo file, whatever persists in this environment:

1. **The table of contents.** Numbered chapters and sections, each with its one-line summary, plus a short note on how the course is meant to be delivered and what the reference implementation is.
2. **A reference source digest.** Every source file of the build, inline, in one readable document. A future session needs to read the answer key without unpacking an archive.

Say where you put them. If a downloadable copy of the project would help, offer it rather than assuming.

## What makes a bad TOC

- **Topic lists.** "4.4 Enums" tells a later session nothing. "4.4 Store status as a native PostgreSQL enum, and the `values_callable` line that stops it storing the member names" tells it everything.
- **Sections that produce no code.** Usually a sign the material was recalled rather than built.
- **Gotchas from memory.** If it didn't happen during the build, don't promise it in the outline — or mark it as reasoned and let the later session decide how much weight to give it.
- **Suspiciously even chapters.** Uniformity means the shape came from a template, not from the work.
- **Unstated scope.** A chapter that can't be taught in a fresh window because it silently depends on something no one wrote down.

## Writing for the reader

The TOC's first reader is not the learner — it's a later session, working from a blank context, trying to teach chapter 7 without having seen chapters 1 through 6. Write it so that session can pick up numbering it must follow, a scope boundary it must respect, and a reference implementation it can converge on. Anything that only makes sense to someone who watched the build happen needs to be written down or dropped.

## Handoff

Once the TOC and reference digest are saved, delivering the course is a separate task — see `references/deliver.md` in this same skill. Don't start teaching increments from inside this phase; hand off cleanly, with the artifacts saved and their location stated.
