---
tags: [postgres, how-to]
---

# Manage Postgres

Change CPU, memory, disk size or high availability. PostgreSQL 18 is the only supported major version in preview; the CLI update command does not change the major version.

For a Postgres managed in Git, update the manifest. A later `nais apply` can overwrite changes made through the CLI or Console.

=== "GitOps"

    Edit the Postgres manifest in your repository:

    ```yaml title=".nais/postgres.yaml"
    version: v1
    type: Postgres
    name: <POSTGRES-NAME>
    spec:
      majorVersion: "18"
      highAvailability: true
      resources:
        cpu: 100m
        memory: 512Mi
        diskSize: 20Gi
    ```

    Push the change. The next workflow run applies the new desired state. See [Deploy manifest changes without rebuilding](../../../build/how-to/deploy-pipeline.md#deploy-manifest-changes-without-rebuilding) for a complete pipeline example.

=== "CLI"

    Update one or more settings:

    ```bash
    nais postgres update <POSTGRES-NAME> \
      --team <TEAM> \
      --environment <ENVIRONMENT> \
      --disk-size 20Gi
    ```

    The update command accepts `--high-availability true|false`, `--cpu`, `--memory` and `--disk-size`. Omitted settings stay unchanged.

=== "Console"

    1. Open your team in [Nais Console](https://console.nais.io) and select **Postgres**.
    2. Select the database.
    3. Open **Actions → Edit**.
    4. Update the form and select **Save changes**.

Changes are applied asynchronously. Follow the status on the database's page in [Nais Console](https://console.nais.io).

[:dart: Connect an Application or Job](use-in-workload.md)
