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
| `PGSSLKEY` | Path to the workload's PEM client key |
| `PGSSLROOTCERT` | Path to the CA certificate |
| `PGJDBCURL` | JDBC URL for pgJDBC, including username and TLS settings |

`PGJDBCURL` uses `sslmode=verify-full` and includes paths to the CA certificate, client certificate and PKCS#8 DER key.

## Certificate and key files

Each credential set has files under `/var/run/secrets/nais.io/postgres/<postgres>/<credential>/`, where `<credential>` is `admin`, `read` or `readwrite`:

| File | Format and use |
| --- | --- |
| `tls.crt` | PEM client certificate |
| `tls.key` | PEM private key, referenced by `PGSSLKEY` |
| `tls.pk8` | The same private key in unencrypted PKCS#8 DER format, referenced by `PGJDBCURL` |

The shared CA certificate is at `/var/run/secrets/nais.io/postgres/<postgres>/ca.crt`.

## Roles and prefixes

The `role` controls which credential sets the workload receives:

| Role | Credential prefixes | Intended use |
| --- | --- | --- |
| `admin` | Unprefixed and `READWRITE_` | Schema migrations and ordinary application traffic |
| `readwrite` | `READWRITE_` | Ordinary application traffic |
| `read` | `READ_` | Read-only application traffic |

`admin` is the default role.

For example, a `readwrite` credential has variables such as `READWRITE_PGHOST` and `READWRITE_PGJDBCURL`.

When you set `envPrefix`, it is prepended before the role prefix. With `envPrefix: MYDB_`, a `readwrite` credential has variables such as `MYDB_READWRITE_PGJDBCURL`.

When `envPrefix` is not set, PostgreSQL clients that support standard `PG*` environment variables work out of the box with the unprefixed `admin` credentials. Use the `READWRITE_` credentials for the long-running application process when the workload also runs schema migrations.
