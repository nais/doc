---
title: Grants and privileges
tags: [postgres, cli, access, grants, privileges, explanation]
---

When using the [`nais postgres prepare`](../how-to/personal-access.md#prerequisites) command, the user is granted some privileges in the database.

By default, the user is granted `SELECT` privileges on all tables and sequences in the default schema.

With the `--all-privs` flag, the user is granted `ALL` privileges on all tables and sequences in the default schema.
In addition, the user is granted `CREATE` on the default schema.

This should be enough to allow most maintenance tasks, but if you need more privileges, you can usually grant yourself the needed privileges.
If you find there are still some things you are unable to do, a common workaround is to make the changes via database-migration scripts (such as [Flyway](https://flywaydb.org/), [Liquibase](https://www.liquibase.org/), or [Alembic](https://alembic.sqlalchemy.org/)) that run as part of the application startup.
Since these scripts are run by the application user, such scripts can also be used to grant additional privileges to personal users if needed.

Read more about PostgreSQL privileges in the official [PostgreSQL documentation](https://www.postgresql.org/docs/current/sql-grant.html).
