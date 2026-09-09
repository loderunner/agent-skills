---
name: tutorial
description: "Teach a technology, stack, or unfamiliar codebase as a hands-on course, in two phases. Use for any request to design, plan, or scope a tutorial, course, syllabus, or crash course for a technology or codebase — this builds and verifies a reference implementation first, then extracts a chapter-and-section table of contents from what the build actually taught. Also use for any request to be taught, walked through, or given a crash course, or for the next chapter of a course already underway — this delivers one small increment at a time (a problem, a few lines to copy, why they take that shape, then stop and wait)."
---

# Tutorial skill

Teaching a technology well is two distinct kinds of work, usually done in separate sessions: **preparing** a course and **delivering** it. Planning a syllabus from memory while also trying to pace a live lesson produces a course that looks fine on paper and a lesson that dumps code — so this skill keeps the two apart as sub-skills, each in its own reference file, loaded only when it applies.

## Which sub-skill applies

- **Preparing** — the request is to design, plan, or scope a course, syllabus, or crash course, and no verified course exists yet. Read `references/prep.md` and follow it in full: build a working reference implementation, verify it, then extract the table of contents from what the build actually taught.
- **Delivering** — a course, table of contents, or reference implementation already exists (in this conversation, a repo, or a project doc), or the request is to be taught, walked through, or given the next chapter. Read `references/deliver.md` and follow it in full: one small, observable increment per response, then stop.

When it's unclear which applies — e.g. "teach me FastAPI" with nothing prepared and no small scope agreed — don't guess. `references/deliver.md` has a "When no course exists yet" section that stops and asks the learner to choose: prepare it properly first, wing it from memory now, or check whether a tutorial is even what they wanted.

Read only the reference file for the phase in play — each is self-contained and written for a session with no other context.
