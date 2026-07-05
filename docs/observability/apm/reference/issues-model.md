---
description: >-
  How Nais APM groups errors into issues — versioned fingerprints, the tiers
  that decide grouping, and what makes two errors "the same issue".
tags: [reference, observability, apm]
---

# Issues and fingerprinting

An **issue** in Nais APM is a group of error occurrences that are "the same
problem". This page explains how that grouping is computed, so you can predict
why two errors merge or split — and how to control it.

## Why grouping exists

A single bug produces thousands of raw error events, each with slightly
different text — a different order id, a different timestamp, a different UUID in
the message. Grouping folds those into one issue you triage once, with a count
and an impact, instead of a wall of near-duplicates.

Raw errors arrive already hashed by the collector, but that raw hash keys on the
message text alone, so it splinters whenever the message carries dynamic
content. Nais APM computes a **fingerprint** on top of the raw events to fix
that.

## The fingerprint

A fingerprint is a stable identity for an issue, carried in URLs as `issueId`
with a version prefix, for example `v1:9f2ab31c04d7e655`. The `v1:` prefix is
deliberate: the grouping algorithm is versioned, so it can improve later without
breaking old links — a fingerprint always states which algorithm produced it.

An issue's fingerprint is resolved to the set of raw collector hashes it covers,
and the issue shows a "merged from N raw hashes" badge when it has folded
several together.

## How two errors become the same issue

The fingerprint is decided by the first of these tiers that applies:

1. **Explicit override.** If the error carries a custom grouping key — the
   `fingerprint` option on
   [`captureException`](apm-client-api.md#captureexceptionerror-options) — that
   wins. Use it to force-group (or force-split) errors you know belong together.
2. **Type + normalized message.** The exception type combined with its message
   after normalization — dynamic parts like ids, numbers, and UUIDs are replaced
   with placeholders, so `Order 123 not found` and `Order 456 not found` group
   together.
3. **Message.** The message alone, when a type isn't available.
4. **Raw hash passthrough.** When nothing better applies, the collector's raw
   hash is used unchanged.

The practical rule: **two errors are the same issue when they normalize to the
same type-and-message** — unless you override grouping explicitly.

## Frontend and backend, one model

The same fingerprint pipeline runs over browser errors (from
[Faro](../../frontend/README.md) / [`@nais/apm`](apm-client-api.md)) and backend
exceptions (from your service's logs). That's why the **Issues** tab can show a
browser `TypeError` and a backend `PSQLException` side by side, each a
first-class issue with a stack trace, impact, and a trace link — and, for the
same trace, cross-link a frontend error to the backend error that caused it.

## Controlling grouping

- **Too coarse** (distinct problems merged): give them different `fingerprint`
  values at capture time.
- **Too fine** (one problem split into many issues): give them the *same*
  `fingerprint`, or reduce dynamic content in the message so normalization can
  merge them.

## Related

- [Triage an issue](../how-to/triage-an-issue.md) — acting on an issue once it's
  grouped.
- [URL and deep-link contract](url-contract.md) — how `issueId` and the legacy
  `exceptionHash` resolve.
