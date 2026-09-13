# Agent Skills

Personal [Agent Skills](https://agentskills.io/) for coding agents, maintained by [loderunner](https://github.com/loderunner).

Skills are packaged instructions that extend coding agents with domain-specific workflows and conventions. Agents load a skill's instructions on demand when a task matches its description.

## Contents

- [Skills](#skills)
- [Installation](#installation)
- [Usage](#usage)
  - [go-conventions](#go-conventions)
  - [pr](#pr)
  - [tutorial](#tutorial)

## Skills

| Skill                                   | Description                                                                                                                                                         |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [go-conventions](skills/go-conventions) | Opinionated conventions for writing idiomatic, consistent Go code — package architecture, error handling, formatting, and testing (including synctest and mockgen). |
| [pr](skills/pr)                         | Manages GitHub PRs for the current branch: create, and update.                                                                                                      |
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

Applies automatically whenever you write, review, or refactor Go code — no invocation needed. It covers formatting, error handling, package architecture, and testing conventions (including `synctest` and `mockgen`), with deeper guidance in the skill's `references/` files for architecture, database access, testing, and timestamps.

### pr

Manages GitHub PRs for the current branch, with two sub-commands:

```
❯ /pr create
```

Commits any uncommitted changes, creates and pushes a branch if you're still on the default branch, then drafts a PR body from the branch's commits and diff and opens the PR.

```
❯ /pr update
```

Commits any uncommitted changes, rebases onto the base branch if it's moved (falling back to a merge, or stopping to ask if there's a real conflict), pushes, then refreshes the PR's title and description.

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
