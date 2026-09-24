import { TypeSafeClient, type ChoiceQuestion } from '@typesafe-ai/sdk';
import type { Ruling } from '../case.js';

/** Pinned, not `jev-latest`, so a model repoint cannot read as a skill regression. */
export const JEV_MODEL = process.env.JEV_MODEL ?? 'jev-1.13.0';

/** Jev cannot abstain, so every question carries an explicit escape label. */
export const OTHER = 'other';

/** Classifies one unit. Injected so tests can run without spending Jev budget. */
export type Ask = (
  state: Record<string, string>,
  question: ChoiceQuestion,
  pass: readonly string[],
  fail: readonly string[],
) => Promise<Ruling>;

let client: TypeSafeClient | undefined;

/** True when a `TYPESAFE_API_KEY` is present, so Jev-graded cases can run. */
export function jevConfigured(): boolean {
  const key = process.env.TYPESAFE_API_KEY;

  return typeof key === 'string' && key.trim() !== '';
}

/**
 * Classify one unit. The state is a few lines, never a file, because Jev
 * degrades on irrelevant context.
 */
export const classify: Ask = async (state, question, pass, fail) => {
  client ??= new TypeSafeClient({ defaultModel: JEV_MODEL });

  const { answers } = await client.systemOne({ state, questions: { verdict: question } });
  const { choice, probabilities } = answers.verdict;
  const probability = probabilities[choice] ?? 0;

  if (probability < 0.5) {
    return {
      verdict: 'uncertain',
      detail: `split verdict: "${choice}" won with only p=${probability.toFixed(2)}`,
      distribution: probabilities,
    };
  }

  if (pass.includes(choice)) {
    return { verdict: 'pass', detail: `classified "${choice}"`, distribution: probabilities };
  }

  if (fail.includes(choice)) {
    return { verdict: 'fail', detail: `classified "${choice}"`, distribution: probabilities };
  }

  return {
    verdict: 'uncertain',
    detail: `"${choice}" is outside the pass/fail labels`,
    distribution: probabilities,
  };
};
