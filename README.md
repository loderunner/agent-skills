# Agent Skills

Personal [Agent Skills](https://agentskills.io/) for coding agents, maintained by [loderunner](https://github.com/loderunner).

Skills are packaged instructions that extend coding agents with domain-specific workflows and conventions. Agents load a skill's instructions on demand when a task matches its description.

## Contents

- [Skills](#skills)
- [Installation](#installation)
- [Usage](#usage)
  - [go-conventions](#go-conventions)
  - [pair-review](#pair-review)
  - [pr](#pr)
  - [technical-writing](#technical-writing)
  - [tutorial](#tutorial)

## Skills

| Skill                                   | Description                                                                                                                                                         |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [go-conventions](skills/go-conventions) | Opinionated conventions for writing idiomatic, consistent Go code — package architecture, error handling, formatting, and testing (including synctest and mockgen). |
| [pair-review](skills/pair-review)       | Walks you through a pull request one stop at a time, in the order it is best understood, so you review at your own pace; queues comments or makes edits only on request. |
| [pr](skills/pr)                         | Manages GitHub PRs for the current branch: create, update, and babysit.                                                                                             |
| [technical-writing](skills/technical-writing) | Writes and edits clear developer-facing text — READMEs, docs, code comments, error messages, and commit messages — using principles from Google's technical writing courses and style guide. |
| [tutorial](skills/tutorial)             | Teaches a technology or codebase as a hands-on course: prepares a verified reference build and chapter TOC, then delivers it one small increment at a time.         |

## Installation

Use the [Agent Skills](https://www.skills.sh/) CLI:

```shell
npx skills add loderunner/agent-skills
```

or install a specific skill:

```shell
npx skills add loderunner/agent-skills --skill <skill_name>
```

### Claude Code plugin marketplace

This repo is also a [Claude Code plugin marketplace](https://docs.claude.com/en/docs/claude-code/plugin-marketplaces). Add it and install the plugin from inside Claude Code:

```
/plugin marketplace add loderunner/agent-skills
/plugin install agent-skills@agent-skills
```

or from the command line:

```shell
claude plugin marketplace add loderunner/agent-skills
claude plugin install agent-skills@agent-skills
```

## Usage

The coding agent will automatically load skills when it detects a relevant task. In some agents, you can also force a skill to load by mentioning it with a `/`.

### go-conventions

Applies automatically whenever you write, review, or refactor Go code — no invocation needed. It covers formatting, error handling, package architecture, and testing conventions (including `synctest` and `mockgen`), with deeper guidance in the skill's `references/` files for architecture, database access, testing, timestamps, and documentation style (tone and structure for doc comments, READMEs, and guides).

### pair-review

Walks you through a GitHub PR as a conversation instead of a findings list. Each response covers one small piece of the diff, in the order it is best understood rather than file order: the diff, what changed, what deserves your attention. Then it stops so your questions can come up. Time-boxed to about 15 minutes per 500 changed lines.

```
❯ /pair-review 123
```

It first asks whether the PR is your code or someone else's, then checks the PR out (it stops if your working tree is dirty and offers to stash, use a worktree, or commit). Nothing changes until you ask. On your own code it edits directly; on someone else's it queues review comments and, at the end, posts them as one GitHub review after you confirm. In VS Code it links every hunk to its lines, and highlighting lines in the editor tells it what a vague question is about. For a one-shot list of findings, use `/code-review` instead.

### pr

Manages GitHub PRs for the current branch, with three sub-commands:

```
❯ /pr create
```

Commits any uncommitted changes, creates and pushes a branch if you're still on the default branch, then drafts a PR body from the branch's commits and diff and opens the PR.

```
❯ /pr update
```

Commits any uncommitted changes, rebases onto the base branch if it's moved (falling back to a merge, or stopping to ask if there's a real conflict), pushes, then refreshes the PR's title and description. If the PR was stacked on another branch that has since been squash-merged (and the PR retargeted), it finds where your branch forked from the old base, using GitHub's PR history, and replays only your commits. Conflicts with what the old base changed afterwards are resolved from that history when its intent is clear.

```
❯ /pr babysit
```

Watches the PR's CI runs and review comments until it can merge. It fixes failing checks (rerunning a flaky job once), fixes clear review comments, and replies in the thread to ones that don't apply. It asks you before acting on anything bigger, such as a design change or a repeated failure. It merges only when all checks pass, no threads are open, and branch protection is satisfied, using the merge method your `CLAUDE.md` or the repo calls for (it asks if none is stated). It never bypasses branch protection, and it keeps waiting if a required approval is missing.

### technical-writing

Applies automatically whenever you write, rewrite, or review developer-facing text: READMEs, docs pages, tutorials, design docs, API reference, code comments, error messages, CLI help, release notes, commit messages, and PR descriptions. It also applies when you ask for clearer, shorter, or more consistent technical text. It distills Google's technical writing courses and developer documentation style guide into core rules, with deeper guidance in the skill's `references/` files for documents, code comments and API docs, error messages, formatting and mechanics, and a word list.

### tutorial

Teaches a technology, stack, or unfamiliar codebase as a hands-on course, in two phases that are usually separate sessions: **prepare**, then **deliver**.

#### Prepare

Takes a course request, plus your reader level, pace, and tone if not already implied by it:

```
❯ /tutorial Design a crash course on FastAPI for someone who already knows Flask
```

Produces two artifacts, saved somewhere durable (a repo file, a project doc): a **chapter-and-section table of contents**, and a **reference implementation** the course is built from.

#### Deliver

Takes that TOC and reference implementation — from an earlier prepare, or already present in the repo or conversation — plus which chapter to teach:

```
❯ /tutorial Teach me chapter 3
```

Produces the chapter, one increment at a time, each requiring you to implement and try the code before it continues.
