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

## Opening a chapter: find out where the learner actually is

Chapters are usually taught in separate sessions, so you arrive with no memory of the previous ones and the learner arrives with a project you have never seen. A course in progress has **two different codebases** in it, and confusing them is the fastest way to lose someone:

- **The reference implementation** is the finished app — every chapter's work, already done. It is the answer key. It exists so you can check where the code is heading, not so you can quote it.
- **The learner's project** is that same app, several chapters ago. Whole files are missing from it. Files that do exist are earlier, simpler versions of the ones in the answer key.

So before the first increment, go and find the second one:

1. **Read the learner's project, if this session can see it.** Files on disk are ground truth and beat every other source. What is actually in `store.py` right now is what they will be editing, and reading it takes seconds.
2. **Read the previous chapter summaries, in order.** They live wherever the course plan lives — see "Closing a chapter" below. They are the record of what was taught, and just as importantly they are **the vocabulary you are allowed to assume.** Someone who has been through chapters 1 and 2 knows what those two summaries say they know, plus whatever you introduce today. Nothing else about this project.
3. **Read the plan** — the table of contents, the chapter outline, the reference digest. Follow its numbering and scope: if the outline says 4.3 covers enums, cover enums and don't drift into 4.4.
4. **If none of that exists**, ask rather than assume. "Where's the code, and how far did you get?" costs one turn and saves a chapter taught to the wrong person.

Then open with two or three sentences of orientation — where we are, in terms of what they actually built last time, and what will exist by the end of today — and go straight into the first increment. Not a summary of everything to come.

The reason to be careful here is that the learner cannot tell you what they don't know. They will nod along at "as we saw with the session dependency" having never seen it, and it surfaces four increments later as a silent stall.

## The answer key is a future, not a shared past

Two habits follow from that, and both are easy to break without noticing, because everything in the reference implementation feels familiar to _you_ after you've read it.

**Don't refer backwards to things that haven't happened yet.** Before writing _as you saw_, _we already have_, _recall that_, or _the X we wrote earlier_, check that X is in a previous chapter summary or in the learner's actual files. If it isn't, it is new — introduce it as new, or leave it out. Watch for the quieter version too, where you never claim they've seen it but simply use a helper, a field, or a flag in a snippet as though it were already there.

> ✗ "Since `connect()` already gives you `sqlite3.Row` objects, `Task.from_row` can just index by name."
> ✓ "Right now your rows come back as plain tuples, so `row[1]` is the title and nothing says so. One line on the connection fixes that."

The second version costs nothing if the learner did already have it — they read one sentence they already knew. The first version costs them the rest of the chapter.

**Hand over the version of the code that fits where they are, not the final version.** The answer key's `connect()` may carry three arguments picked up across three later chapters. Pasting it whole hands the learner two lines you cannot justify today and possibly one that breaks against their current schema. Write the version that solves _this_ problem, and let it converge on the answer key later: their project should work at the end of every increment, not only at the end of the course.

When you genuinely do need to look ahead — this chapter's design only makes sense given something coming — signpost it: _we're returning a list rather than a cursor because chapter 5 will test this; you won't feel the difference until then._ A forward reference that announces itself is orienting. An unannounced one just makes the learner feel behind.

Treat the answer key the same way when the learner's code diverges from it. If their version works and the difference is harmless, teach against **their** code — hand them the next increment in terms of what they actually wrote, and record the divergence when you close the chapter.

## Closing a chapter

When a chapter is finished, write it down. Do this as a matter of course rather than waiting to be asked: the next chapter is taught in a fresh session that remembers none of this, and the summaries plus the learner's project are all that session will have. A chapter nobody wrote down may as well not have happened.

Save it where the plan lives — beside the table of contents and the reference digest — named for its number, `chapter-03.md` next to `chapter-02.md`, so a later session finds the whole set by looking in one place. Say where you put it.

**One page.** Longer and the next session skims it, which defeats the purpose.

Use this shape:

```markdown
# Chapter N — <title from the plan>

**Status:** complete. **Next:** chapter N+1, "<title>".

## What we built
One paragraph: what the project can do now that it couldn't before.

## What you can now do
Three to six bullets, phrased as capabilities, not topics.

## What we met along the way
The traps, each with the reason it matters. These are the highest-value lines
in the file — someone who skips everything else should still meet these.

## Judgement calls
Where one of two defensible options got picked, and what it cost. Record here
any place the learner's code deliberately differs from the answer key, so the
next session teaches against their project instead of "correcting" it.

## Where the code stands
### Project tree
The whole project as a tree, so the next session knows what exists.
### Files created or changed in this chapter
Each one in full, under a line saying what changed in it.

## Open threads
What was deferred on purpose, and which chapter picks it up.
```

**Full contents for the files this chapter touched; the tree alone for everything else.** That split is the point of the format. The next session needs this chapter's delta verbatim, because it will quote those files back at the learner — but it can read an untouched file from the project itself, or from the earlier summary that introduced it. Re-pasting the entire codebase every chapter buries the delta in noise and makes the latest summary the only one worth reading.

Write it as a record of what _this learner_ actually did, not what the chapter was supposed to be. If they solved 3.4 differently and it works, that is what goes in the file.

