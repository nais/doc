---
tags: [postgres, how-to]
---

# Delete Postgres

Deleting a Postgres irreversibly removes the database, its data and its backups.

Remove `uses.postgres` from all workloads that reference the database and deploy them. If the Postgres manifest is managed in Git, delete the manifest file so the next apply does not recreate the database.

Wait for any [clones](restore-point-in-time.md) that depend on the database to complete. Deletion is blocked while workloads, bindings or unfinished clones still reference it.

=== "CLI"

    Delete the Postgres:

    ```bash
    nais postgres delete <POSTGRES-NAME> --team <TEAM> --environment <ENVIRONMENT>
    ```

    The CLI asks for confirmation before deleting.

=== "Console"

    1. Open your team in [Nais Console](https://console.nais.io) and select **Postgres**.
    2. Select the database in the correct environment.
    3. Open **Actions → Delete**.
    4. Type `<ENVIRONMENT>/<POSTGRES-NAME>` to confirm, then select **Delete Postgres**.

Deletion continues asynchronously. The database can remain visible until cleanup completes.
