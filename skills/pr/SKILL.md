---
name: pr
description: Manages GitHub PRs for the current branch. Use for creating new PRs
  (/pr create), updating existing PRs after new commits (/pr update), or
  babysitting a PR (/pr babysit) — watching its CI runs and review comments,
  fixing issues as they appear, and merging when everything is green. Trigger on
  "babysit the PR", "watch the PR", "monitor CI", "address review comments", or
  "merge when green".
---

# PR Skill

Three sub-commands: `create`, `update`, `babysit`. Identify which the user wants from their message.

---

## `/pr create`

Create a new pull request for the current branch.

### Steps

1. Check for uncommitted changes: `git status --porcelain`
   - If any exist (staged or unstaged), commit them before proceeding:
     - Derive a commit message from the diff (`git diff HEAD`); if the intent isn't clear from the diff alone, ask the user — use a dedicated user-input tool if one is available in your runtime (e.g. `AskUserQuestion`, `human_input`, `interrupt`), otherwise pause and ask directly in your response
     - `git add -A` then `git commit -m "..."`
2. Check if the local repo is on the default branch:
   - Get the default branch: `git remote show origin | grep 'HEAD branch' | awk '{print $NF}'`
   - Get the current branch: `git branch --show-current`
   - If they match, create a new branch before proceeding:
     - Derive a branch name from the committed changes or ask the user
     - `git checkout -b <branch-name>`
     - `git push -u origin <branch-name>`
3. Detect the base branch:
   - Try `gh pr view --json baseRefName --jq '.baseRefName'` (works if a draft PR exists)
   - Fallback: `git remote show origin | grep 'HEAD branch' | awk '{print $NF}'`
   - Final fallback: `origin/main`
4. Get the base commit: `git merge-base HEAD <base-branch>`
5. Analyze scope:
   - `git log <base-commit>...HEAD --oneline`
   - `git diff <base-commit>...HEAD --stat`
6. Check the repo's commit style for tone/format reference: `git log <base-branch> -10 --oneline`
7. Determine PR complexity using the signals below
8. Draft a PR title and body using the guidelines below
   - If context is incomplete or cannot be inferred from the repo state (e.g. the purpose of the change is unclear, commit messages are uninformative, or the scope is ambiguous), ask the user for clarification before drafting — use a dedicated user-input tool if one is available in your runtime (e.g. `AskUserQuestion`, `human_input`, `interrupt`), otherwise pause and ask directly in your response
9. Create with: `gh pr create --title "..." --body "$(cat <<'EOF'\n...\nEOF\n)"`
10. Open the PR in the browser: `gh pr view --web`

---

## `/pr update`

Update an existing open PR on the current branch — sync with the target branch, push new commits, and refresh the description.

### Steps

1. Verify a PR exists: `gh pr view` (exit with a clear message if none)
2. Check for uncommitted changes: `git status --porcelain`
   - If any exist (staged or unstaged), commit them before proceeding:
     - Derive a commit message from the diff (`git diff HEAD`); if the intent isn't clear from the diff alone, ask the user — use a dedicated user-input tool if one is available in your runtime (e.g. `AskUserQuestion`, `human_input`, `interrupt`), otherwise pause and ask directly in your response
     - `git add -A` then `git commit -m "..."`
3. Get the PR's base branch: `gh pr view --json baseRefName --jq '.baseRefName'`
4. Fetch the latest remote state: `git fetch origin`
5. Check how the branch relates to the base:
   - Commits behind: `git rev-list --count HEAD..origin/<base-branch>`
   - Commits ahead: `git rev-list --count origin/<base-branch>..HEAD`
6. If the branch is behind, check whether the base's history was erased (see **Rebuild a lost base** below), then sync it — prefer rebase to keep history linear:
   - Normal case: `git rebase origin/<base-branch>`
   - If the base's history was erased: `git rebase --onto origin/<base-branch> <old-base-tip>`, with `<old-base-tip>` found as described in **Rebuild a lost base**
   - If rebase fails due to conflicts, see **Conflict handling** below
   - If rebase would be clearly wrong (e.g. merge commits on the branch), fall back to `git merge origin/<base-branch>`
7. Push: `git push` (use `git push --force-with-lease` if a rebase was performed)
8. Get base commit: `git merge-base HEAD origin/<base-branch>`
9. Analyze scope: `git log <base-commit>...HEAD --oneline` + `git diff <base-commit>...HEAD --stat`
10. Fetch current PR title and body: `gh pr view --json title,body`
11. Draft updated title + body
    - If the new commits don't make the intent clear or the update scope is ambiguous, ask the user before drafting — use a dedicated user-input tool if one is available in your runtime (e.g. `AskUserQuestion`, `human_input`, `interrupt`), otherwise pause and ask directly in your response
