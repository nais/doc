# Screenshot capture checklist

Working checklist of every `<!-- SCREENSHOT: ... -->` marker placed in the
Nais APM docs, so a capture pass can go page by page in one sitting. This file
is not part of the published nav (see `.pages`) — delete or fold its content
into the pages once images are captured and linked in.

| File | What to capture |
| ---- | ---------------- |
| `README.md` | Service overview page — health header with RED big numbers, front and center |
| `tutorials/get-started.md` | Service inventory — searchable list of services with health sparklines |
| `tutorials/get-started.md` | Overview tab → health header showing RED big numbers with delta arrows and a deploy marker on the chart |
| `tutorials/get-started.md` | Issues tab showing the grouped exception list (source badges, Regressed badge) with the issue drawer open showing a stack trace |
| `tutorials/get-started.md` | Database tab showing per-operation RED metrics and connection-pool health (and, separately, the empty state with the instrumentation checklist) |
| `tutorials/get-started.md` | Traces tab with a trace breakdown panel, and Logs tab with the Patterns panel above the raw log stream |
| `tutorials/track-frontend-errors.md` | Issues tab filtered to source "Browser" showing a captured frontend exception, with the exception drawer open to the stack trace |
| `how-to/triage-an-issue.md` | Issue drawer → triage bar (Resolve / Ignore / Assign / Unresolve) above the stack trace |
| `how-to/triage-an-issue.md` | Issues tab list showing a "Regressed" badge on a row above the default unresolved issues |
| `how-to/database-queries.md` | Database tab, fully instrumented — per-operation query analytics table plus the connection-pool health panel |
| `how-to/database-queries.md` | Database tab empty state showing the instrumentation-requirements checklist |
| `how-to/log-patterns.md` | Logs tab → Patterns panel showing detected patterns with volume share, above the raw log stream |
| `how-to/create-alerts.md` | Issue drawer "Create alert" action opening Grafana's alert-rule editor pre-filled with the fingerprint-scoped query |
| `how-to/enable-session-replay.md` | Issue drawer showing the self-hosted masked session-replay player alongside the stack trace |
| `how-to/collect-user-feedback.md` | Issue drawer showing joined user feedback text next to the exception it describes |

15 spots total, across the landing page, both tutorials, and 5 of the 6 how-tos
(`get-started.md` alone covers 5 tabs in one tour). Reference and explanation
pages were left unmarked — they're table/spec-driven and don't have a single
canonical screen to anchor on.
