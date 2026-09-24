# Skill eval bench

Checks whether Claude-with-a-skill obeys the skill, and whether the skill is
what *causes* the compliance.

1. **Compliance** — does Claude-with-the-skill obey claim X?
2. **Attribution** — does it obey *because of* the skill? A claim the baseline
   satisfies just as often is text that isn't earning its place.

Grading uses [Jev](https://docs.typesafe.ai/) for judgment and tree-sitter for
anything a parser can settle.

## Setup

```sh
pnpm install
cp .env.example .env    # then fill it in
```

## Running

```sh
pnpm test          # is the bench correct?      (red = fix the bench)
pnpm eval          # does the skill work?       (red = a finding about the skill)
pnpm generate      # both arms, all cases — slow, costs tokens
pnpm generate split-call-from-if    # just one case
```

`pnpm generate` writes `runs/<id>/<arm>/<case>/rep-N/` and points `runs/latest`
at it; `pnpm eval` grades `runs/latest`. They are separate because `claude -p`
takes 30–60s per invocation, so iterating on a grader costs seconds and no
generation spend.

**A red `pnpm eval` is not a broken build.** It means the skill failed to teach
a claim, or the baseline already satisfied it. Both are actionable, and neither
is a reason to "fix the test". A red `pnpm test` *is* a bug, and every result
the bench produced is suspect until it is green.

Reading the output:

- **failing compliance** — the skill didn't teach this claim.
- **failing attribution** — the baseline already satisfies it, so the claim text
  costs tokens for nothing.
- **skip** — the run produced nothing the claim covers. Not a pass: counting
  vacuous truth as a pass rewards a skill that makes Claude write *less* code.
- **error** — the grader couldn't decide. A bug in the question, not a verdict.

**If everything passes on the first run, suspect the bench before believing the
skill.**

Overrides: `EVAL_REPS`, `EVAL_RUN`, `JEV_MODEL`.

## Layout

```
src/case.ts               claim, checks, and the three check builders
src/run.ts                parse → check → outcome
src/generate.ts           runs `claude -p` in both arms → runs/
src/load.ts               find cases, fixtures and runs on disk
src/arms.ts               the controlled variable
src/checkers/ast.ts       tree-sitter: parse, run queries, expose node facts
src/checkers/go.ts        Go AST vocabulary
src/checkers/go-shell.ts  Go readings of a shell command
src/checkers/jev.ts       judgment: one typed question per unit
src/checkers/transcript.ts  parses the tool-call log
suites/<suite>/cases/<case>/
  case.ts                 claim, source, checks
  prompt.md               the probe
  seed/                   files the probe starts from (optional)
  fixtures/pass|fail/     known verdicts, for grader validation
  fixtures/README.md      what each fixture pins down
tests/                    project `bench` — tests of the code above
eval/suite.test.ts        project `eval` — the measurement
```

Only `src/checkers/go*.ts` and `suites/go-conventions/` are Go-specific.

## Adding a case

Add a folder under `suites/<suite>/cases/`. Nothing to register.

`case.ts` declares a claim and a list of checks, built with `astCheck`,
`jevCheck` or `transcriptCheck`. Each **enumerates units** with a tree-sitter
query and **classifies one unit at a time** — in TypeScript when a parser can
settle it, with Jev when it can't. That split keeps every Jev question atomic,
which is the biggest factor in whether Jev answers well. Every tally and
threshold is computed in TypeScript; Jev is never asked "how many".

Put the near-misses in `fixtures/`. A wrong grader is invisible, because Jev
gives no rationale, so a grader that can't classify the skill's own examples
doesn't grade anything.

**Fixtures carry no comments.** The grader reads those bytes, so a comment
explaining the expected verdict is a hint aimed at the very thing being
calibrated. Each fixture's rationale goes in `fixtures/README.md`, where the
grader never sees it.

Three rules that prevent silent bias:

- **Comments are stripped** from anything sent to Jev. The model under test
  writes the comments, and a with-skill run can emit an argument aimed at the
  grader, present in only one arm.
- **Comments never change structure.** Use `nextStatement()` rather than
  `nextNamedSibling` when a rule cares what follows what; otherwise a run can
  shift its own grade by writing a comment.
- **`JEV_MODEL` is pinned**, so a silent model repoint can't read as a skill
  regression.

## Writing a prompt

Prompts must **not** restate the convention. If `prompt.md` hints at the rule,
the baseline gets the answer for free and attribution collapses. Write an
ordinary task that creates the opportunity to violate the claim, then check
coverage afterwards — never write the prompt backwards from the claim.

`--bare` caps the tool set to Bash, Edit and Read: there is no `Write`, so
prompts must not assume one.
