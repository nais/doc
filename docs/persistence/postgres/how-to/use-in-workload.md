---
tags: [postgres, how-to]
---

# Use Postgres in a workload

Add the database to your Application or Job manifest in the same team and environment:

```yaml title="app.yaml"
spec:
  uses:
    postgres:
      - name: <POSTGRES-NAME>
```

Replace `<POSTGRES-NAME>` with the database name you used in [Create Postgres](create.md), then deploy the workload as usual. If you do not already have deployment set up, see [Build and deploy with GitHub Actions](../../../build/how-to/build-and-deploy.md).

## Credentials

The default `admin` role is intended for workloads that run schema migrations. It provides two sets of credentials:

- **Migration credentials** use the standard `PG*` environment variables. Use them for Flyway or other migration tools.
- **Runtime credentials** use the same connection settings with the `READWRITE_` prefix. Use them in the long-running application process.

This separation is best practice: the running application does not need privileges to change the database schema. PostgreSQL clients that support the standard `PG*` environment variables pick up the migration credentials automatically; configure the application to use the `READWRITE_` variables for ordinary traffic. Workload connections use TLS client certificates instead of passwords.

If the workload does not run migrations, use the least-privileged `readwrite` or `read` role instead. When using more than one Postgres database, set a unique `envPrefix` to keep the environment variables separate.

See [Postgres workload credentials](../reference/workload-credentials.md) for the complete environment-variable list and prefix rules. See `uses.postgres` in the [Application manifest reference](../../../workloads/application/reference/spec.md#usespostgres) or [Job manifest reference](../../../workloads/job/reference/spec.md#usespostgres) for the manifest fields.
