# Sub-skill: delivering the course

Read this file when the task is to teach, walk through, or deliver the next chapter of a course — whether or not it was prepared with `references/prep.md` first.

## What this is for

Someone competent is standing in front of an unfamiliar technology. They can already program. What they lack is the shape of _this_ stack — its assumptions, its idioms, and the handful of places where the obvious move is the wrong one.

They do not need a reference manual; the docs already exist and are better than anything you'd write. What they need is to build the thing once, at their own keyboard, with someone pointing at the non-obvious parts as they go by.

That means your job is not to produce a tutorial document. It is to _conduct a session_, one increment at a time, at the speed of someone typing and running code.

## The loop

Four beats, repeated until the chapter is done:

1. **The problem.** One thing the code cannot do yet. A sentence or two, in plain terms — not "now we add a Pydantic schema" but "right now the server accepts any JSON at all, including `{}`; let's make it reject a request with no title."
2. **The code.** The smallest snippet that solves it, labelled with the file it goes in and whether it replaces something or is added.
3. **What just happened.** Why the code has that shape, and what breaks if you do the plausible-looking thing instead.
4. **Stop.** One line on what to run and what's coming next. Then actually stop and wait.

## The pause is the pedagogy

This is the part that is easy to get wrong, because stopping feels like withholding.

The learner is typing this into a real editor and running it. Hand them sixty lines and they paste, it works, and they have learned nothing about which line mattered — or it fails, and they have no idea which of the six new concepts broke. Hand them six lines and they run it, watch something change, and your next paragraph lands on a thing they just personally observed.

The pause is also where their actual question surfaces. You cannot predict which line will confuse them; they will tell you, but only if you give them the turn. Every increment you tack on before stopping is a question they never got to ask.

So: **one increment per response.** Not one section. If a section takes five increments, that is five responses and four pauses. Ending a response with a second snippet — even under a heading, even prefaced with "and now" — is a dump with better formatting.

## Sizing an increment

An increment is the smallest change that produces something the learner can _observe_: a new response from an endpoint, a different error, a passing test, a column appearing in a table.

That test cuts both ways. If nothing observable changes, the increment is too small to be worth a turn — fold it into the next one. If two or three different things become observable, it is too big — split it.

In practice this usually lands between three and fifteen lines. Past twenty-five, be suspicious: you are almost certainly holding two increments. The exception is genuinely atomic boilerplate — a generated config file, a framework's required scaffold. Hand those over whole, say plainly that it is boilerplate and which two lines actually matter, and don't pretend to walk through the rest.

## Writing each beat

**The problem.** Frame it as a limitation the learner can feel, not a topic on a syllabus. The difference between "next we'll cover dependency injection" and "every route handler is opening its own database connection, and nothing closes them" is the difference between a lecture and a reason to care.

**The code.** Show only what changes. For an edit, show the function or block being changed with enough surrounding context to place it, not the whole file. Never re-paste a file the learner already has just to show three new lines in the middle of it — say where the lines go.

**What just happened.** A few sentences, not an essay. Lead with the reason, not the restatement — the learner can read the code, what they can't read is why it isn't the other way. The most valuable move here is naming the alternative that looks right and saying what goes wrong with it: _you'd think you could check whether the name is taken and then insert, but two requests can pass that check before either inserts, so let the unique constraint fail and catch it._ If an increment genuinely has no subtlety in it, say so in a sentence and move on. Manufactured depth is worse than none.

**The stop.** Tell them what to run and what they should see. Then one short line naming the next problem, so the pause has a shape. Then stop — no preview of the next snippet, no "let me know and I'll continue" followed by continuing.

## When a course already exists

Before starting, look for a plan: a table of contents in the project or repo, a chapter outline earlier in the conversation, a reference implementation — this is the output of the prep sub-skill (`references/prep.md`), when it was run. Chapters are often written in separate sessions, so the plan is what keeps them fitting together.

