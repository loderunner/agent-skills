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
| [go-conventions](skills/go-conventions) | Applies opinionated conventions for idiomatic, consistent Go: package architecture, error handling, formatting, and testing (including synctest and mockgen). |
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
/plugin install loderunner@loderunner
```

or from the command line:

```shell
claude plugin marketplace add loderunner/agent-skills
claude plugin install loderunner@loderunner
```

## Usage

The coding agent loads skills automatically when it detects a relevant task. In some agents, you can also load a skill by typing its name after a `/`.

In Claude Code, the plugin namespaces each skill with the plugin name: for example, `/loderunner:pr`. The examples in this section use the short names.

### go-conventions

Applies automatically whenever you write, review, or refactor Go code. You don't need to invoke it. It covers formatting, error handling, package architecture, and testing conventions (including `synctest` and `mockgen`). The skill's `references/` files go deeper on architecture, database access, testing, timestamps, and documentation style (tone and structure for doc comments, READMEs, and guides).

### pair-review

Walks you through a GitHub PR as a conversation instead of a findings list. Each response covers one small piece of the diff, in the order it is best understood rather than file order: the diff, what changed, what deserves your attention. Then it stops so your questions can come up. Time-boxed to about 15 minutes per 500 changed lines.

```
❯ /pair-review 123
```

The skill first asks whether the PR is your code or someone else's, then checks out the PR. If your working tree is dirty, it stops and offers to stash, use a worktree, or commit.

Nothing changes until you ask. On your own code, the skill edits directly. On someone else's code, it queues review comments and, after you confirm, posts them as one GitHub review. In VS Code, it links every hunk to its lines, and the lines you highlight in the editor tell it what a vague question is about.

For a one-shot list of findings, use `/code-review` instead.

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

Watches the PR's CI runs and review comments until the PR can merge:

- Fixes failing checks, and reruns a flaky job once.
- Fixes clear review comments, and replies in the thread to comments that don't apply.
- Asks you before acting on anything bigger, such as a design change or a repeated failure.
- Merges when all checks pass, no threads are open, and branch protection is satisfied. The merge method comes from your `CLAUDE.md` or the repo, and the skill asks if neither states one.

The skill doesn't bypass branch protection. If a required approval is missing, it keeps waiting.

### technical-writing

Applies automatically whenever you write, rewrite, or review developer-facing text: READMEs, docs pages, tutorials, design docs, API reference, code comments, error messages, CLI help, release notes, commit messages, and PR descriptions. It also applies when you ask for clearer, shorter, or more consistent technical text.

The skill distills Google's technical writing courses and developer documentation style guide into core rules. Its `references/` files go deeper on documents, code comments and API docs, error messages, formatting and mechanics, and a word list.

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
