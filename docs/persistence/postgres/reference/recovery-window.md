---
tags: [postgres, reference]
---

# Postgres recovery window

The recovery window is how far back in time a Postgres database can be restored to. It determines how long backups are kept.

For steps, see [Manage Postgres](../how-to/manage.md) and [Create Postgres](../how-to/create.md). To restore, see [Clone or restore Postgres](../how-to/restore-point-in-time.md).

## Setting

| Property | Value |
| --- | --- |
| Allowed range | 2 to 30 days, whole numbers |
| Default | 2 days |
| Manifest field | [`spec.backup.retentionDays`](spec.md#backupretentiondays) |
| CLI flag | `--recovery-window-days` on `nais postgres create` and `nais postgres update` |
| Console | **Point-in-time recovery window** on the create and edit forms |

Databases without an explicit setting use the default.

## What is kept

- A base backup is taken every night, and write-ahead logs are archived continuously.
- Backups and logs older than the window are removed automatically. Removal runs periodically, not at a fixed time.
- The backup preceding the window is kept, so data up to a day older than the window may remain. Do not rely on it.
- Shortening the window removes older backups permanently. Lengthening it does not bring back backups that are already removed; the window grows as new backups accumulate.

## Where to see it

- **Console:** The database's page shows the window. Hover it to see the earliest restore point.
- **CLI:** `nais postgres get <POSTGRES-NAME>` shows the window and the earliest restore point.

## Cost estimate

Backups are stored in a bucket in your team's project, and the storage is billed to your team. Console shows an estimate when you create or edit a database:

```text
storage size (GiB) × (window in days + 1) × 0.02 € per GiB-month
```

The estimate is an upper bound. The size of your data is not known, so the storage size stands in for the size of one base backup, and compression and write-ahead logs are not counted. Your actual cost depends on how much data the database holds.
