import { readdir, readFile } from 'node:fs/promises';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { CaseDefinition } from './case.js';
import { parseTranscript } from './checkers/transcript.js';
import type { Artifact, SourceFile } from './run.js';

export const EVALS_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const REPO_ROOT = resolve(EVALS_ROOT, '..');
export const SUITES_DIR = join(EVALS_ROOT, 'suites');
export const RUNS_DIR = join(EVALS_ROOT, 'runs');

export interface LoadedCase {
  suite: string;
  name: string;
  dir: string;
  definition: CaseDefinition;
}

async function subdirectories(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true }).catch(() => []);

  return entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name);
}

/** Every `suites/<suite>/cases/<case>/case.ts`. Adding a case is adding a folder. */
export async function loadCases(): Promise<LoadedCase[]> {
  const loaded: LoadedCase[] = [];

  for (const suite of await subdirectories(SUITES_DIR)) {
    for (const name of await subdirectories(join(SUITES_DIR, suite, 'cases'))) {
      const dir = join(SUITES_DIR, suite, 'cases', name);
      const module = (await import(join(dir, 'case.ts'))) as { default: CaseDefinition };

      loaded.push({ suite, name, dir, definition: module.default });
    }
  }

  return loaded.sort((a, b) => `${a.suite}/${a.name}`.localeCompare(`${b.suite}/${b.name}`));
}

/**
 * A fixture is a single file with a known verdict: a source file, or a `.jsonl`
 * transcript graded by a transcript check.
 */
export async function loadFixtures(
  caseDir: string,
  expected: 'pass' | 'fail',
): Promise<Artifact[]> {
  const dir = join(caseDir, 'fixtures', expected);
  const entries = await readdir(dir).catch(() => []);

  return Promise.all(
    entries.sort().map(async (entry) => {
      const raw = await readFile(join(dir, entry), 'utf8');
      const label = `fixtures/${expected}/${entry}`;

      return entry.endsWith('.jsonl')
        ? { label, files: [], transcript: parseTranscript(raw) }
        : { label, files: [{ path: label, source: raw }], transcript: null };
    }),
  );
}

/** Directories a generated run has no business being graded on. */
const SKIP_DIRS = new Set(['.git', 'node_modules', 'vendor']);

/** Every file under a generated run's workspace, plus its transcript. */
export async function loadRunArtifact(dir: string, label: string): Promise<Artifact> {
  const workspace = join(dir, 'workspace');
  const files: SourceFile[] = [];

  const walk = async (current: string): Promise<void> => {
    const entries = await readdir(current, { withFileTypes: true }).catch(() => []);

    for (const entry of entries) {
      const path = join(current, entry.name);

      if (entry.isDirectory()) {
        if (!SKIP_DIRS.has(entry.name)) {
          await walk(path);
        }
      } else if (entry.isFile()) {
        files.push({ path: relative(workspace, path), source: await readFile(path, 'utf8') });
      }
    }
  };

  await walk(workspace);

  const raw = await readFile(join(dir, 'transcript.jsonl'), 'utf8').catch(() => null);

  return {
    label,
    files: files.sort((a, b) => a.path.localeCompare(b.path)),
    transcript: raw === null ? null : parseTranscript(raw),
  };
}
