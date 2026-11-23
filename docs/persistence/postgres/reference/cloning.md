---
tags: [postgres, reference]
---

# Postgres cloning

Cloning creates a separate, writable Postgres database from a source database's backups. Point-in-time restore uses the same operation with an explicit target time. The source remains unchanged, and no workloads move automatically.

For steps, see [Clone or restore Postgres](../how-to/restore-point-in-time.md).

## Source and configuration

The clone has a different name from its source and belongs to the same team and environment.

| Setting | Default | Changes allowed at creation |
| --- | --- | --- |
| PostgreSQL major version | Source's version | None |
| Extensions | Source's extensions | Console allows adding available extensions, but not removing source extensions. CLI inherits the source's extensions |
| High availability | Source's setting | Enable or disable |
| CPU and memory | Source's configured requests | Override independently |
| Disk size | Source's configured size | Increase, but not decrease |

The source's configuration is read when the clone is created, not from the selected point in time. Later changes to the source do not update the clone.

## Target time

Without an explicit time, CLI and Console request a point 10 minutes before submission. This buffer accounts for recent write-ahead logs that may not yet be archived. The clone does not include the source's most recent writes.

An explicit time must fall within the source's available [recovery window](recovery-window.md) and must not be in the future. A source without a recovery window cannot be cloned yet. An accepted target time does not guarantee success: cloning can still fail if required backup data or write-ahead logs are unavailable.

| Client | Time format |
| --- | --- |
| CLI `--at` | Local time, such as `2026-11-16 12:00` or `2026-11-16T12:00:00`. RFC3339 with `Z` or an explicit offset is also accepted. Whole-second precision only |
| Console **Specify time** | Date and time in the browser's local time zone, with minute precision. Empty or collapsed means the default clone point |

Local times skipped by a daylight-saving clock change are rejected. A repeated local time selects the earlier occurrence. CLI timestamps with an explicit offset are unambiguous.

## CLI flags

Command: `nais postgres clone <SOURCE> <NEW-NAME> --team <TEAM> --environment <ENVIRONMENT>`

| Flag | Description |
| --- | --- |
| `--at` | Target time. Omitted means about 10 minutes ago |
| `--high-availability true\|false` | Override the source's high-availability setting |
| `--cpu` | Override the source's CPU request, for example `500m` |
| `--memory` | Override the source's memory request, for example `2Gi` |
| `--disk-size` | Override the source's disk size, for example `50Gi`. Must not be smaller than the source's |
| `--yes`, `-y` | Skip the confirmation prompt |

## Completion status

Cloning runs asynchronously. `nais postgres get` reports **Clone status** separately from the database's **Status**. A database marked **Ready** does not by itself mean cloning is complete.

**Completed** means the clone is independent of the source and has its own backup. Source deletion is blocked while dependent clones still need its backups. The clone builds its own backup history; the source's earlier recovery window does not become part of it. The clone does not inherit the source's recovery window setting. It starts with the default point-in-time recovery window, and you can change it afterwards.

**Failed** includes the failure message. A failed clone is not a usable restored database.
