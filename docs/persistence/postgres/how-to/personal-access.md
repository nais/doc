---
tags: [postgres, how-to]
---

# Connect to Postgres as a personal user

Use this how-to to connect to a Postgres database with your personal user, for ad-hoc queries and inspection.

## Prerequisites

- You're a member of the [Nais team](../../../explanations/team.md) that owns the database
- You have the [Nais CLI :octicons-link-external-16:](https://cli.nais.io/) installed and are logged in with `nais login --nais`
- `psql` on `PATH`

The CLI grants temporary personal access: read-only access to the active branch for 30 minutes by default. For access levels, lifetime and branch selection, see [Postgres personal access](../reference/personal-access.md).

## Open `psql`

Connect to the active branch:

```bash
nais alpha postgres psql <POSTGRES-NAME> --team <TEAM> --environment <ENVIRONMENT> --reason "Investigating a database issue"
```

This opens `psql` against the `app` database with TLS verification.

## Use another PostgreSQL client

Start a local proxy:

```bash
nais alpha postgres proxy <POSTGRES-NAME> --team <TEAM> --environment <ENVIRONMENT> --reason "Investigating a database issue"
```

Keep the proxy running while your client is connected. The command prints the local listen address, database user, TLS server name and CA certificate path. Configure your client with:

- host: the printed TLS server name
- host address: the loopback IP address from the printed listen address
- port: the port from the printed listen address
- database: `app`, unless you use another database
- user: the printed database user
- SSL mode: `verify-full`
- root certificate: the printed CA certificate path

If your client requires a password, start the proxy with `--print-password` and use the printed password. Only print the password when you need it.
