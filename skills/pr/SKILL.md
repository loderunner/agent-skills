---
name: pr
description: Manages GitHub PRs for the current branch. Use for creating new PRs
  (/pr create) or updating existing PRs after new commits (/pr update).
---

# PR Skill

Two sub-commands: `create`, `update`. Identify which the user wants from their message.

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
6. If the branch is behind, sync it — prefer rebase to keep history linear:
   - `git rebase origin/<base-branch>`
   - If rebase fails due to conflicts, see **Conflict handling** below
   - If rebase would be clearly wrong (e.g. merge commits on the branch), fall back to `git merge origin/<base-branch>`
7. Push: `git push` (use `git push --force-with-lease` if a rebase was performed)
8. Get base commit: `git merge-base HEAD origin/<base-branch>`
9. Analyze scope: `git log <base-commit>...HEAD --oneline` + `git diff <base-commit>...HEAD --stat`
10. Fetch current PR title and body: `gh pr view --json title,body`
11. Draft updated title + body
    - If the new commits don't make the intent clear or the update scope is ambiguous, ask the user before drafting — use a dedicated user-input tool if one is available in your runtime (e.g. `AskUserQuestion`, `human_input`, `interrupt`), otherwise pause and ask directly in your response
12. Apply: `gh pr edit --title "..." --body "$(cat <<'EOF'\n...\nEOF\n)"`

### Conflict handling

When a rebase or merge produces conflicts:

1. Run `git diff --name-only --diff-filter=U` to list conflicted files
2. For each conflicted file, read the conflict markers to understand what both sides changed
3. Classify the conflict:
   - **Trivial**: one side deleted a line the other edited, whitespace, auto-generated content, import ordering — resolve automatically and continue
   - **Non-trivial**: overlapping logic changes, semantic ambiguity, anything where the correct resolution requires understanding intent — **stop immediately**
4. For trivial conflicts: resolve, stage the file, continue the rebase/merge, then provide a clear summary:
   - Which files had conflicts
   - What each conflict was (one sentence per file: what the base changed vs. what the branch changed)
   - How it was resolved and why
5. For non-trivial conflicts: abort the rebase/merge (`git rebase --abort` or `git merge --abort`), restore the branch to its pre-sync state, and present the user with:
   - Which file(s) are conflicted
   - What the base branch changed in that area
   - What the PR branch changed in that area
   - What the ambiguity is
   - Ask the user to either explain how to resolve or resolve manually, then re-run `/pr update` — use a built-in question tool, such as the `AskUserQuestion` tool, if available

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
