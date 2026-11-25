---
tags: [persistence, postgres, explanation]
---

# Postgres

!!! warning "Preview"
    Postgres is currently in preview. This means that it's ready for use, but it still might have some rough edges - so keep this in mind when evaluating it for your workloads. If you have any feedback or issues, please reach out to us in the #nais channel on Slack.

Postgres gives your Applications and Jobs a managed PostgreSQL database. You can create a database yourself and connect your workloads to it.

Postgres automatically creates and manages credentials for your workloads. You can also get short-lived personal access from the Nais CLI when you need to inspect the database.

Postgres supports point-in-time recovery within a window you choose (2 to 30 days, default 2). You can clone a database from its backups, either from the latest available point or from a specific time. The clone is a separate database that you can inspect without affecting existing workloads.

## Sharing a database

Give each service its own database by default. Workloads that belong to the same service, such as an Application and its migration Job, can share a database. The service owns the data and schema.

Avoid using a shared database to pass data between applications that need to change independently. Even a read-only consumer depends on the schema: renaming a column can break another application. Use an API or publish events when other applications need the data.

If you share a database, agree on who owns the schema, who runs migrations, and how you’ll coordinate schema changes and restores. Give each workload only the access it needs.

For more on the trade-off, see [Integration Database by Martin Fowler :octicons-link-external-16:](https://martinfowler.com/bliki/IntegrationDatabase.html).

## Next steps

[:dart: Create Postgres](how-to/create.md)

[:dart: Manage Postgres](how-to/manage.md)

[:dart: Connect a workload](how-to/use-in-workload.md)

[:dart: Connect as a personal user](how-to/personal-access.md)

[:dart: Clone or restore a database](how-to/restore-point-in-time.md)

[:dart: Delete Postgres](how-to/delete.md)

[:books: Available extensions](reference/extensions.md)

[:books: Postgres cloning](reference/cloning.md)

[:books: Postgres recovery window](reference/recovery-window.md)

[:books: Postgres workload credentials](reference/workload-credentials.md)

[:books: Postgres personal access](reference/personal-access.md)

[:books: Postgres manifest reference](reference/spec.md)
