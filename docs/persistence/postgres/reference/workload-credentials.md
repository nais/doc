---
tags: [postgres, reference]
---

# Postgres workload credentials

When an Application or Job uses a Postgres database, Postgres provides connection settings as environment variables. Workloads authenticate with TLS client certificates; no password is provided.

## Environment variables

Each credential set contains these variables:

| Variable | Value |
| --- | --- |
| `PGHOST` | Database hostname |
| `PGPORT` | Database port |
| `PGDATABASE` | Database name |
| `PGUSER` | Database username |
| `PGSSLMODE` | TLS verification mode |
| `PGSSLCERT` | Path to the workload's client certificate |
| `PGSSLKEY` | Path to the workload's client key |
| `PGSSLROOTCERT` | Path to the CA certificate |

## Roles and prefixes

The `role` controls which credential sets the workload receives:

| Role | Credential prefixes | Intended use |
| --- | --- | --- |
| `admin` | Unprefixed and `READWRITE_` | Schema migrations and ordinary application traffic |
| `readwrite` | `READWRITE_` | Ordinary application traffic |
| `read` | `READ_` | Read-only application traffic |

`admin` is the default role.

For example, a `readwrite` credential has variables such as `READWRITE_PGHOST` and `READWRITE_PGDATABASE`.

When you set `envPrefix`, it is prepended before the role prefix. With `envPrefix: MYDB_`, a `readwrite` credential has variables such as `MYDB_READWRITE_PGHOST`.

When `envPrefix` is not set, PostgreSQL clients that support standard `PG*` environment variables work out of the box with the unprefixed `admin` credentials. Use the `READWRITE_` credentials for the long-running application process when the workload also runs schema migrations.
