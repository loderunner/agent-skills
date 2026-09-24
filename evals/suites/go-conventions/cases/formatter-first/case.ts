import { defineCase, transcriptCheck } from '../../../../src/case.js';
import { isGoFormatter, isShellWriteToGo } from '../../../../src/checkers/go-shell.js';
import { bashCommand, editedPath } from '../../../../src/checkers/transcript.js';

/**
 * Narrowings, and why:
 *
 * - This is a claim about process, not output. Checking the resulting file for
 *   correct formatting would sit near 100% in both arms and prove nothing, so
 *   the verdict comes from the tool-call log.
 * - A write to a `.go` file through a shell redirect, `tee` or `sed -i` counts
 *   as a manual edit: `--bare` removes the `Write` tool.
 */
export default defineCase({
  claim:
    'When fixing formatting issues in Go files, run the formatter first, before attempting manual edits.',
  source: 'skills/go-conventions/SKILL.md#L11-L30',
  reps: 3,
  checks: [
    transcriptCheck('formatter-before-first-edit', (transcript) => {
      let formatterAt: number | undefined;
      let editAt: number | undefined;
      let editDescription = '';

      transcript.forEach((call, index) => {
        const command = bashCommand(call);

        if (command !== undefined && isGoFormatter(command) && formatterAt === undefined) {
          formatterAt = index;
        }

        if (editAt !== undefined) {
          return;
        }

        const path = editedPath(call);
        if (path !== undefined && path.endsWith('.go')) {
          editAt = index;
          editDescription = `${call.name} ${path}`;

          return;
        }

        if (command !== undefined && isShellWriteToGo(command)) {
          editAt = index;
          editDescription = `Bash ${JSON.stringify(command.split('\n')[0])}`;
        }
      });

      // Nothing relevant happened, so the claim has nothing to say. Counting
      // that as a pass would reward a run that did no work.
      if (formatterAt === undefined && editAt === undefined) {
        return [];
      }

      if (editAt === undefined) {
        return [
          {
            file: 'transcript.jsonl',
            line: (formatterAt ?? 0) + 1,
            verdict: 'pass',
            detail: 'the formatter ran and no `.go` file was edited by hand',
          },
        ];
      }

      if (formatterAt === undefined) {
        return [
          {
            file: 'transcript.jsonl',
            line: editAt + 1,
            verdict: 'fail',
            detail: `edited a \`.go\` file (${editDescription}) and never ran a formatter`,
          },
        ];
      }

      return [
        {
          file: 'transcript.jsonl',
          line: Math.min(formatterAt, editAt) + 1,
          verdict: formatterAt < editAt ? 'pass' : 'fail',
          detail:
            formatterAt < editAt
              ? `formatter at call ${formatterAt + 1}, first manual edit at call ${editAt + 1}`
              : `first manual edit (${editDescription}) at call ${editAt + 1}, formatter only at call ${formatterAt + 1}`,
        },
      ];
    }),
  ],
});