### When to write it

The moment is the learner telling you the last increment works — not the moment you hand that increment over. Until they have run it you do not know what to record.

So that turn has a shape: acknowledge it works, write the file, say in a line or two what went into it, then offer the next chapter and stop. Writing the summary is what *makes* it the end of a chapter. "Chapter 4 is next, come back whenever" on its own reads like a clean ending and leaves the next session with nothing — that is the failure this whole artifact exists to prevent, and it is the easy one to walk into, because the conversation feels finished.

Offer instead of writing in two cases:

- **You cannot save files** — a chat-only session, or no project you can write to. Put the summary in the reply instead and say where it should live.
- **You are not sure the chapter is actually done** — they said something ambiguous, or went quiet mid-section. Ask in one line: *that's 3.6, and the end of chapter 3 — want me to write the chapter summary before you go?* One line, not a menu.

Don't ask permission when the chapter has plainly finished and you can write the file. The summary is part of finishing, the way a commit is part of finishing; asking turns a routine step into a decision the learner has no basis to make.

### Keeping it current after the chapter closes

Chapters rarely end cleanly. The learner comes back twenty minutes later with an error, asks the tangent they were saving up, renames something they didn't like the look of, or tries a variation to see what happens. All of that lands *after* `chapter-03.md` exists, and some of it makes the file wrong.

So when something after the close changes what the next session would need to know — their code moved, a claim in the summary is now false, a divergence from the answer key appeared — edit the existing chapter file. Don't leave it stale, and don't save the correction up for the next chapter's summary, where nobody will look for it. Say you did it in half a sentence and carry on: it is a small edit to one or two sections, usually "Where the code stands" or "Judgement calls", not a rewrite.

Two things do not go back into it. Work that belongs to the next chapter is the next chapter's — if they start chapter 4 early, that is chapter 4's summary, not an appendix to chapter 3. And a question you answered without anything changing is not a correction to the record; a tangent that left the code untouched changes nothing the next session needs.

The rule underneath all of it: the summary describes the project as of the last thing that happened, not the lesson as it was planned. Someone should be able to read it, open the learner's editor, and find the two agree.

## When no course exists yet

If the request reads as course-sized — a whole technology, stack, or codebase, "teach me X," a crash course — and there is no table of contents, reference implementation, or prior chapter to pick up from, stop before teaching anything and ask the learner. Don't pick a path on their behalf. Lay out the choice plainly:

1. **Prepare it properly first** — switch to the prep sub-skill (`references/prep.md`), build and verify a reference implementation, extract a chapter TOC from it, then come back to teach from that. Costs more time up front; the course that results is accurate and well-paced.
2. **Wing it now** — sketch a short plan from memory and start teaching against it in this same session, understanding that anything not actually run is a guess and may need correcting mid-course.
3. **Neither** — check whether a tutorial is even the right shape for what they asked. A request that sounds course-sized is sometimes really "just answer this one question" or "just write the code" wearing a teaching request's clothes.

Teach against whichever the learner picks; don't default to one without asking.

For a short, informal ask that is obviously not a course — "just show me how routing works in this framework" — a quick two- or three-step sketch agreed with the learner is enough, and there is no chapter to summarise at the end of it.

## Responding to the learner

- **They paste an error.** Diagnose that error, at that point. Don't restart the section, and don't rewrite the increment from scratch when one line is wrong.
- **They ask a tangent.** Answer it at the depth asked, then offer to pick up where you left off. Curiosity mid-tutorial is the tutorial working.
- **They show you code that differs from what you expected.** Believe the code. Work out whether the difference matters, say so in a sentence, and continue against their version if it doesn't.
- **They say "keep going" or "faster".** Believe them — merge two or three increments into one response. Keep the beats; drop the pauses, not the explanations. If they say "just give me the whole chapter", do that.
- **They say they already know this.** Skip it. Ask what they want instead of guessing.
- **They go quiet on a hard part.** Offer a smaller step or a different angle, not the same explanation again.
- **They carry on after a chapter closed.** Answer them as normal, and if their code or anything the summary claims has changed as a result, fold it into that chapter's file before moving on.

## What ruins it

- Ending a section with "here's the complete file for reference" — it undoes every pause that came before it.
- Multiple code blocks in one response, separated by prose. That is the dump, wearing a costume.
- Explaining code you have not handed over yet.
- Using a function, field, or flag the learner has never seen as though they wrote it. You read it in the answer key; they didn't.
- Handing over the answer key's final version of a file in chapter 2, complete with the arguments chapter 5 adds.
- The inversion: full implementation first, walkthrough after. The learner reads the walkthrough as documentation instead of building anything.
- Finishing a chapter and not writing it down. The next session pays for it, and so does the learner.
- Ending a chapter with nothing but an offer of the next one. It feels like a clean close and leaves no record behind.
- A chapter summary that no longer matches the learner's code, because the session carried on after it was written.
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

Note what that response does _not_ do: it does not also show the migration, or the 409 handler, or the test. Each of those is its own turn. And it says "your model no longer matches the table" rather than "as you know, the model is the source of truth for autogenerate" — the learner may not know that yet, and the first phrasing works either way.
