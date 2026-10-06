---
tags: [postgres, how-to]
---

# Manage Postgres

Change Postgres settings such as resources and high availability. Use the workflow that owns the setting.

!!! warning "Avoid competing sources of truth"

    If the manifest is managed in Git, make changes there. Direct CLI or API updates can be overwritten by the next manifest apply.

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
    nais alpha postgres update <POSTGRES-NAME> \
      --team <TEAM> \
      --environment <ENVIRONMENT> \
      --disk-size 20Gi
    ```

    The update command accepts `--high-availability true|false`, `--cpu`, `--memory` and `--disk-size`. Omitted settings stay unchanged.

=== "API (experimental)"

    Start a local proxy authenticated as your user:

    ```bash
    nais api proxy
    ```

    Open the GraphQL playground at `http://localhost:4242`. Update settings with `updatePostgres`. Omitted fields stay unchanged.

    ```graphql
    mutation UpdatePostgres($input: UpdatePostgresInput!) {
      updatePostgres(input: $input) {
        postgres {
          name
          highAvailability
        }
      }
    }
    ```

    Variables:

    ```json
    {
      "input": {
        "teamSlug": "<TEAM>",
        "environmentName": "<ENVIRONMENT>",
        "name": "<POSTGRES-NAME>",
        "diskSize": "20Gi"
      }
    }
    ```

    The GraphQL API is in beta. For service-account authentication and programmatic access, see [Nais API](../../../operate/console/api.md).

Reconciliation continues asynchronously. Check the Postgres status with:

```bash
nais alpha postgres status <POSTGRES-NAME> --team <TEAM> --environment <ENVIRONMENT>
```

The status shows readiness based on the active and requested branches, with a reason when it is not ready. It does not confirm that changes to resource settings have been applied.

The CLI and API update flows do not change the PostgreSQL major version. Nais Console does not currently support updating Postgres.

[:dart: Connect an Application or Job](use-in-workload.md)
