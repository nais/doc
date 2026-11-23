---
tags: [postgres, reference]
---

# Postgres recovery window

The point-in-time recovery window is how far back in time a Postgres database can be restored to. Within the window you can restore to any moment, not only to a fixed backup.

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

## How it works

Point-in-time recovery is built from a nightly base backup and continuously archived write-ahead logs.

- Recovery data older than the window is removed automatically. Removal runs periodically, not at a fixed time.
- The base backup preceding the window is kept, so recovery data up to a day older than the window may remain. Do not rely on it.
- Shortening the window permanently removes older recovery data. Lengthening it does not bring back data that is already removed; the window grows as time passes.

## Where to see it

- **Console:** The database's page shows the window. Hover it to see the earliest restore point.
- **CLI:** `nais postgres get <POSTGRES-NAME>` shows the window and the earliest restore point.

## Cost estimate

Recovery data is stored in a bucket in your team's project, and the storage is billed to your team. Console shows an estimate when you create or edit a database:

```text
storage size (GiB) × (window in days + 1) × 0.02 € per GiB-month
```

The estimate is an upper bound. The size of your data is not known, so the storage size stands in for the size of one base backup, and compression and write-ahead logs are not counted. Your actual cost depends on how much data the database holds.
