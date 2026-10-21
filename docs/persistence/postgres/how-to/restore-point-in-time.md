---
tags: [postgres, how-to]
---

# Restore a Postgres branch from backup

The restore creates a new, writable branch from a point in time covered by the source branch's backups. It does not change your workloads.

## Create the restored branch

=== "CLI"

    Create a branch from a relative recovery point:

    ```bash
    nais alpha postgres branch create <POSTGRES-NAME> <NEW-BRANCH> --ago 2h --team <TEAM> --environment <ENVIRONMENT>
    ```

    `--ago` accepts durations such as `30m`, `2h` or `1h30m`. For an exact recovery point, use `--at` instead:

    ```bash
    nais alpha postgres branch create <POSTGRES-NAME> <NEW-BRANCH> --at 2026-10-06T10:00:00Z --team <TEAM> --environment <ENVIRONMENT>
    ```

    `--at` takes a UTC timestamp in RFC3339 format with whole seconds; `Z` means UTC.

    The restore uses the active branch as source. Add `--from <BRANCH>` to restore from a different branch.

    Wait until the new branch shows `Ready`:

    ```bash
    nais alpha postgres branch list <POSTGRES-NAME> --team <TEAM> --environment <ENVIRONMENT>
    ```

=== "Console"

    1. Open your team in [Nais Console](https://console.nais.io) and select **Postgres**.
    2. Select the database in the correct environment and open **Branches**.
    3. Select **Create branch**.
    4. Enter a new branch name and select the source branch.
    5. Set **Restore to (UTC)** to a time within the source branch's available recovery window.
    6. Select **Create branch** and wait until it is available. The branch list updates automatically.

    The new branch does not become active automatically.

Optionally, inspect the restored data by [connecting as a personal user](personal-access.md) with `psql` or the proxy. This does not affect workload traffic.

## Switch workloads to the restored branch

To move only one workload, [pin it to the restored branch](use-in-workload.md#select-a-branch) instead of activating the branch for all workloads that follow the active branch.

When the restored data is correct, pause writes from workloads that will move and request activation:

=== "CLI"

    ```bash
    nais alpha postgres branch activate <POSTGRES-NAME> <NEW-BRANCH> --team <TEAM> --environment <ENVIRONMENT>
    ```

    Run `branch list` again until the new branch shows `Ready` and is marked active.

=== "Console"

    1. Open **Branches** on the database's page.
    2. Open the restored branch's action menu and select **Use as active**.
    3. Confirm with **Use as active**.
    4. Wait until the branch is marked active.

Activation is asynchronous and does not move workloads pinned to another branch.

Verify the workload's connection and data before allowing writes again. Existing database connections may still point to the old branch; restart or reconnect workloads as needed. Do not delete the old branch until workloads are using the new branch and you have verified the data.
