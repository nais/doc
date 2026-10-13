---
tags: [postgres, how-to]
---

# Restore a Postgres branch from backup

The restore creates a new, writable branch from a point in time covered by the source branch's backups. It does not change your workloads.

The typical case: go a little back in time and restore from there. `restored` forks at the restore point while traffic stays on `main`. Activation makes the restored branch active and cuts `main`, which remains inactive until you delete it.

Create the branch with either a relative or an exact recovery point:

=== "Relative time"

    ```bash
    nais alpha postgres branch create <POSTGRES-NAME> <NEW-BRANCH> --ago 2h --team <TEAM> --environment <ENVIRONMENT>
    ```

    `--ago` accepts durations such as `30m`, `2h` or `1h30m`.

=== "Exact time"

    ```bash
    nais alpha postgres branch create <POSTGRES-NAME> <NEW-BRANCH> --at 2026-10-06T10:00:00Z --team <TEAM> --environment <ENVIRONMENT>
    ```

    `--at` takes a UTC timestamp in RFC3339 format; `Z` means UTC.

The restore uses the active branch as source. Add `--from <BRANCH>` to restore from a different branch.

Wait until the new branch shows `Ready`:

```bash
nais alpha postgres branch list <POSTGRES-NAME> --team <TEAM> --environment <ENVIRONMENT>
```

Optionally, inspect the restored data by [connecting as a personal user](personal-access.md) with `psql` or the proxy. This does not affect workload traffic.

When the restored data is correct and workloads should use it, pause writes to the current database and activate the new branch:

```bash
nais alpha postgres branch activate <POSTGRES-NAME> <NEW-BRANCH> --team <TEAM> --environment <ENVIRONMENT>
```

The switch is asynchronous. Run `branch list` again until the new branch shows `Ready` and is marked active.

Verify the workload's connection and data before allowing writes again. Existing database connections may still point to the old branch; restart or reconnect workloads as needed. Do not delete the old branch until workloads are using the new branch and you have verified the data.
