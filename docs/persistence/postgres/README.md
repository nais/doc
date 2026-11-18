---
tags: [persistence, postgres, explanation]
---

# Postgres

!!! warning "Preview"
    Postgres is currently in preview. This means that it's ready for use, but it still might have some rough edges - so keep this in mind when evaluating it for your workloads. If you have any feedback or issues, please reach out to us in the #nais channel on Slack.

Postgres gives your Applications and Jobs a managed PostgreSQL database. You can create a database yourself and connect your workloads to it.

Postgres automatically creates and manages credentials for your workloads. You can also get short-lived personal access from the Nais CLI when you need to inspect the database.

Postgres keeps backups continuously. You can clone a database from its backups, either from the latest available point or from a specific time. The clone is a separate database that you can inspect without affecting existing workloads.

## Next steps

[:dart: Create Postgres](how-to/create.md)

[:dart: Manage Postgres](how-to/manage.md)

[:dart: Connect a workload](how-to/use-in-workload.md)

[:dart: Connect as a personal user](how-to/personal-access.md)

[:dart: Clone or restore a database](how-to/restore-point-in-time.md)

[:dart: Delete Postgres](how-to/delete.md)

[:books: Available extensions](reference/extensions.md)

[:books: Postgres cloning](reference/cloning.md)

[:books: Postgres workload credentials](reference/workload-credentials.md)

[:books: Postgres personal access](reference/personal-access.md)

[:books: Postgres manifest reference](reference/spec.md)
