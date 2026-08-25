# Agent Skills

Personal [Agent Skills](https://docs.claude.com/en/docs/claude-code/skills) for [Claude Code](https://claude.com/claude-code), maintained by [loderunner](https://github.com/loderunner).

Skills are packaged instructions that extend Claude Code with domain-specific workflows and conventions. Claude loads a skill's instructions on demand when a task matches its description.

## Skills

| Skill | Description |
| --- | --- |
| [go-conventions](skills/go-conventions) | Opinionated conventions for writing idiomatic, consistent Go code — package architecture, error handling, formatting, and testing (including synctest and mockgen). |
| [pr](skills/pr) | Manages GitHub PRs for the current branch: create, update, and rebase. |

## Usage

Clone this repo and symlink (or copy) the skills you want into your Claude Code skills directory:

```sh
git clone https://github.com/loderunner/agent-skills.git
ln -s "$(pwd)/agent-skills/skills/go-conventions" ~/.claude/skills/go-conventions
```

Claude Code will automatically pick up skills placed under `~/.claude/skills/` (or a project's `.claude/skills/`) and invoke them when their description matches the task at hand.

## Adding a skill

Each skill lives in its own directory under `skills/` and contains a `SKILL.md` file with YAML frontmatter (`name`, `description`) followed by the skill's instructions. See the existing skills for examples.

## License

MIT