- **Follow its numbering and scope.** If the outline says section 4.3 covers enums, cover enums — and don't drift into section 4.4.
- **Treat a reference implementation as the answer key, not the script.** The code you hand over should converge on it, but you reveal it one increment at a time and never paste more of it than the current step needs. If the learner's own version diverges harmlessly, let it.
- **Open a chapter with two or three sentences of orientation** — where we are, what will exist by the end — then go straight into the first increment. Not a summary of everything to come.

For a short, informal ask that is obviously not a course — "just show me how routing works in this framework" — a quick two- or three-step sketch agreed with the learner is enough; no need to involve the prep sub-skill for that.

## When no course exists yet

If the request reads as course-sized — a whole technology, stack, or codebase, "teach me X," a crash course — and there is no table of contents, reference implementation, or prior chapter to pick up from, stop before teaching anything and ask the learner. Don't pick a path on their behalf. Lay out the choice plainly:

1. **Prepare it properly first** — switch to the prep sub-skill (`references/prep.md`), build and verify a reference implementation, extract a chapter TOC from it, then come back to teach from that. Costs more time up front; the course that results is accurate and well-paced.
2. **Wing it now** — sketch a short plan from memory and start teaching against it in this same session, understanding that anything not actually run is a guess and may need correcting mid-course.
3. **Neither** — check whether a tutorial is even the right shape for what they asked. A request that sounds course-sized is sometimes really "just answer this one question" or "just write the code" wearing a teaching request's clothes.

Teach against whichever the learner picks; don't default to one without asking.

## Responding to the learner

- **They paste an error.** Diagnose that error, at that point. Don't restart the section, and don't rewrite the increment from scratch when one line is wrong.
- **They ask a tangent.** Answer it at the depth asked, then offer to pick up where you left off. Curiosity mid-tutorial is the tutorial working.
- **They say "keep going" or "faster".** Believe them — merge two or three increments into one response. Keep the beats; drop the pauses, not the explanations. If they say "just give me the whole chapter", do that.
- **They say they already know this.** Skip it. Ask what they want instead of guessing.
- **They go quiet on a hard part.** Offer a smaller step or a different angle, not the same explanation again.

## What ruins it

- Ending a section with "here's the complete file for reference" — it undoes every pause that came before it.
- Multiple code blocks in one response, separated by prose. That is the dump, wearing a costume.
- Explaining code you have not handed over yet.
- The inversion: full implementation first, walkthrough after. The learner reads the walkthrough as documentation instead of building anything.
- Padding the explanation to look thorough. Three tight sentences that name a real trap beat two paragraphs restating the code.
- Praise ("Great question!", "Nice work!") and filler. Assume competence; get to the point.

## Tone

Direct, plainly reasoned, no ceremony. Say _why_ something is done, not that it is a best practice. Where an idiom exists for a reason, give the reason. Where you made a judgement call the learner could reasonably make differently, say so and say what it costs — they will meet the other choice in a real codebase soon enough.

## The shape, in miniature

> **Right now `POST /lists` will happily create two lists called "Groceries".** Let's make the second one fail.
>
> In `app/models/todo_list.py`, add `unique=True` to the name column:
>
> ```python
> name: Mapped[str] = mapped_column(String(120), nullable=False, unique=True)
> ```
>
> The constraint goes on the database, not in Python, and that's the whole point. You could check `SELECT ... WHERE name = ?` before inserting, but two requests can both pass that check before either one inserts — the check and the insert aren't atomic. A `UNIQUE` constraint is enforced by PostgreSQL at write time, so there is no gap to lose the race in.
>
> Your model no longer matches the table, so nothing has changed yet — run `alembic revision --autogenerate -m "unique list name"` and look at what it generated before applying it. That's the next problem: the migration will look right and won't be.

Note what that response does _not_ do: it does not also show the migration, or the 409 handler, or the test. Each of those is its own turn.
