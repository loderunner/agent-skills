# Posting the queued comments as one review

Read this file at the end of a pair review of someone else's PR, once the reviewer has seen the queued comments and confirmed they want them posted. Don't read it earlier; nothing before the closing needs it.

Post everything as **one review**, not as separate comments. One review sends the author a single notification and shows the verdict and every comment together. Separate comments send one notification each.

## Before posting

1. Show the full queue and the verdict you are about to post, and ask the reviewer to confirm both. Posting is outward-facing and can't be unsent: the author is notified, and the text may be cached or indexed even if deleted later. Ask with `AskUserQuestion` when it's available.
2. Offer the three verdicts, and recommend one from the review:
   - `COMMENT`: feedback without a decision.
   - `REQUEST_CHANGES`: the PR shouldn't merge as it is.
   - `APPROVE`: the reviewer is happy to merge. A queue of blocking comments contradicts this; point it out rather than posting it.
3. Offer a short review body (one to three sentences, the overall take from the closing). It may be empty for `COMMENT` and `APPROVE`.

## Post

Get the owner, repo, and head commit:

```shell
gh repo view --json nameWithOwner --jq .nameWithOwner
gh pr view <n> --json headRefOid --jq .headRefOid
```

Write the payload to a file in the scratchpad (or another temp location outside the repo) and send it:

```shell
gh api repos/{owner}/{repo}/pulls/{n}/reviews --method POST --input review.json
```

```json
{
  "commit_id": "<headRefOid>",
  "event": "REQUEST_CHANGES",
  "body": "Overall take, one to three sentences.",
  "comments": [
    {
      "path": "internal/store/store.go",
      "line": 58,
      "side": "RIGHT",
      "body": "`time.Sleep` ignores `ctx`, so a cancelled request still waits out the backoff.\n\n```suggestion\n\t\tselect {\n\t\tcase <-ctx.Done():\n\t\t\treturn ctx.Err()\n\t\tcase <-time.After(backoff(attempt)):\n\t\t}\n```"
    },
    {
      "path": "internal/store/store.go",
      "start_line": 40,
      "start_side": "RIGHT",
      "line": 52,
      "side": "RIGHT",
      "body": "A multi-line comment covers `start_line` through `line`."
    }
  ]
}
```

Details that matter:

- `line` is a line number in the **new** file for `side: RIGHT` (added or unchanged lines) and in the old file for `side: LEFT` (removed lines). The queue holds line numbers from the checked-out PR head, so they are RIGHT-side numbers unless the comment is about a deleted line.
- A `suggestion` block replaces exactly the line or lines the comment covers. Set `start_line` and `line` to the span being replaced, and keep the original indentation in the block.
- Use `commit_id` so comments attach to the commit you reviewed. If the author has pushed since (`headRefOid` no longer matches what you checked out), tell the reviewer: line numbers may have moved.
- Include `body` only if there is one. Omit the key for an empty body.

## When a line isn't in the diff

GitHub only accepts inline comments on lines that appear in the PR's diff, hunks included. A comment on a line outside the diff makes the whole request fail with a `422` (`Line could not be resolved` or similar), and no part of the review is posted.

Check before posting. For each queued comment, confirm the line falls inside a hunk for that file (`gh pr diff <n>` shows them). For any that doesn't, move the comment into the review `body` instead, prefixed with the location as plain text (`` `store.go:120`: … ``) or a permalink to the line at the head commit.

If the request fails anyway, read the error, move the offending comments into the body, and retry once. Don't retry in a loop, and don't fall back to posting comments one at a time without telling the reviewer.

## After posting

Give the review's URL (the response's `html_url`) and say which verdict was posted and how many comments went inline versus into the body. Then continue with the rest of the closing: offer to switch back to the original branch.