12. Apply: `gh pr edit --title "..." --body "$(cat <<'EOF'\n...\nEOF\n)"`

### Rebuild a lost base

A PR that targeted another branch (the "old base", e.g. the previous PR in a stack) can lose the history it was built on. This happens when the old base was squash-merged or rebase-merged, force-pushed, or deleted, and the PR was then retargeted (often to the trunk, but any branch will do). A plain `git rebase origin/<base-branch>` then fails in a misleading way: the merge-base falls before the old base's commits, so git replays them as if they were this branch's own and conflicts with the squashed copy of the same changes. Those conflicts say nothing about the PR's real changes. The fix is to replay only the PR's own commits, which needs the commit where the branch forked from the old base (`<old-base-tip>`). That commit is still recoverable from git and GitHub.

Check for this before rebasing. Any one of these is a signal:

- The PR was retargeted. List the retargets with `gh api graphql -F owner='{owner}' -F name='{repo}' -F number=<pr-number> -f query='query($owner:String!,$name:String!,$number:Int!){repository(owner:$owner,name:$name){pullRequest(number:$number){timelineItems(itemTypes:[BASE_REF_CHANGED_EVENT],first:20){nodes{... on BaseRefChangedEvent{previousRefName currentRefName createdAt}}}}}}'`. `previousRefName` is the old base.
- `git rev-list --count origin/<base-branch>..HEAD` is much larger than the number of commits the PR is meant to hold, or `git log origin/<base-branch>..HEAD` shows commits that belong to another PR.
- A rebase onto the base conflicted in files the PR's own commits never touched.

When there is a signal, find `<old-base-tip>`: the newest commit of the old base that this branch contains. Try these in order, and stop at the first one that gives a commit that is an ancestor of `HEAD`:

1. **The old base's PR head.** Find the PR that merged the old base: `gh pr list --state merged --head <previousRefName> --json number,title,headRefOid,mergeCommit` (the squash commit's message usually ends in `(#<number>)` too). GitHub keeps `refs/pull/<number>/head` after the branch is deleted, so `git fetch origin pull/<number>/head` and `git merge-base HEAD FETCH_HEAD` gives the fork point. This fails only if the old base was force-pushed after this branch forked from it.
2. **The old base ref itself.** If `origin/<previousRefName>` still exists, `git merge-base HEAD origin/<previousRefName>`. If only a local copy or reflog is left, `git merge-base --fork-point <ref> HEAD`.
3. **Subtract the old PR's commits.** List its commits with `gh pr view <number> --json commits --jq '.commits[].oid'` and compare with `git rev-list origin/<base-branch>..HEAD`. The commits on the branch that are not in the old PR are its own. The parent of the oldest one is `<old-base-tip>`. This survives a force-push of the old base as long as the SHAs the branch was built on are still listed.
4. **The branch's reflog.** `git reflog show <branch>` often records the commit before the last fetch or rebase, and the old base's commits appear in the history around it.
5. **Match by content.** Compare commit subjects and `git patch-id` between the branch and the old PR's commits to tell which are foreign. Treat this as a last resort and double-check the result.

Then rebase with `git rebase --onto origin/<base-branch> <old-base-tip>`. Keep `<old-base-tip>` as a SHA, since the branch it came from may be gone. Before pushing, check that the result is what you meant to build:

- `git log --oneline origin/<base-branch>..HEAD` lists only the PR's own commits
- `git diff --stat origin/<base-branch>...HEAD` touches only files the PR is meant to change
- `git range-diff <old-base-tip>..ORIG_HEAD origin/<base-branch>..HEAD` shows the PR's patches unchanged, apart from context

If every strategy fails, stop and ask, and list what you tried and what you found, so the user doesn't have to redo the search.

### Conflict handling

When a rebase or merge produces conflicts:

1. Run `git diff --name-only --diff-filter=U` to list conflicted files
2. If you haven't yet checked whether the base's history was erased, do so now: abort the sync, follow **Rebuild a lost base**, and redo the rebase with `--onto`. Conflicts caused by foreign commits are not real conflicts, and classifying them below wastes the user's time.
3. For each conflicted file, read the conflict markers to understand what both sides changed
4. Classify the conflict:
   - **Trivial**: one side deleted a line the other edited, whitespace, auto-generated content, import ordering — resolve automatically and continue
   - **Needs history**: overlapping changes where the intent isn't clear from the markers alone — go to **Resolve from the old base's history** before deciding
   - **Non-trivial**: overlapping logic changes that remain ambiguous after reading the history — **stop**
5. For trivial conflicts: resolve, stage the file, continue the rebase/merge, then provide a clear summary:
   - Which files had conflicts
   - What each conflict was (one sentence per file: what the base changed vs. what the branch changed)
   - How it was resolved and why
