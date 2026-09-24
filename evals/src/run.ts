import type { CaseDefinition, Judgment } from './case.js';
import { EXTENSION, parseFile, type ParsedFile } from './checkers/ast.js';
import { classify, type Ask } from './checkers/jev.js';
import type { ToolCall } from './checkers/transcript.js';

export interface SourceFile {
  path: string;
  source: string;
}

export interface Artifact {
  /** Printed in failure messages, e.g. `with-skill/rep-2`. */
  label: string;
  /** Every file the run produced; only the parsable ones are graded. */
  files: readonly SourceFile[];
  transcript: readonly ToolCall[] | null;
}

/**
 * `skip` — nothing applicable was produced, so the claim has nothing to say.
 * `error` — the grader could not decide, or the input was malformed.
 *
 * Neither is a pass: counting vacuous truth as a pass rewards a skill that
 * makes Claude write *less* code.
 */
export type Outcome = 'pass' | 'fail' | 'skip' | 'error';

export interface CaseResult {
  outcome: Outcome;
  judgments: Judgment[];
  /** Files whose syntax tree contains an ERROR node. */
  parseErrors: string[];
  reason?: string;
}

export async function runCase(
  definition: CaseDefinition,
  artifact: Artifact,
  ask: Ask = classify,
): Promise<CaseResult> {
  const files: ParsedFile[] = [];
  const parseErrors: string[] = [];

  for (const file of artifact.files) {
    if (!file.path.endsWith(EXTENSION)) {
      continue;
    }

    const parsed = await parseFile(file.path, file.source);
    if (parsed.hasError) {
      parseErrors.push(file.path);
    }

    files.push(parsed);
  }

  const input = { files, transcript: artifact.transcript, ask };
  const judgments = (
    await Promise.all(definition.checks.map((check) => check(input)))
  ).flat();

  if (judgments.length === 0) {
    return { outcome: 'skip', judgments, parseErrors, reason: 'nothing the claim covers' };
  }

  // A real violation in intact code is real even if another file is malformed.
  if (judgments.some((judgment) => judgment.verdict === 'fail')) {
    return { outcome: 'fail', judgments, parseErrors };
  }

  const uncertain = judgments.filter((judgment) => judgment.verdict === 'uncertain');
  if (uncertain.length > 0) {
    return {
      outcome: 'error',
      judgments,
      parseErrors,
      reason: `${uncertain.length} unit(s) could not be classified`,
    };
  }

  if (parseErrors.length > 0) {
    return {
      outcome: 'error',
      judgments,
      parseErrors,
      reason: `syntax error in ${parseErrors.join(', ')}`,
    };
  }

  return { outcome: 'pass', judgments, parseErrors };
}

export function describeResult(result: CaseResult, artifact: Artifact): string {
  const lines = [`${artifact.label}: ${result.outcome}`];

  if (result.reason !== undefined) {
    lines.push(`  ${result.reason}`);
  }

  for (const judgment of result.judgments) {
    if (judgment.verdict === 'pass') {
      continue;
    }

    lines.push(
      `  ${judgment.file}:${judgment.line} (${judgment.check}) — ${judgment.detail}`,
    );
  }

  return lines.join('\n');
}
