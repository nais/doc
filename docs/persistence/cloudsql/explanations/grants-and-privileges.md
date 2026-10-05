---
title: Grants and privileges
tags: [postgres, cli, access, grants, privileges, explanation]
---

[`nais cloudsql prepare`](../how-to/personal-access.md#grant-database-privileges) grants PostgreSQL privileges, not login access. By default, it grants `USAGE` on the schema and `SELECT` on existing tables and sequences to `cloudsqliamuser`. It also sets default `SELECT` privileges for future objects created by the application user. Tables owned by other users might need separate grants from their owner.

IAM group users inherit database privileges from their **group role**, not necessarily from `cloudsqliamuser`. Use `--group <GROUP_EMAIL>` to grant to an existing Cloud SQL IAM group instead. The `--schema` flag selects a schema other than `public`.

With `--all-privileges`, the recipient gets `ALL` on existing tables and sequences, `CREATE` on the schema, and default `ALL` privileges for future objects created by the application user. This is broader than read access and does not resolve authentication failures.

However, making changes to the database is best done through the application or through database migration scripts (such as [Flyway](https://flywaydb.org/), [Liquibase](https://www.liquibase.org/), or [Alembic](https://alembic.sqlalchemy.org/)) that run as part of the application startup.

Read more about PostgreSQL privileges in the official [PostgreSQL documentation](https://www.postgresql.org/docs/current/sql-grant.html).
