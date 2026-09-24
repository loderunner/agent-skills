import type { ChoiceQuestion } from '@typesafe-ai/sdk';
import { enumerate, type ParsedFile, type Unit } from './checkers/ast.js';
import type { Ask } from './checkers/jev.js';
import type { ToolCall } from './checkers/transcript.js';

/**
 * `uncertain` is neither pass nor fail: the criteria do not cover the input,
 * which is a bug in the question rather than a verdict about the code.
 */
export type Verdict = 'pass' | 'fail' | 'uncertain';

export interface Ruling {
  verdict: Verdict;
  /** Why, printed in the failure message. */
  detail: string;
  /** The probability distribution behind a Jev answer. */
  distribution?: Readonly<Record<string, number>>;
}

export interface Judgment extends Ruling {
  check: string;
  file: string;
  /** 1-based, so `file:line` is clickable. */
  line: number;
}

/** What a check is given: the parsed source files, plus the tool-call log. */
export interface Input {
  files: readonly ParsedFile[];
  transcript: readonly ToolCall[] | null;
  ask: Ask;
}

export type Check = (input: Input) => Promise<Judgment[]>;

export interface CaseDefinition {
  /** The claim under test, quoted from the skill. */
  claim: string;
  /** Where the claim lives, as `path#Lstart-Lend`. */
  source: string;
  /** Repetitions per arm, so a pass rate has some variance behind it. */
  reps: number;
  checks: Check[];
}

export function defineCase(definition: CaseDefinition): CaseDefinition {
  return definition;
}

/**
 * Classify every unit a query finds, with a parser.
 *
 * `undefined` means the unit is outside the claim, so it is not counted.
 */
export function astCheck(
  name: string,
  query: string,
  classify: (unit: Unit) => Ruling | undefined,
): Check {
  return async ({ files }) => {
    const units = await enumerate(files, query);

    return units.flatMap((unit) => {
      const ruling = classify(unit);

      return ruling === undefined ? [] : [{ check: name, file: unit.file, line: unit.line, ...ruling }];
    });
  };
}

export interface JevSpec {
  /** Settle syntactically whatever a parser can settle; Jev sees the rest. */
  prefilter?: (unit: Unit) => Ruling | undefined;
  /** The single unit under judgment — a few lines, never a file or a repo. */
  state: (unit: Unit) => Record<string, string>;
  question: ChoiceQuestion;
  /** Labels that satisfy the claim. Anything outside `pass`/`fail` is uncertain. */
  pass: readonly string[];
  fail: readonly string[];
}

/**
 * Enumerate units with a query, then ask Jev about one unit at a time.
 *
 * The split is what keeps every Jev question atomic; tallies and thresholds are
 * never asked of Jev, only computed from the judgments it returns.
 */
export function jevCheck(name: string, query: string, spec: JevSpec): Check {
  return async ({ files, ask }) => {
    const units = await enumerate(files, query);
    const judgments: Judgment[] = [];
    const pending: Unit[] = [];

    for (const unit of units) {
      const settled = spec.prefilter?.(unit);

      if (settled === undefined) {
        pending.push(unit);
      } else {
        judgments.push({ check: name, file: unit.file, line: unit.line, ...settled });
      }
    }

    const asked = await Promise.all(
      pending.map(async (unit) => ({
        unit,
        ruling: await ask(spec.state(unit), spec.question, spec.pass, spec.fail),
      })),
    );

    return [
      ...judgments,
      ...asked.map(({ unit, ruling }) => ({
        check: name,
        file: unit.file,
        line: unit.line,
        ...ruling,
      })),
    ];
  };
}

/** Classify the tool-call log rather than the generated files. */
export function transcriptCheck(
  name: string,
  classify: (transcript: readonly ToolCall[]) => Omit<Judgment, 'check'>[],
): Check {
  return async ({ transcript }) => {
    if (transcript === null) {
      return [
        {
          check: name,
          file: 'transcript.jsonl',
          line: 1,
          verdict: 'uncertain',
          detail: 'this check needs a transcript, and the artifact has none',
        },
      ];
    }

    return classify(transcript).map((ruling) => ({ check: name, ...ruling }));
  };
}
