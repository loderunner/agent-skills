---
name: pair-review
description: "Walk the user through a pull request one stop at a time, so they review it at their own pace and understand it before approving. Use whenever someone asks to be walked through a PR, to review a PR together or step by step, to pair on a review, to understand a colleague's PR before approving it, or to go through their own PR before merging. Each response covers one small piece of the diff in the order it is best understood (not file order), says what changed and what deserves attention, then stops so the reviewer's questions can come up. Time-boxed (about 15 minutes per 500 changed lines), question-driven, and changes happen only on request: edits for the user's own code, queued comments for someone else's. For a one-shot list of findings, use /code-review instead."
---

# Pair review

A good review is a conversation between someone who has read the diff and someone who is about to decide on it. A one-shot findings list skips the conversation: the reviewer gets conclusions without the understanding that lets them judge those conclusions. This skill walks the diff one **stop** at a time. Each response covers one coherent piece of the change, says why it has that shape, and stops so the reviewer's question can come up.

The pace is the point. Dump the whole diff with every finding and the reviewer skims it, trusts it or doesn't, and learns nothing about which hunk mattered. Give them one stop and they read it, react, and your next stop lands on something they just thought about.

Nothing gets built here. You read the diff and the code around it, explain, and answer. Changes happen only when the reviewer asks for them (see "Change requests").

## 1. Setup, before the first stop

Do these in order. They take a minute, and everything after depends on them.

1. **Identify the PR** from a number, a URL, or the current branch. Run:
   `gh pr view <n> --json number,title,body,author,state,baseRefName,headRefName,headRefOid,files,additions,deletions`
   If no PR can be found, ask for one. If `state` is not `OPEN`, say so in the opening message: the closing can't post a review or offer a merge, so it hands over the queued comments as a list instead.
2. **Ask whose code it is** with `AskUserQuestion`: "Your code or someone else's?" Pre-select the likely answer by comparing `author.login` with `gh api user --jq .login`. The answer sets the default for change requests: edit directly for your own code, queue comments for the author otherwise. The reviewer can override it at any time. If the user already said whose code it is, don't ask. If `AskUserQuestion` isn't available, ask in plain text, or state your assumption in the opening message.
3. **Check the PR out in place.** Links only land on the right lines when the PR head is on disk. If `git status --porcelain` shows changes, stop and ask with `AskUserQuestion`. Never pick silently:
   - **Stash**, then restore after the review.
   - **Worktree**: `git worktree add` a directory, then `gh pr checkout <n>` inside it. Links then point into the worktree path.
   - **Commit** the pending changes first. Say which branch they would land on.

   Record the original branch (`git branch --show-current`) so you can offer to return to it at the end, then run `gh pr checkout <n>`. If that fails because the head branch is gone (a merged PR, or a deleted fork), fetch the PR ref instead: `git fetch origin pull/<n>/head:pr-<n> && git checkout pr-<n>`. Either way, confirm that `git rev-parse HEAD` equals `headRefOid`. Without that, links can look right and point at the wrong code.
