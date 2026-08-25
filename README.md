# Agent Skills

Personal [Agent Skills](https://agentskills.io/) for coding agents, maintained by [loderunner](https://github.com/loderunner).

Skills are packaged instructions that extend coding agents with domain-specific workflows and conventions. Agents load a skill's instructions on demand when a task matches its description.

## Skills

| Skill                                   | Description                                                                                                                                                         |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [go-conventions](skills/go-conventions) | Opinionated conventions for writing idiomatic, consistent Go code — package architecture, error handling, formatting, and testing (including synctest and mockgen). |
| [pr](skills/pr)                         | Manages GitHub PRs for the current branch: create, and update.                                                                                                      |

## Installation

Use the [Agent Skills](https://www.skills.sh/) CLI:

```shell
npx skills add loderunner/agent-skills
```

or install a specific skill:

```shell
npx skills add loderunner/agent-skills --skill <skill_name>
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