6. For non-trivial conflicts: abort the rebase/merge (`git rebase --abort` or `git merge --abort`), restore the branch to its pre-sync state, and present the user with:
   - Which file(s) are conflicted
   - What the base branch changed in that area
   - What the PR branch changed in that area
   - What you learned from the history and why it still leaves the ambiguity
   - What the ambiguity is
   - Ask the user to either explain how to resolve or resolve manually, then re-run `/pr update` — use a built-in question tool, such as the `AskUserQuestion` tool, if available

### Resolve from the old base's history

Even with the right `--onto`, the branch can conflict with what happened to the old base after the branch forked from it (for example, a later commit on the old base renamed a function the branch calls). The reason for the base's change usually still exists in history, so look for it before giving up. The conflict markers alone show only the endpoints:

- Show the common ancestor in the markers: `git checkout --conflict=zdiff3 -- <file>` (or set `git config merge.conflictStyle zdiff3` before the rebase). During a rebase, the `HEAD` side is the new base, which includes the old base's final state, and the other side is the PR commit being replayed. Don't mix them up.
- Read what the old base changed in that area after the fork: `git log -p <old-base-tip>..<old-base-head> -- <file>`, where `<old-base-head>` is `FETCH_HEAD` from strategy 1, or the squash commit if that is all there is. Read what else landed on the base branch since: `git log -p <old-base-tip>..origin/<base-branch> -- <file>`. The commit messages say why.
- If the commits don't explain it, read the old PR's description and review threads: `gh pr view <number> --json title,body,comments,reviews`.
- Decide from the intent of both sides. Usually one of these holds: the base renamed, moved or reshaped something the branch uses, so apply the branch's change to the new shape; the base already made the same change, so drop the branch's hunk; the base removed what the branch edited, so check whether the edit still has a purpose and drop it if not. Resolve, stage the file, continue, and run the sanity checks from **Rebuild a lost base**.
- If both intents are clear but incompatible (a real design decision), or the history doesn't explain the base's change, treat it as non-trivial and stop. Include the old base's post-fork commits (SHA and subject) in your message to the user.

In the summary, name each conflict resolved this way, and cite the old base's commit that justified the resolution so the user can check it. Also report which old base you found, how, and the `<old-base-tip>` you passed to `--onto`.

---

## `/pr babysit`

Watch the open PR on the current branch: monitor CI and review comments, fix issues as they appear, and merge once everything is green.

### Setup

1. Verify an open PR exists: `gh pr view --json number,state,isDraft,baseRefName,headRefName`
   - Stop with a clear message if there is none or it is already merged or closed
   - If it is a draft, stop and ask the user — merging requires marking it ready
2. If there are uncommitted changes or unpushed commits, run the `/pr update` steps first so CI sees the real branch state

### Each cycle: read state, then act

Read the state with:
- `gh pr checks`
- `gh pr view --json mergeable,mergeStateStatus,reviewDecision,statusCheckRollup`
- Unresolved review threads: `gh api graphql` on `reviewThreads`, selecting `isResolved` and `isOutdated`
- New PR-level comments and reviews since the last cycle — bots often post as plain comments, not threads

Handle what you find in this order:

- **Failing check:** read the failed logs (`gh run view <id> --log-failed`) and diagnose.
  - If the branch caused it, fix it.
  - If it looks flaky or like infrastructure, rerun the failed jobs once: `gh run rerun <id> --failed`.
  - If the same check fails again after a fix or a rerun, or the cause is unclear, stop and ask. Looping on a red check burns time and hides the real problem.
- **Out of date or conflicting with the base:** sync with the `/pr update` steps and **Conflict handling**. Non-trivial conflicts stop the babysit.
- **Review comment:** classify each one.
  - *Clear and actionable:* make the fix.
  - *Irrelevant, doesn't apply, already handled, or an accepted trade-off:* reply in the thread saying why. Make no code change.
  - *Bigger* (a design change, a scope question, an ambiguous request, or disagreement with a human reviewer): pause and ask the user, with the comment, your reading of it, and what you would propose.

Batch the fixes from one cycle into one commit and one push, so CI runs once. After pushing, reply on each fixed thread (naming the commit) and resolve it. Resolve a thread you answered without a code change only when the reviewer was a bot or accepted your reply. A human's open disagreement is the "ask" case.

### Waiting

