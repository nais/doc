---
title: Personal database access
tags: [postgres, password, credentials, cli, access, how-to]
---

Use your personal Google account to access a Cloud SQL database. Database privileges and login access are separate: `prepare` grants PostgreSQL privileges, but does not create an IAM database user or grant login access.

## Before you begin

- Install the [Nais CLI][nais-cli] and `psql` (for the `psql` command). Authenticate with `nais login` and connect naisdevice.
- Check that your account is registered on the Cloud SQL instance, either as an individual Cloud IAM user or through an IAM group added to the instance. A group member gets a Cloud SQL database user on first successful login. If neither is configured, ask someone with permission to [add an IAM user or group to the instance :octicons-link-external-16:](https://docs.cloud.google.com/sql/docs/postgres/add-manage-iam-users). `nais cloudsql grant` no longer exists. Do not add an individual IAM user if the same account is already a group user.

## Grant database privileges

Run this once for each schema whose tables you need to read. The default schema is `public`. For an individual IAM user, grant `SELECT` to the `cloudsqliamuser` role:

```bash
nais cloudsql prepare --team <TEAM> --environment <ENVIRONMENT> <MYAPP>
```

If you log in through a Cloud SQL IAM group, grant access to the **group role instead**:

```bash
nais cloudsql prepare --team <TEAM> --environment <ENVIRONMENT> --group <GROUP_EMAIL> <MYAPP>
```

Use `--schema <SCHEMA_NAME>` for a different schema. `prepare` uses the application credentials to grant privileges on existing tables and sequences and set default privileges for future objects created by the application user. It does not grant access to tables owned by other users.

Only use `--all-privileges` if you need to write or change database objects. It grants more than read access and does not fix authentication failures. See [Grants and privileges](../explanations/grants-and-privileges.md).

## Connect

For an interactive session, run:

```bash
nais cloudsql psql --team <TEAM> --environment <ENVIRONMENT> --reason "debugging issue" <MYAPP>
```

For a local database client, start the proxy and follow the printed connection details:

```bash
nais cloudsql proxy --team <TEAM> --environment <ENVIRONMENT> --reason "debugging issue" <MYAPP>
```

Use your personal Google account email as the username. The CLI proxy uses automatic IAM authentication, so leave the password blank when connecting **through this proxy**. It grants temporary `roles/cloudsql.instanceUser` access for one hour; an IAM database user or group must already be registered on the instance. The proxy also needs Cloud SQL Client permission to connect. Keep the proxy running while the client is connected.

If a client's **Test connection** returns `password authentication failed`, check whether it connects through the CLI proxy or directly to Cloud SQL. The blank-password instruction applies only to the CLI proxy. Through the proxy, use your personal IAM username and remove any saved password. Check the Cloud SQL instance's **Users** page for your individual user or IAM group (ask your team if you cannot view it). A `permission denied for table` error *after* connecting is a separate PostgreSQL privilege problem; check the schema and whether `prepare` targeted your individual role or your IAM group.

[nais-cli]: https://cli.nais.io
