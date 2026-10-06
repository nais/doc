---
tags: [postgres, how-to]
---

# Connect to Postgres from your laptop

Install the [Nais CLI :octicons-link-external-16:](https://cli.nais.io/). To use `psql`, also install `psql`. Log in with `nais login --nais`. You need access to the team that owns the database.

The CLI requests temporary personal access. The reason must contain at least 10 characters, and access expires after 30 minutes by default; `--ttl` accepts up to one hour.

The access levels are:

- `read`: read data (default)
- `write`: change data
- `admin`: change database objects

Use `--access-level <LEVEL>` to request another access level. The `psql` and `proxy` commands use the active branch unless you set `--branch <BRANCH>`.

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
