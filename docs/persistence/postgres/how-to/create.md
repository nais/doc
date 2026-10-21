---
tags: [postgres, how-to]
---

# Create Postgres

Create a Postgres database.

=== "GitOps"

    Create `.nais/postgres.yaml` in your repository:

    ```yaml title=".nais/postgres.yaml"
    version: v1
    type: Postgres
    name: <POSTGRES-NAME>
    spec:
      majorVersion: "18"
    ```

    Replace `<POSTGRES-NAME>` with the name of your database. See the [Postgres manifest reference](../reference/spec.md#majorversion) for the field definition, or review the [full example](../reference/example.md) if you need to set resources or high availability.

    Apply the manifest from your deploy workflow:

    ```yaml title=".github/workflows/deploy-nais-resources.yml"
    name: Deploy Nais resources
    on:
      push:
        branches: [main]
        paths:
          - ".nais/**"
    jobs:
      deploy:
        runs-on: ubuntu-latest
        permissions:
          contents: read
          id-token: write
        steps:
          - uses: actions/checkout@v6
          - uses: nais/setup@v1
            with:
              team: <TEAM>
          - name: Apply Postgres
            run: nais apply .nais/postgres.yaml --environment <ENVIRONMENT>
    ```

    See [Deploy manifest changes without rebuilding](../../../build/how-to/deploy-pipeline.md#deploy-manifest-changes-without-rebuilding) for a complete pipeline example. To change settings later, edit the manifest or see [Manage Postgres](manage.md?tab=gitops).

=== "CLI"

    Create a Postgres database:

    ```bash
    nais alpha postgres create <POSTGRES-NAME> --team <TEAM> --environment <ENVIRONMENT>
    ```

    The CLI asks for confirmation before creating the database. It uses platform defaults unless you set options:

    ```bash
    nais alpha postgres create <POSTGRES-NAME> \
      --team <TEAM> \
      --environment <ENVIRONMENT> \
      --high-availability \
      --cpu 100m \
      --memory 512Mi \
      --disk-size 10Gi
    ```

    To change settings later, see [Manage Postgres](manage.md?tab=cli).

=== "Console"

    1. Open your team in [Nais Console](https://console.nais.io) and select **Postgres**.
    2. Select **Create Postgres**.
    3. Fill in the form and select **Create Postgres**.

    To change settings later, see [Manage Postgres](manage.md?tab=console).

Provisioning continues asynchronously. Follow the status on the database's page in [Nais Console](https://console.nais.io).

[:dart: Connect an Application or Job](use-in-workload.md)
