---
tags: [postgres, how-to]
---

# Manage Postgres

Use this how-to to manage your Postgres settings such as resources and major versions. 

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


Reconciliation continues asynchronously. Check the Postgres status with:

```bash
nais alpha postgres get <POSTGRES-NAME> --team <TEAM> --environment <ENVIRONMENT>
```

[:dart: Connect an Application or Job](use-in-workload.md)
