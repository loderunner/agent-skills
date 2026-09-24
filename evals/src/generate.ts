import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { cp, mkdir, mkdtemp, readFile, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { ARMS, CLAUDE_MODEL, invocation, type Arm } from './arms.js';
import { loadCases, REPO_ROOT, RUNS_DIR, EVALS_ROOT, type LoadedCase } from './load.js';

/**
 * Runs both arms of every requested case and writes `runs/<id>/<arm>/<case>/rep-N/`.
 *
 * Generation is not part of vitest because `claude -p` takes 30-60s. Grading
 * what is on disk then costs seconds and no API spend, and is deterministic.
 */

const CONCURRENCY = 3;

const envFile = join(EVALS_ROOT, '.env');
if (existsSync(envFile)) {
  process.loadEnvFile(envFile);
}

interface Job {
  loaded: LoadedCase;
  arm: Arm;
  rep: number;
  dir: string;
}

async function run(job: Job): Promise<string | null> {
  const { loaded, arm, dir } = job;
  await mkdir(dir, { recursive: true });

  // A fresh temp directory OUTSIDE the repo: the model runs with
  // bypassPermissions. Copied into `runs/` afterwards.
  const workspace = await mkdtemp(join(tmpdir(), 'skill-eval-'));
  await cp(join(loaded.dir, 'seed'), workspace, { recursive: true }).catch(() => {});

  const prompt = await readFile(join(loaded.dir, 'prompt.md'), 'utf8');
  const { args, prompt: fullPrompt } = invocation(arm, prompt.trim(), REPO_ROOT);

  // The prompt goes over stdin, not argv: several claude options are variadic
  // and would swallow a trailing positional prompt.
  const child = spawn('claude', args, { cwd: workspace, env: process.env, stdio: ['pipe', 'pipe', 'pipe'] });
  child.stdin.end(fullPrompt, 'utf8');

  const stdout: Buffer[] = [];
  const stderr: Buffer[] = [];
  child.stdout.on('data', (chunk: Buffer) => stdout.push(chunk));
  child.stderr.on('data', (chunk: Buffer) => stderr.push(chunk));

  const code = await new Promise<number | null>((resolve, reject) => {
    child.on('error', reject);
    child.on('close', resolve);
  });

  const transcript = Buffer.concat(stdout).toString('utf8');
  const errors = Buffer.concat(stderr).toString('utf8');

  await writeFile(join(dir, 'transcript.jsonl'), transcript, 'utf8');
  await writeFile(
    join(dir, 'invocation.json'),
    `${JSON.stringify({ arm, args, prompt: fullPrompt, exitCode: code, model: CLAUDE_MODEL }, null, 2)}\n`,
    'utf8',
  );

  if (errors.trim() !== '') {
    await writeFile(join(dir, 'stderr.txt'), errors, 'utf8');
  }

  await cp(workspace, join(dir, 'workspace'), { recursive: true });
  await rm(workspace, { recursive: true, force: true });

  if (code === 0 && transcript.trim() !== '') {
    return null;
  }

  return `exit ${code ?? 'signal'}${errors.trim() === '' ? '' : `: ${errors.trim().split('\n')[0]}`}`;
}

async function pool<T>(jobs: T[], limit: number, worker: (job: T) => Promise<void>): Promise<void> {
  const queue = [...jobs];
  const runners = Array.from({ length: Math.min(limit, queue.length) }, async () => {
    for (let job = queue.shift(); job !== undefined; job = queue.shift()) {
      await worker(job);
    }
  });

  await Promise.all(runners);
}

const requested = process.argv.slice(2);
const cases = (await loadCases()).filter(
  (loaded) => requested.length === 0 || requested.includes(loaded.name),
);

if (cases.length === 0) {
  console.error(`no cases matched ${requested.join(', ')}`);
  process.exit(1);
}

if ((process.env.ANTHROPIC_API_KEY ?? '').trim() === '') {
  console.error('ANTHROPIC_API_KEY is unset, and `claude --bare` reads Anthropic auth only from it.');
  process.exit(1);
}

const id = new Date().toISOString().replace(/[:.]/g, '-');
const runDir = join(RUNS_DIR, id);

const jobs: Job[] = ARMS.flatMap((arm) =>
  cases.flatMap((loaded) => {
    const reps = Number(process.env.EVAL_REPS ?? loaded.definition.reps);

    return Array.from({ length: reps }, (_unused, index) => ({
      loaded,
      arm,
      rep: index + 1,
      dir: join(runDir, arm, loaded.name, `rep-${index + 1}`),
    }));
  }),
);

console.log(`run ${id}: ${jobs.length} invocations of ${CLAUDE_MODEL}`);

let done = 0;
const failures: string[] = [];

await pool(jobs, CONCURRENCY, async (job) => {
  const failure = await run(job);
  done += 1;

  const label = `${job.arm}/${job.loaded.name}/rep-${job.rep}`;
  console.log(`[${done}/${jobs.length}] ${failure === null ? 'ok  ' : 'FAIL'} ${label}${failure === null ? '' : ` — ${failure}`}`);

  if (failure !== null) {
    failures.push(`${label}: ${failure}`);
  }
});

await writeFile(
  join(runDir, 'meta.json'),
  `${JSON.stringify(
    {
      id,
      model: CLAUDE_MODEL,
      arms: ARMS,
      cases: cases.map((loaded) => ({ name: loaded.name, reps: loaded.definition.reps })),
      failures,
    },
    null,
    2,
  )}\n`,
  'utf8',
);

// `runs/latest` is what the eval grades.
const latest = join(RUNS_DIR, 'latest');
await rm(latest, { force: true }).catch(() => {});
await symlink(id, latest, 'dir');

console.log(`\nwrote ${runDir}\nruns/latest -> ${id}`);

if (failures.length > 0) {
  console.error(`\n${failures.length} invocation(s) failed:`);
  for (const failure of failures) {
    console.error(`  ${failure}`);
  }

  process.exit(1);
}
