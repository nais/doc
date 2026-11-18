---
tags: [postgres, how-to]
---

# Clone or restore Postgres

Clone a Postgres database from its backups, either from the latest available point or from a specific time. The clone is a new, writable database in the same team and environment. It does not change the source database or move your workloads.

## Clone the database

=== "CLI"

    Clone from the latest available point, about 10 minutes ago:

    ```bash
    nais postgres clone <SOURCE-POSTGRES-NAME> <NEW-POSTGRES-NAME> --team <TEAM> --environment <ENVIRONMENT>
    ```

    To restore to a specific time instead, add `--at`:

    ```bash
    nais postgres clone <SOURCE-POSTGRES-NAME> <NEW-POSTGRES-NAME> \
      --team <TEAM> \
      --environment <ENVIRONMENT> \
      --at "2026-11-16 12:00"
    ```

    Times without an offset use your computer's local time zone. Use RFC3339 with `Z` or an explicit offset to specify an absolute time, for example `2026-11-16T12:00:00Z`.

    Review the configuration and confirm. To override the source's resource or high-availability settings, see the [clone flags](../reference/cloning.md#cli-flags).

    Check progress with:

    ```bash
    nais postgres get <NEW-POSTGRES-NAME> --team <TEAM> --environment <ENVIRONMENT>
    ```

    Wait until **Clone status** is **Completed** and **Status** is **Ready**.

=== "Console"

    1. Open your team in [Nais Console :octicons-link-external-16:](https://console.nais.io) and select **Postgres**.
    2. Select **Create Postgres**, then the **Clone existing database** tab.
    3. Select the environment and source database, and enter a name for the new database.
    4. Leave **Specify time** closed to use the latest available point, about 10 minutes ago. To restore to a specific time, open it and enter a time in your browser's local time zone, within the available recovery window.
    5. Optionally, open **Customize resources** to change CPU, memory, disk size or high availability. Keep the disk at least as large as the source's.
    6. Select **Clone database**. Follow the clone status on the new database's page and wait until cloning completes and the database is ready.

If the source has no available recovery window, wait for its backups before trying again. If the default clone point is too early for a newly created source, wait or specify a time within its recovery window.

Do not connect workloads to a failed clone. See [Postgres cloning](../reference/cloning.md) for inherited settings, time limits and completion status.

Inspect the cloned data by [connecting as a personal user](personal-access.md) with the new database's name. This does not affect workload traffic.

## Move workloads to the clone

1. Pause writes from the workloads you want to move.
2. Change `uses.postgres[].name` in each workload's manifest to the new database's name:

    ```yaml title="app.yaml"
    spec:
      uses:
        postgres:
          - name: <NEW-POSTGRES-NAME>
    ```

    Keep any existing `role` and `envPrefix` settings. See [Use Postgres in a workload](use-in-workload.md).

3. Deploy the changed workloads and verify that they connect to the clone and use the expected data.
4. Resume writes when verification is complete.

Do not delete the source database until cloning has completed, you have verified the data and no workloads still use it.
