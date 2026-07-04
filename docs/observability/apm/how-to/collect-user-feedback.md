---
title: Collect user feedback
description: >-
  Capture free-text user feedback with @nais/apm's captureFeedback and see it
  joined to sessions and issues in Nais APM.
tags: [how-to, observability, apm, frontend]
---

# Collect user feedback

`captureFeedback` sends free-text feedback from your users into the same
telemetry stream as your errors. Feedback is joined to the user's session
automatically, and optionally to a specific issue — so you can read "the export
button did nothing" right next to the error it describes.

This is `@nais/apm`'s own addition; there's no direct Sentry equivalent.

## Capture feedback

Wire `captureFeedback` to your own feedback UI — a form, a "was this helpful?"
widget, a bug-report button:

```ts
import { captureFeedback } from '@nais/apm';

captureFeedback('The export button did nothing', {
  category: 'bug', // 'bug' | 'idea' | 'other' — default 'other'
  email: 'user@example.com', // optional, only sent if it looks like an email
  fingerprint: 'export-button-noop', // optional, joins feedback to an issue
  context: { page: 'reports' }, // optional extra context
});
```

`@nais/apm` supplies the plumbing, not the UI — build the input control that
fits your app and call `captureFeedback` with what the user typed.

## What gets sent

| Field | Notes |
| ----- | ----- |
| `message` | The free text. Scrubbed for fødselsnummer, emails, and tokens; trimmed; capped at 4000 characters. |
| `category` | `bug`, `idea`, or `other`. Defaults to `other`. |
| `email` | Only included when you pass it **and** it's email-shaped. This is a user-volunteered contact address, validated rather than scrubbed. |
| `fingerprint` | Joins the feedback to a specific issue. |
| `context` | Extra key/value context, scrubbed like the message. |

Empty messages are dropped, and calling `captureFeedback` before `init()` is a
safe no-op.

## See it in Nais APM

Feedback flows into your service's telemetry and is joined to the current
session automatically. When you pass a `fingerprint`, it also joins to that
issue — so it shows up in the issue drawer alongside the error.

<!-- SCREENSHOT: Issue drawer showing joined user feedback text next to the exception it describes -->

## Related

- [`@nais/apm` API reference](../reference/apm-client-api.md#capturefeedbackmessage-options)
- [Track frontend errors with `@nais/apm`](../tutorials/track-frontend-errors.md)
