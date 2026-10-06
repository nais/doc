---
tags: [postgres, how-to]
---

# Create Postgres

Create a Postgres database. PostgreSQL `18` is the supported version in preview.

Choose the workflow you want to use as the source of truth.

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

=== "API (experimental)"

    Start a local proxy authenticated as your user:

    ```bash
    nais api proxy
    ```

    Open the GraphQL playground at `http://localhost:4242`. Create a Postgres database with this mutation:

    ```graphql
    mutation CreatePostgres($input: CreatePostgresInput!) {
      createPostgres(input: $input) {
        postgres {
          name
          majorVersion
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
        "majorVersion": "18"
      }
    }
    ```

    The GraphQL API is in beta. For service-account authentication and programmatic access, see [Nais API](../../../operate/console/api.md). To change settings later, see [Manage Postgres](manage.md?tab=api-experimental).

Provisioning continues asynchronously. Check the Postgres status with:

```bash
nais alpha postgres status <POSTGRES-NAME> --team <TEAM> --environment <ENVIRONMENT>
```

The first branch is named `main`. Wait until the status is `Ready` and the active branch is `main` before connecting a workload. If provisioning is still in progress, the status shows a reason and the state of each branch.

Nais Console does not currently support creating Postgres.

[:dart: Connect an Application or Job](use-in-workload.md)
