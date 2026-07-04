---
title: Enable session replay
description: >-
  Opt in to masked session replay or crash snapshots in @nais/apm, understand
  the non-overridable masking floor, and make the privacy decision your team owns.
tags: [how-to, observability, apm, frontend, privacy]
---

# Enable session replay

!!! warning "Preview"
    Session replay and crash snapshots are still being rolled out and are gated
    on the personvernombud (data protection officer) process. Treat this as a
    preview: keep both off unless your team has explicitly decided, through its
    own privacy assessment, to turn on screen recording for its users.

Session replay lets you see what a user's screen looked like around an error.
`@nais/apm` can record a masked replay of the session, or capture a single
masked snapshot when an error occurs. Both are **off by default** and enabled
per app, in `init()`.

## The decision is yours to make

**Session replay and crash snapshots are opt-in for a reason: a team must
decide, deliberately, to turn on screen recording for its own users.** This is
not a technical toggle to flip lightly — it reflects the personvernombud (data
protection officer) process, and **each team is responsible for making that call
for its own application and users, in line with its own privacy assessment.**

Enable it only after that decision is made. For citizen-facing applications in
particular, involve your privacy assessment before turning it on.

## The masking floor (non-overridable)

To make that decision safer whichever way it goes, both features share a
**masking floor** applied in the browser *before any byte leaves the user's
machine*:

- every form input value is masked, with no exceptions — inputs can never be
  unmasked;
- all text is masked, except elements you explicitly mark with a
  `data-apm-unmask` attribute;
- images, video, audio, canvas, iframes, embeds, and anything marked
  `data-apm-block` are always blocked, never inlined;
- stylesheets and images are never inlined into the capture.

The `block` option can only **add** more selectors to block. There is no option
to relax any part of the masking floor.

## Enable full session replay

```ts
import { init } from '@nais/apm';

init({
  sessionReplay: {
    enabled: true,
    mode: 'on-error', // or 'always'
    sampleRate: 0.5, // fraction of sessions recorded, 0..1
    block: ['.no-record-me'], // extra selectors to block; tighten-only
  },
});
```

- **`mode: 'on-error'`** (default) buffers the last ~60–120 seconds in memory
  and ships it **only once an error actually occurs**. Nothing leaves the
  browser before that.
- **`mode: 'always'`** streams continuously, gated by `sampleRate`.

## Or capture a crash snapshot only

If a full recording is more than you need, capture one masked DOM snapshot per
new error instead:

```ts
init({ screenshotOnError: true });
```

`screenshotOnError` is throttled and capped per session. It's automatically
disabled when `sessionReplay` is enabled, because a recording already contains
the same information.

## See the replay

Once enabled and deployed, replays and snapshots attach to their issue: open the
issue in the [Issues tab](../tutorials/get-started.md#3-check-the-issues-tab)
and the drawer shows the masked replay alongside the stack trace.

<!-- SCREENSHOT: Issue drawer showing the self-hosted masked session-replay player alongside the stack trace -->

## Related

- [`@nais/apm` API reference](../reference/apm-client-api.md#init-options) —
  full `sessionReplay` options.
- [Track frontend errors with `@nais/apm`](../tutorials/track-frontend-errors.md)
