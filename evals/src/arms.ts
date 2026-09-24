/** The controlled variable: the two arms differ only by the skill. */
export const ARMS = ['with-skill', 'baseline'] as const;

export type Arm = (typeof ARMS)[number];

/** Pinned so a model change cannot masquerade as a skill regression. */
export const CLAUDE_MODEL = 'claude-sonnet-5';

/** The skill under test, force-loaded by slash command in the with-skill arm. */
export const SKILL_COMMAND = '/agent-skills:go-conventions';

export interface ArmInvocation {
  args: string[];
  prompt: string;
}

/**
 * Build one `claude -p` invocation.
 *
 * `--bare` strips hooks, LSP, auto-memory and CLAUDE.md discovery while still
 * resolving skills, so the only difference between the arms is the skill. It
 * caps the tool set to Bash, Edit and Read — there is no `Write`, so prompts
 * must not assume one — and reads Anthropic auth only from `ANTHROPIC_API_KEY`.
 *
 * The skill is force-loaded rather than left to auto-trigger: otherwise a
 * failure is ambiguous between "the description didn't fire" and "it fired and
 * was ignored".
 */
export function invocation(arm: Arm, prompt: string, repoRoot: string): ArmInvocation {
  const args = [
    '--bare',
    '-p',
    '--setting-sources',
    '',
    '--strict-mcp-config',
    '--output-format',
    'stream-json',
    '--verbose',
    '--no-session-persistence',
    '--permission-mode',
    'bypassPermissions',
    '--model',
    CLAUDE_MODEL,
  ];

  if (arm === 'baseline') {
    return { args, prompt };
  }

  args.push('--plugin-dir', repoRoot);

  return { args, prompt: `${SKILL_COMMAND}\n\n${prompt}` };
}
