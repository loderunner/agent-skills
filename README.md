# Agent Skills

Personal [Agent Skills](https://agentskills.io/) for coding agents, maintained by [loderunner](https://github.com/loderunner).

Skills are packaged instructions that extend coding agents with domain-specific workflows and conventions. Agents load a skill's instructions on demand when a task matches its description.

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

The coding agent will automatically load skills when it detects a relevant task.

```
❯ Write a Go function to parse the config file
```

In some agents, you can force a skill to load by mentioning it with a `/`.

```
❯ /pr create
```