- While checks are running, block with `gh pr checks --watch` (or the runtime's wait or monitor primitive) instead of busy-looping.
- When checks are green but reviews are pending, poll every few minutes with whatever scheduling or wait mechanism the runtime offers (a loop, schedule or monitor tool if available, otherwise `sleep`).
- Don't merge the moment checks turn green. Review bots usually comment after CI finishes, so require a settle period (no new comments or threads for about two polls) before treating the PR as done.

### Merge gate

Merge only when all of these hold:

- Every check has passed (skipped is fine; none pending or failing)
- Zero unresolved review threads
- `mergeStateStatus` is `CLEAN`, or `BLOCKED` only because `reviewDecision` is `REVIEW_REQUIRED` (see below), and `reviewDecision` is not `CHANGES_REQUESTED`
- The settle period has elapsed with nothing new

Then run `gh pr merge` with the merge method flag (`--squash`, `--merge` or `--rebase`) that the user's or repo's instructions call for (`CLAUDE.md`, `AGENTS.md`, `CONTRIBUTING`, repo settings). If none is stated, ask once rather than guessing — non-interactive `gh pr merge` requires a method flag.

`REVIEW_REQUIRED` does not hold the merge back. Attempt the merge anyway: the user may be allowed to merge without an approval (a bypass actor, or a ruleset that doesn't require one), and GitHub is the one that knows. Treating it as a blocker would stop the babysit for a PR that could have been merged. Only a `CHANGES_REQUESTED` review decision, which is an explicit objection, stops the attempt.

Never use `--admin` or otherwise bypass branch protection yourself. If GitHub rejects the merge for a missing approval, report who or what the PR is waiting on and keep waiting, retrying the merge on later polls. Don't delete the branch or switch branches afterwards unless asked.

### Stop and report instead of continuing

- A bigger comment, a repeated or unclear failure, or a non-trivial conflict (ask the user)
- The PR was closed or merged by someone else
- No progress for a long stretch (about 2 hours): report the current state and what it is waiting on

When the babysit ends, whether merged or paused, give a short summary: what failed and how it was fixed, which comments were fixed or answered, what is still open, and the merge commit if merged.

---

## PR Body Guidelines

**Always lead with the _why_** — the reason the PR exists, the problem it solves, or the goal it achieves. Never open with what the code does or how it is structured.

**Do not wrap lines.** GitHub Markdown renders newlines as line breaks, unlike standard Markdown renderers. Write each paragraph as a single unbroken line, and separate paragraphs with a blank line.

**Follow the PR template.** If the repo has a PR template (from the repo root, `.github/PULL_REQUEST_TEMPLATE.md` or `.github/PULL_REQUEST_TEMPLATE/*.md`), read it and use it as the body structure. Fill in every section; remove placeholder text but keep section headers.

### Determine complexity

Count these signals — err toward simpler when in doubt:

- Number of files changed
- Number of distinct concerns touched
- Whether the change involves non-obvious design decisions

Mechanical changes (renames, formatting, dependency bumps) are **simple** even if they touch many files.

### Simple PR

One sentence to one short paragraph. No sections.

```
Fixes the crash that occurred when users submitted the frobnication form with an empty widget field. The validator was not handling the null case introduced in the previous refactor.
```

### Medium PR

A few paragraphs. Lead with the goal, add detail as needed. One optional section at the end if there is a specific detail worth diving into. End with a **Review order** line listing files in the order a reviewer should read them.

```
Users were unable to reticulate splines on mobile because the reticulation engine assumed a pointer device. This PR adds touch event support so the flow works on any device.

The spline model itself is unchanged — only the input handling layer was updated, so the existing reticulation tests still cover the core logic.

## Persistence

Partially reticulated splines are now saved to localStorage so progress survives an accidental tab close. The schema is versioned; old entries are silently discarded on mismatch.

## Recommended review order

- `input/touch.ts`
- `input/pointer.ts`
- `spline/model.ts`
- `spline/model.test.ts`
```

### Large PR

Sections throughout. Open with the product goal or user-facing effect. Follow with design and architecture. Add a focused subsection only if there is a particularly tricky piece of code worth explaining. End with a **Review order** section — if the file count is large, group files by logical concern rather than listing each individually.

```
Replaces the hand-rolled quux serializer with the industry-standard Quux Protocol v3, cutting serialization time by ~60% and eliminating a class of corruption bugs that appeared only under high concurrency.

## Design

All quux values now go through a single `QuuxCodec` instance. The codec is stateless and safe to share across goroutines. Legacy `LegacyQuuxWriter` is kept behind a feature flag for the rollout period and will be removed in the next release.

## Varint encoding edge case

Quux Protocol v3 uses variable-length integers for field lengths. Values above 2^28 require a five-byte encoding that the reference implementation documents poorly. The `encodeLength` function includes a comment with the relevant spec errata.

## Recommended review order

1. **Codec core**: `codec/quux.go`, `codec/varint.go`
2. **Integration points**: `server/handler.go`, `client/sender.go`
3. **Feature flag + migration**: `config/flags.go`, `migration/legacy.go`
4. **Tests**: `codec/quux_test.go`, `server/handler_test.go`
```
