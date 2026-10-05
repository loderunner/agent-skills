# Word list

A curated subset of the Google developer documentation style guide's word list: the general-purpose
entries most likely to come up in developer docs, comments, and messages. Google-product-specific
entries are omitted. For anything not listed, use the first spelling in Merriam-Webster.

"Use with caution" terms are fine when they're the clearest option (define them on first use).
"Don't use" terms have a clear replacement or are non-inclusive.

## Contents

- [Plain-language replacements](#plain-language-replacements)
- [Ambiguous words](#ambiguous-words)
- [Requirement and possibility verbs](#requirement-and-possibility-verbs)
- [Subjective or condescending words](#subjective-or-condescending-words)
- [Time-bound words](#time-bound-words)
- [Inclusive language](#inclusive-language)
- [Jargon and figurative terms](#jargon-and-figurative-terms)
- [UI and interaction verbs](#ui-and-interaction-verbs)
- [Documentation references](#documentation-references)
- [Spelling and compounds](#spelling-and-compounds)

## Plain-language replacements

| Instead of | Write |
|---|---|
| utilize, leverage (meaning "use") | use, build on, take advantage of (*utilization* is fine for resource usage) |
| commence, initiate | start, begin |
| terminate (meaning "stop"), abort, kill | stop, exit, cancel, end (keep *terminate*/*kill* for signals like `SIGTERM`/`SIGKILL`) |
| execute (when *run* works) | run |
| in order to | to |
| is able to | can |
| allows you to, enables you to | lets you |
| a number of | some, many, several |
| make use of | use |
| at this point in time | now |
| desire, desired, wish | want, need |
| comprise | consist of, contain, include |
| via | through, by using, with |
| impact (verb) | affect |
| functionality (overused) | features, capabilities |
| performant | fast, efficient, or a measurable claim |
| surface (verb) | show, expose, make available |
| persist (verb) | store, save, make persistent |
| config, repo, regex, authN/authZ, k8s | configuration, repository, regular expression, authentication/authorization, Kubernetes (code names excepted) |
| e.g., i.e., vs., aka, etc. | for example / such as, that is, versus, also known as, rewrite the list |
| possible / impossible (meaning can/can't) | you can / you can't |
| unzip, untar, uncompress, unarchive | extract |
| tarball | tar file |
| spin up | create, start |
| pros, cons | advantages, disadvantages |
| learnings | lessons, what you learned |
| actionable | that you can act on, useful |
| agnostic | independent (platform-independent) |
| interface (verb) | interact, communicate |
| Google (verb) | search |
| email (verb) | send an email |
| Create a new … | Create a … |
| Copy and paste X into Y | Enter X in Y |

## Ambiguous words

| Word | Guidance |
|---|---|
| as, since | Use *because* for causation; reserve *since* for time. |
| once | Use *after* when you mean after. |
| while | Use *although* for contrast; *while* only for time. |
| should | Usually avoid; say *must* (required), *we recommend* (recommended), or describe the expected outcome. |
| may | Reserve for legal/policy. Use *can* (permission/ability) or *might* (possibility). |
| could, would, will | Prefer *can* and present tense. |
| shall | Don't use (except with legal advice). |
| this, that, these, it | Follow *this/that/these* with a noun; replace *it* when the antecedent isn't obvious. |
| each | Means every individual item, not "all". |
| either | Use only for two choices, with parallel structure ("either A or B"). |
| neither | "neither A nor B". |
| key (adjective) | Don't use to mean "important"; *key* has too many technical meanings. |
| image | Qualify it: *disk image*, *container image*. |
| typically | Don't start a sentence with it. |
| above, below, higher, lower, under | For document positions: *preceding*, *following*, *earlier*, *later*. For versions: *later*, *earlier*. Never for UI positions. |
| with | Not for ownership ("a phone that has 2 GB of RAM") or use ("by using"). |
| deprecated | Means "discouraged, may be removed", not "removed". |
| client | In APIs, the app the developer writes; don't use for "client library". |
| API | Not a synonym for a method or class. |
| data | Singular mass noun: "the data is", "less data". |
| legacy | Define what you mean; never pejorative. |
| scale | Say which direction: scale up/down/out/in. |

## Requirement and possibility verbs

| Meaning | Use | Example |
|---|---|---|
| Required | *must*, or an imperative | You must have the Editor role. / Do the following before you continue. |
| Recommended | *we recommend* (or *should* for widely accepted practice) | We recommend enabling two-factor authentication. |
| Optional | *can* | You can also view logs in the console. |
| Possible outcome | *might*, *can* | The import can take about 30 minutes. |
| Expected outcome | Plain statement | The process returns 10 items. |
| State | Say who sets it | You must set the value to `true`. / The server sets the value to `true`. |

## Subjective or condescending words

Remove or replace with specifics: *simple, simply, easy, easily, just, quick, quickly, obviously,
of course, clearly, trivial, straightforward, painless, carefully, thoroughly, proper, properly,
please* (in instructions), *please note*.

| Not recommended | Recommended |
|---|---|
| Simply open the configuration file to quickly add your key. | Open the configuration file and add your key. |
| Ensure the daemon is properly installed. | To verify that the daemon is running, run `systemctl status DAEMON_NAME` and confirm that the output includes `active (running)`. |
| Make sure to enter the API key carefully. | Enter the API key that appears in the console. |

## Time-bound words

In product documentation (not release notes), avoid: *new, newer, old, older, now, currently,
presently, at present, as of this writing, soon, eventually, latest, does not yet, in the future,
existing* (as in "existing feature").

| Not recommended | Recommended |
|---|---|
| The emulator now supports the following filters: | The emulator supports the following filters: |
| Windows isn't currently supported. | Windows isn't supported. |
| This works in older versions. | This works in versions earlier than 1.17.0. |

## Inclusive language

| Instead of | Write |
|---|---|
| whitelist, blacklist (noun) | allowlist, denylist; as verbs, rewrite: "allow requests from…", "block…" |
| master / slave | primary/replica, primary/secondary, controller/worker, leader/follower, parent/child (keep code keywords in code font, mention once) |
| master (branch, copy) | main, primary, original, source |
| he, she, he/she, (s)he (generic) | they, their |
| guys, you guys | everyone, folks, you |
| man-hours, manpower, manned, man-made | person-hours, staff/workforce, staffed, artificial/manufactured |
| man-in-the-middle | on-path attacker, person-in-the-middle (PITM) |
| sanity check | quick check, confidence check, coherence check |
| sane, insane, crazy, lame, dumb, cripple, blind to | valid/sensible, unexpected/baffling, slow down, unaware of |
| dummy (value, variable) | placeholder, sample |
| native (feature) | built-in |
| first-class citizen | fully supported, built-in |
| grandfathered | legacy, exempt |
| black-box / white-box testing | opaque-box / clear-box testing |
| blackhat, whitehat | malicious, ethical (describe the practice) |
| female/male adapter | socket / plug |
| ninja, guru, rockstar (people) | expert |
| tribal knowledge | institutional knowledge, undocumented knowledge |
| war room | incident response team, situation room |
| normal, healthy (people without disabilities) | nondisabled, people without disabilities |
| the elderly, seniors | older adults |
| native/non-native speaker | describe the need without referring to people's languages |
| mom test | novice user test |
| American (meaning US) | US, people in the US |
| Black Friday, Cyber Monday (generic) | peak scale event |

## Jargon and figurative terms

Avoid, or define on first use if the term is standard for the audience and readers search for it:

| Term | Prefer |
|---|---|
| blast radius | affected area, scope of impact |
| break-glass | emergency access, manual fallback |
| out of the box | by default, built-in, ready-made |
| off-the-shelf | ready-made, prebuilt |
| hang, hung | stop responding, not responding |
| nuke | delete, remove |
| shift left | move to an earlier phase |
| single pane of glass | single interface, unified interface |
| slice and dice | segment, break into parts |
| lift and shift | rehost (define once) |
| pets vs. cattle | manually configured versus automated |
| hands-on / hands-off | interactive / automated |
| best effort | describe the actual guarantee |
| canary, hot/warm/cold standby, dead-letter queue | define on first use; use consistently |
| foo, bar, baz | meaningful example names |
| roll out | gradually release, release in stages |
| voodoo, magic | complex, nondeterministic, or explain the mechanism |
| postmortem | retrospective (blameless postmortem in SRE contexts) |
| tl;dr, ymmv, RTFM | In summary, your results might vary, For more information, see… |

## UI and interaction verbs

| Instead of | Write |
|---|---|
| click on, hit | click |
| check, tick (a checkbox) | select |
| uncheck, deselect, unselect | clear |
| type, input (into a field) | enter |
| hover, mouse over | hold the pointer over |
| pop-up, popup | dialog (window) or menu |
| drop-down (noun) | list, menu |
| zippy, expando | expander arrow, expandable section |
| hamburger, kebab menu | the element's label (for example, **More**) |
| toggle (verb) | turn on, turn off |
| log in, log out (unless the UI says so) | sign in, sign out ("sign in to", not "sign into") |
| populate (a form) | fill in (fields), fill out (a form) |
| scroll down to | go to |
| left-nav | navigation menu |

## Documentation references

| Instead of | Write |
|---|---|
| this article, this topic, this page, this doc | this document (or *this tutorial*, *this guide*) |
| click here, here, this link | descriptive link text |
| For more information on X, see… | For more information about X, see… |
| the above, the following below | the preceding, the following |
| chapter (non-book docs) | document, page, section |
| review (meaning "read") | read |

## Spelling and compounds

**One word:** backend, frontend, codebase, checkbox, filename, hostname, endpoint, namespace,
datastore, lifecycle, timestamp, timeout (noun), setup (noun), startup (noun), runbook, toolkit,
walkthrough, whitespace, wildcard, inline, prebuilt, colocate, autoscaling, ecommerce, healthcare,
livestream, screenshot, touchscreen; also lowercase *web* and *internet*.

**Two words:** data center, data type, data source, file system, name server, key pair, time zone,
plain text (except *plaintext* in cryptography), user base, table name, web server, single most.

**Hyphenated:** read-only, key-value pair, built-in, on-premises (never "on-prem" or
"on-premise"), third-party (adjective), long-running, big-endian, little-endian, error-prone,
pre-existing, multi-cluster, double-click, right-click, drag-and-drop (adjective only).

**Noun versus verb:** *setup*/*set up*, *login*/*log in*, *sign-in*/*sign in*, *backup*/*back up*,
*failover*/*fail over*, *timeout*/*time out*, *startup*/*start up*, *plugin*/*plug in*,
*shutdown*/*shut down*.

**Capitalization and spelling:** ID (not Id), URL, HTTPS, OAuth 2.0, JavaScript, Markdown, Unicode,
UTF-8, SHA-1, Wi-Fi, curl, IPsec, *a SQL database*, *an SSH key*, *appendixes*,
*indexes* (not indices, except math), *email* (not e-mail), *canceled* (not cancelled).
