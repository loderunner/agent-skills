# Error messages

Distilled from Google's *Error Messages* course and the related style-guide guidance. Applies to UI
errors, form validation, exceptions, CLI failures, API error responses, and log messages.

## Contents

- [The anatomy of a good error message](#the-anatomy-of-a-good-error-message)
- [Identify the cause](#identify-the-cause)
- [Explain how to fix it](#explain-how-to-fix-it)
- [Write clearly](#write-clearly)
- [Set the right tone](#set-the-right-tone)
- [Format for readability](#format-for-readability)
- [Error handling for engineers](#error-handling-for-engineers)
- [Review checklist](#review-checklist)

## The anatomy of a good error message

A good error message answers two questions: **what went wrong** and **how do I fix it**. Most
strong messages have this shape:

```
[What went wrong, specifically] [The offending value vs. the requirement] [How to fix it] [Example or link]
```

| Not recommended | Recommended |
|---|---|
| Invalid postal code. | The postal code for the US must consist of either five or nine digits. The specified postal code (4872953) contained seven digits. |
| Could not fetch resource: Quota 'CPUS' exceeded. Limit: 1.0 in region us-central-1. | You requested 2.0 CPUs, which exceeds your quota of 1.0 CPUs in the us-central-1 region. To fix the problem, do one of the following: (list) Increase your CPU quota in the us-central-1 region. Make your request in a region where you have more CPU quota. For details, see [URL]. |
| Bad directory. | The `/var/app/uploads` directory exists but isn't writable. To add files, make the directory writable — for example, `chmod u+w /var/app/uploads`. |

Not every message needs every part, but a message missing *both* a specific cause and a fix is
almost always a bad message.

## Identify the cause

**Say exactly what went wrong.** Vague messages ("Bad directory.", "Invalid field 'picture'.",
"Something went wrong.") frustrate users and generate support tickets.

> The 'picture' field can appear only once on the command line; this command line contains the
> 'picture' field 3 times.

**Surface the invalid input.** If the user typed, set, or passed the value, show it back to them.

| Not recommended | Recommended |
|---|---|
| The specified bid is too low. | The specified bid ($5) is below the minimum bid ($8). |
| Funds can only be transferred to an account in the same country. | You can only transfer funds to an account in the same country. The sender account's country (UK) doesn't match the recipient account's country (Canada). |

If the bad input is very long, truncate it to the essential part or disclose it progressively.

**Specify requirements and constraints.** Don't assume users know your system's limits.

| Not recommended | Recommended |
|---|---|
| The combined size of the attachments is too big. | The combined size of the attachments (14 MB) exceeds the allowed limit (10 MB). |
| Permission denied. | Permission denied. Only members of the `release-admins` group can publish releases. |
| Time-out period exceeded. | Time-out period (30 s) exceeded. |

**Don't swallow the root cause.** "Server error" can mean a service failure, a dropped connection,
a status mismatch, or a permission problem. Pass along the specific cause (and context such as the
operation and resource) whenever it's safe to do so.

## Explain how to fix it

**Make messages actionable.** After the cause, tell the user what to do.

| Not recommended | Recommended |
|---|---|
| The client app on your device is no longer supported. | The client app on your device is no longer supported. To update the app, click **Update app**. |

**Provide an example of the fix** when the correct form isn't obvious.

| Not recommended | Recommended |
|---|---|
| Invalid email address. | The specified email address (robin) is missing an @ sign and a domain name. For example: robin@example.com. |
| Syntax error on token "\|\|", "if" expected. | Syntax error in the "if" condition. The condition is missing an outer pair of parentheses. For example: `if ((a > 10) \|\| (b == 0))` |

An example only helps if the message also explains the rule. "Invalid license plate. For example:
MBR 918" leaves readers asking *why* theirs is invalid.

**Link to details** when the fix needs more than a couple of sentences, or when the user can't read
the message while fixing the problem (for example, replacing a device battery). Don't paste a
ten-step procedure into an error message.

## Write clearly

**Be concise, but not cryptic.** Cut words that don't help, and convert passive voice to active.

| Not recommended | Recommended |
|---|---|
| Unable to establish connection to the SQL database. | Can't connect to the SQL database. |
| The SiteID \<SiteID\> you have entered is invalid. | Invalid SiteID \<SiteID\>. *(then explain the rule)* |
| The Froobus operation is no longer supported by the Frambus app. | The Frambus app no longer supports the Froobus operation. |
| *(too far)* Unsupported. | |

**Avoid double negatives and exceptions to exceptions.**

| Not recommended | Recommended |
|---|---|
| You cannot not invoke this flag. | You must invoke this flag. |
| The universal read permission on *pathname* prevents the OS from forbidding access. | The universal read permission on *pathname* lets anyone read this file, which is a security risk. To restrict readers, see [link]. |
| The service account must have permissions on the image, except the Viewer role, unless the Admin role is available. | The service account must have one of the following roles: (list) Storage Object Admin, Storage Object Creator. |

**Write for the target audience.** Use vocabulary they know; beware the curse of knowledge.

| Audience | Message |
|---|---|
| ML engineers only | Exploding gradient problem. To fix this problem, consider gradient clipping. |
| Inappropriate for shoppers | A server dropped your client's request because the server farm is running at 92% CPU capacity. Retry in five minutes. |
| Appropriate for shoppers | So many people are shopping right now that our system can't complete your purchase. Your cart is saved. Try your purchase again in five minutes. |
| Non-technical user, input `32.6` | The specified age, 32.6, contains a decimal point. Enter an age without a decimal point — for example, 32. |
| Application programmers | The call `read_file(my_input_stream)` failed because `my_input_stream` doesn't exist. To open a stream for reading, call `open_file` — for example, `my_input_stream = open_file("~/.bashrc")`. |

"Floating-point number", "integer", "checksum", "upload", and "JPG" mean nothing to many end users.
Developer-facing exceptions can and should be technical; end-user messages should not.

**Use terminology consistently.** If one message says "datastore", every message says "datastore".
Within one message, don't call the same object a "file" and then a "datastore". The same problem
must produce the same message everywhere in the product.

| Not recommended | Recommended |
|---|---|
| Can't connect to cluster at 127.0.0.1:56. Check whether minikube is running. | Can't connect to minikube at 127.0.0.1:56. Check whether minikube is running. |

## Set the right tone

**Be positive: say how to get it right, not what the user did wrong.**

| Not recommended | Recommended |
|---|---|
| You didn't enter a name. | Enter a name. |
| You entered an invalid postal code. | Enter a valid postal code. *(explain what valid means)* |
| ANSI C++ forbids declaration 'ostream' with no type. | ANSI C++ requires a type for declaration 'ostream'. |

**Don't blame the user.** Focus on what went wrong.

| Not recommended | Recommended |
|---|---|
| You specified a printer that's offline. | The specified printer is offline. |
| You forgot to open my_input_stream. | `my_input_stream` isn't open. Call `open_file` before calling `read_file`. |

**Don't over-apologize.** Avoid *sorry* and *please*; spend the words on the problem and the fix.
(Some cultures expect apologies — know your audience — but default to none.)

| Not recommended | Recommended |
|---|---|
| We're sorry, a server error occurred and we're temporarily unable to load your spreadsheet. We apologize for the inconvenience. Please wait a while and try again. | Docs can't open your spreadsheet right now. In the meantime, you can download it: right-click the spreadsheet in the doc list and click **Download**. |

**Avoid humor.** Frustrated users aren't receptive to it, it translates badly, and it distracts from
the fix. "Is the server running? Better go catch it :D" → "The server is temporarily unavailable.
Try again in a few minutes." Never "Oops!" or "Uh-oh".

## Format for readability

- **Progressive disclosure:** show a short message first, with a way to expand the full explanation,
  so long messages don't become an ignored wall of text.
- **Place the message next to the problem.** For code errors, point at the line and column.

  ```
  2: Grade = integer;
  ---^ Syntax error
  Use ':' instead of '=' when declaring a variable.
  ```

- **Don't rely on color alone** to mark the bad part of a value. Pair it with bold, spacing, or a
  caret line:

  ```
  The argument accepts only digits. The highlighted characters are invalid:
  3728LJ947
      ^^
  ```

- **Link** to documentation for long explanations: "Post contains unsafe information. Learn more
  about safety at [link]."

## Error handling for engineers

- **Don't fail silently.** Users wonder whether anything happened; support has nothing to go on.
  Plan error messages while you design the software, assuming people will misuse it.
- **Raise errors as early as useful.** Holding errors and raising them later makes debugging much
  more expensive.
- **Follow the language's conventions** for errors and exceptions. For example, Go error strings are
  lowercase without trailing punctuation and are wrapped with context (`fmt.Errorf("load config %q:
  %w", path, err)`); Python exceptions use the most specific built-in or custom exception class.
  The content rules in this file still apply to the text.
- **Include error codes** when they exist: "Error 409: You already own this bucket. Choose a
  different name." Use canonical codes (for example, HTTP status or `google.rpc.Code`) for APIs, log
  numeric codes for support, and document every code.
- **Include a stable error identifier** in machine-readable errors so engineers can search logs even
  after the human-readable text changes:
  `{"error": "Bad Request - Request is missing the required parameter collection_name. Add the parameter and resubmit. Issue reference number BR0x0071"}`
- **Log messages** follow the same rules for the engineer reading them at 3 AM: what failed, which
  resource or value, and the underlying cause.

## Review checklist

- [ ] Does it say specifically what went wrong (not "invalid", "bad", "error occurred")?
- [ ] Does it show the offending value and the requirement or limit?
- [ ] Does it say how to fix the problem, with an example if the format isn't obvious?
- [ ] Is it the right vocabulary for *this* audience?
- [ ] Is it concise without being cryptic?
- [ ] Any double negatives, blame ("you entered", "you forgot"), apologies, *please*, or jokes?
- [ ] Are terms consistent with other messages and the UI?
- [ ] For long messages: progressive disclosure or a link?
- [ ] For developers: error code, identifier, root cause preserved?