4. **Detect VS Code.** It decides the link format and whether a selection can be the subject of a question. Any one of these is enough:
   - the `mcp__claude-vscode__getDiagnostics` tool is available (the extension's chat panel)
   - the context includes the editor selection, marked as `ide_selection`
   - `mcp__ide__*` tools are present (the CLI with the IDE connected)
   - `$TERM_PROGRAM` is `vscode` (the CLI in the integrated terminal)

   Check the tool list and context first; they cost nothing. Fall back to the environment variable. If the user says which editor they're in, believe them over the detection. Links are relative to the directory the session started in.

   Do not try to open diffs in the editor. `vscode://` links are not clickable in chat, `vscode://file/...` deeplinks don't work, and the PR extension's deeplink opens the whole PR, never a single file. Don't retry any of them. Links in the reply are the mechanism.
5. **Set the budget.** Count reviewable changed lines (additions plus deletions), excluding lockfiles, generated code, vendored code, and snapshots, and name what you excluded. Tests count: they are code someone has to read, and they usually go last in the route. Time is 15 minutes × lines / 500, split into stops of roughly 2 to 3 minutes each (about 5 to 7 stops per 500 lines). A small PR is one or two stops, never padded to reach a count.

   Over about 1,500 lines (more than 45 minutes), don't start. Skip the route and stop 1, and reply with the budget, where the lines are (a short table by area), and three or four ways to cut it, such as the risky core only, production code without tests, or splitting into sessions. Recommend one and ask which. Read enough to make those suggestions credible (the public API and the function list), not the whole diff.
6. **Plan the route.** Read the whole diff first, plus the code around it that you need to judge it. Then order the stops so the reviewer builds an understanding of the change step by step. Do not follow the order of the diff (alphabetical by file) or the order of the commits. Those are the order the change was written in, not the order it is understood in. Order by dependency in the reviewer's head:
   - Start with the idea everything else rests on: usually the new concept, data shape, or contract, sometimes the bug being fixed, shown at its call site.
   - Each stop may assume only what earlier stops showed. If a stop needs something that comes later, signpost it: "this field is filled in by the worker at stop 5."
   - One file can appear at several stops, and one stop can span several files, when that is how the idea splits.
   - Batch mechanical changes (renames, import moves, generated code) into one skim stop near the end.
   - Treat a "Recommended review order" in the PR body (the `pr` skill writes one) as a hint, not the route.
   - Cross-check the PR description against the diff. If it claims something the diff doesn't do (a test that a later commit dropped, say), raise it at the stop where it matters.

## 2. The opening message

Two or three sentences on what the PR changes and why, in behavior terms, not file terms. Then the budget ("~620 lines, ~20 min, 7 stops", plus anything excluded), the route as a one-line-per-stop list (shown once, never maintained afterwards), and stop 1. Nothing else, with one exception: a setup surprise the reviewer needs to know (the PR is already merged, you reviewed a local `pr-<n>` branch, you assumed whose code it is) gets one short line.

## 3. The loop: one stop per response

Five beats:

1. **Where.** A location for every hunk at the stop. In VS Code, use a workspace-relative markdown link, such as `[store.go:40-72](internal/store.go#L40-L72)`. In a terminal, use plain `internal/store.go:40-72`. The links must match the checked-out code, so re-read a file before linking if you have edited it.
2. **The diff.** Show it inline as a `diff` block.
   - **Short hunk** (about 20 changed lines or fewer): show it whole.
   - **Longer hunk:** trim to the lines the point hinges on, mark each cut with `…`, and let the location reference cover the rest. If trimming would hide the point, split the stop, because the hunk is probably two ideas.
   - **Several hunks at one stop:** one block is fine, with `…` between them, and one link per hunk in the location line.
3. **What changed.** One or two sentences on behavior. The reviewer can read the code; what they can't read is what it does differently now.
4. **What to look at.** The one or two things that deserve their attention: what isn't obvious, what's risky, the plausible-looking alternative and why it wasn't taken, and any bug you suspect, with your confidence. If nothing deserves attention, say the stop is routine and move on. Manufactured concern is worse than none.
5. **Stop.** Give the progress ("stop 3/7") and one line naming what's next. Then actually stop and wait.

**Sizing.** A stop is one coherent concern, usually 30 to 120 changed lines. The budget decides granularity. If the session runs long, merge stops instead of rushing the explanations.

## 4. Answering questions

- Answer at the depth asked, with links.
- Check before claiming: read the callers, run the test, or use `git log -S`. Say which claims you verified and which you inferred. Running a throwaway check is fine; delete it and confirm the tree is clean afterwards. If execution is blocked, say so and fall back to reading.
- If the reviewer highlighted lines in the editor, the selection arrives with the prompt as `ide_selection` context. Treat it as the subject of an otherwise vague question ("what about this?").
- After a tangent, say where you were and pick the route back up.

## 5. Change requests

Nothing changes until the reviewer asks. What happens then depends on whose code it is.

- **Someone else's code:** draft a comment addressed to the author. Make it specific, and use a GitHub `suggestion` block when the fix is concrete. Confirm it in one line ("Queued for `store.go:58`: …"), keep the queue in the conversation, and move on.
- **The user's own code:** edit directly. VS Code shows the native diff with per-change accept and reject. Don't commit until asked.
- **Overrides:** "just fix it" on someone else's PR means edit locally and ask before pushing to the author's branch. "Note it for later" on the user's own PR means queue it.
- Edits shift line numbers. Re-read before linking again.

## 6. Closing

After the last stop, give your overall take in two or three lines: remaining risks and open questions. No praise. Then:

- **Someone else's code:** list the queued comments, ask which verdict to post (comment, request changes, or approve), and post only after confirmation. Read `references/posting-review.md` for how.
- **The user's own code:** offer to commit and push.
- Offer to switch back to the original branch, and to restore stashed work or remove the worktree if you made one.
- Write no summary file. The conversation is the record.

## 7. Pace controls

The reviewer steers; believe them.

- "Faster" or "keep going": merge the next two or three stops into one response. Keep the beats, drop the pauses.
- "Skip the tests" or "only the risky parts": re-plan the route and say the new stop count.
- "Stop here": go to closing.
- "I already know this part": skip it and ask what they want to look at instead.

## What ruins it

- Walking files in diff order, or commits in order, when the change only makes sense from its core idea outwards.
- Leaning on something a later stop introduces without saying so.
- Dumping every finding in one response. That is `/code-review`.
- Pasting a 100-line hunk whole when ten of its lines carry the point.
- Trying to open diffs in VS Code with `vscode://` links, deeplinks, or the PR extension's URL.
- Fifteen nits at one stop. Pick what matters; mention that more exist only if the reviewer wants them.
- Posting a review or pushing a branch without confirmation.
- Links to lines that don't match the checked-out code.
- Praise ("Great PR!") and filler. Assume competence; get to the point.

## The shape, in miniature

> **The PR adds a retry loop around `Store.Save`, so a transient database error no longer fails the request.** Budget is 4 stops; this is the core one.
>
> [internal/store/store.go:40-58](internal/store/store.go#L40-L58)
>
> ```diff
>  func (s *Store) Save(ctx context.Context, item Item) error {
> -	return s.db.Insert(ctx, item)
> +	var err error
> +	for attempt := 0; attempt < maxAttempts; attempt++ {
> +		if err = s.db.Insert(ctx, item); err == nil || !isTransient(err) {
> +			return err
> +		}
> +		time.Sleep(backoff(attempt))
> +	}
> +	return err
>  }
> ```
>
> `Save` now retries up to `maxAttempts` times on errors that `isTransient` accepts, sleeping between tries.
>
> Two things to look at. First, `time.Sleep` ignores `ctx`, so a cancelled request still waits out the backoff; a `select` on `ctx.Done()` would avoid that, and I'm fairly sure it's a real bug. Second, `Insert` is retried as if it were idempotent. If `item.ID` is generated before the call, a retry after a timeout that actually committed fails on the unique key instead of double-writing, which is safe. If the database generates it, you get a duplicate row. I haven't checked which; that's the next thing I'd read.
>
> Stop 1/4. Next: `isTransient`, which decides what gets retried.

Note what that response does _not_ do: it doesn't show `isTransient`, the tests, or the config change. Each is its own stop.
