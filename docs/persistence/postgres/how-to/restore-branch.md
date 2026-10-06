---
tags: [postgres, how-to]
---

# Restore a Postgres branch from backup

Choose a UTC point in time covered by the source branch's backups. The restore creates a new, writable database without changing your workloads.

```bash
nais alpha postgres branch create <POSTGRES-NAME> <NEW-BRANCH> --from main --at <UTC-TIMESTAMP> --team <TEAM> --environment <ENVIRONMENT>
```

Use an RFC3339 timestamp with whole-second precision ending in `Z`, for example `2026-10-05T08:00:00Z`. Replace `main` with another source branch if needed. Wait for the new branch to become available:

```bash
nais alpha postgres branch status <POSTGRES-NAME> <NEW-BRANCH> --team <TEAM> --environment <ENVIRONMENT>
```

Optionally, inspect the restored data without changing workload traffic:

```bash
nais alpha postgres psql <POSTGRES-NAME> --branch <NEW-BRANCH> --team <TEAM> --environment <ENVIRONMENT> --reason "Verify restored database data"
```

When the restored data is correct and workloads should use it, pause writes to the current database and switch them to the new branch:

```bash
nais alpha postgres branch activate <POSTGRES-NAME> <NEW-BRANCH> --team <TEAM> --environment <ENVIRONMENT>
```

The switch is not instant. Check the Postgres status until it is `Ready` and `Active branch` shows `<NEW-BRANCH>`:

```bash
nais alpha postgres status <POSTGRES-NAME> --team <TEAM> --environment <ENVIRONMENT>
```

Then verify the workload's connection and data before allowing writes again. Existing database connections may still point to the old branch; restart or reconnect workloads as needed. Do not delete the old branch until workloads are using the new branch and you have verified the data.
