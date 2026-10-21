---
tags: [postgres, explanation]
---

# Postgres branches

A Postgres can have several branches. Each branch is a separate, writable database with its own data and history. Branch names belong to one Postgres, so different databases can each have a branch named `main`.

Every new Postgres starts with `main`. Restoring from backup creates another branch with the source branch's data and schema at the chosen point in time. The source stays unchanged. This lets you inspect restored data without replacing the database your workloads use.

Branches are not Git branches. Writes on one branch do not appear on another, and switching branches does not merge data.

## Active and pinned branches

One branch is active for each Postgres. Workloads that omit `uses.postgres[].branch` follow this branch. Workloads with an explicit branch name are pinned to it and do not follow changes to the active branch.

Creating a branch does not activate it. You can connect to an inactive branch with personal access or pin a workload to it without changing the active branch for other workloads.

Activation is asynchronous. The requested branch (`spec.activeBranch`) and the observed active branch (`status.activeBranch`) can differ while the platform prepares the switch. Workload credentials and connections also take time to change. Existing connections can still point to the old branch until the workload reconnects.

A pinned workload does not fall back to the active branch if its selected branch is unavailable or deleted.

## Restore history

Each branch builds its own backup history. A restored branch does not inherit the source branch's entire restore window. To recover to a time before the new branch's own backups began, use the original source branch while its backups are still available.

Activating a branch does not combine its backup history with another branch's history.

See [Restore a Postgres branch from backup](../how-to/restore-point-in-time.md) for restore and activation steps, or [Use Postgres in a workload](../how-to/use-in-workload.md#select-a-branch) to select a branch for one workload.
