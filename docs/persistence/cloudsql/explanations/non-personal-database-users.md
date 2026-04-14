---
title: Non-personal database users
tags: [postgres, credentials, users, iam, audit, explanation]
---

# Non-personal database users in Cloud SQL

This page documents the non-personal users in Google Cloud SQL for PostgreSQL on Nais. It covers the default setup (golden path). Manual deviations — such as setting a password on the `postgres` user directly in Cloud SQL — are your team's responsibility to document.

## Overview

| User type | Why it exists | Who controls the password | Can anyone at Nav log in? | What is logged |
|---|---|---|---|---|
| `cloudsql*` system users | Google's internal management of the instance | Google (not accessible to Nav) | No | Admin Activity (always on) |
| `postgres` | Default admin user in PostgreSQL | Not set by Nais | Not via Nais (see details) | Admin Activity (always on) |
| Application user | Your app's connection to the database | Nais generates a random password | Only the application pod | Not logged by pgAudit |
| Personal user (IAM) | Developer access for debugging and operations | None — IAM token | Yes, time-limited | pgAudit + Cloud Audit |

For each user, this page covers:

1. Why the user exists
2. What the user has access to
3. How passwords and secrets are managed, and who has access
4. Whether anyone at Nav can log in as the user

## Google system users

Cloud SQL creates a set of system users that Google uses to operate the database instance.
No one at Nav — neither the Nais team nor product teams — can log in as these users.
Google controls the passwords, and they are not accessible to us.

You cannot delete, modify, or assign roles to system users. See [Google's documentation](https://cloud.google.com/sql/docs/postgres/users#cloud_sql_system_users_and_roles) for details.

| User | Purpose | Can anyone at Nav log in? |
|---|---|---|
| `cloudsqladmin` | Google's internal superuser for instance administration | No |
| `cloudsqlagent` | Database monitoring | No |
| `cloudsqlimportexport` | Data import and export (CSV) | No |
| `cloudsqlreplica` | Replication | No |
| `cloudsqlconnpooladmin` | Connection pooling | No |
| `cloudsqllogical` | Logical replication | No |
| `cloudsqlobservability` | Query insights and active queries | No |

### cloudsqlsuperuser (role, not a user)

`cloudsqlsuperuser` is a **role**, not a user. No one can log in as `cloudsqlsuperuser`.
The role grants extended privileges such as creating extensions and event triggers.
Google automatically assigns this role to the `postgres` user and to new users created via the Cloud SQL API.

## The postgres user

Every Cloud SQL instance gets a `postgres` user at creation. This user has the `cloudsqlsuperuser` role with `CREATEROLE`, `CREATEDB`, and `LOGIN` privileges. It does **not** have `SUPERUSER` or `REPLICATION`.

Nais does not use the `postgres` user for anything. Your application gets its own dedicated user (see next section). Nais does not set a password for the `postgres` user, and it is not used in the default setup.

!!! note
    Your team can in principle set a password on the `postgres` user manually via the Cloud SQL console. This is outside the Nais golden path, and your team is then responsible for documenting and managing that user.

## The application user

When you deploy an application with `spec.gcp.sqlInstances` in your nais manifest, Nais automatically creates:

- A `SQLInstance` (the database instance in your team's GCP project)
- A `SQLDatabase` (the database itself)
- A `SQLUser` (the application user)
- An `IAMPolicyMember` (grants your app's service account `roles/cloudsql.client`)

This all happens via [Config Connector (CNRM)](https://cloud.google.com/config-connector/docs/overview), Google's Kubernetes operator for GCP resources.

### Password

Nais generates a random password for the application user and stores it in a Kubernetes Secret in your team's namespace. The secret is named `google-sql-<appname>` and contains:

- `_USERNAME` — the username
- `_PASSWORD` — the generated password
- `_HOST`, `_PORT`, `_DATABASE` — connection details
- `_URL` — a complete connection string (postgres://)
- `_JDBC_URL` — a complete JDBC connection string

The password is exposed to your application via the Kubernetes Secret. During normal operation, only the pod reads the secret. Human access requires explicit Kubernetes access to your team's namespace, which is a separate access control and audit concern.

For instances on private IP (shared VPC), [sqeletor](https://github.com/nais/sqeletor) handles secrets instead. Sqeletor generates a 32-byte random password using `crypto/rand` and additionally includes SSL certificate paths and `sslmode=verify-ca` in the secret.

### Source code

- User and secret creation: [`nais/naiserator` — user.go](https://github.com/nais/naiserator/blob/master/pkg/resourcecreator/google/sql/user.go)
- Instance creation (with `cloudsql.iam_authentication = "on"`): [`nais/naiserator` — instance.go](https://github.com/nais/naiserator/blob/master/pkg/resourcecreator/google/sql/instance.go)
- Secret handling for private IP: [`nais/sqeletor` — sqluser_controller.go](https://github.com/nais/sqeletor/blob/main/internal/controller/sqluser_controller.go)

## Personal access

Developers at Nav get personal access to databases via the `nais postgres` commands. Access is based on Google Cloud IAM, not passwords.

The flow:

1. `nais postgres prepare` — one-time setup that grants IAM users read access to the public schema
2. `nais postgres grant` — creates a time-limited IAM user for the developer
3. `nais postgres proxy` — starts a secure tunnel to the database

You log in with your personal `@nav.no` Google account. Authentication uses IAM tokens, not passwords. Access is time-limited and logged in Cloud Audit.

**Who can grant access:** Any developer with access to `nais postgres` can grant themselves time-limited access to databases belonging to their team. The grant happens via IAM and is logged in Cloud Audit Logs (Admin Activity). Your team controls who has access to the `nais postgres` commands through team membership in Nais Console.

See [Personal database access](../how-to/personal-access.md) for a step-by-step guide.

## Audit logging

### Cloud Audit Logs (automatic)

Google automatically writes [Cloud Audit Logs](https://cloud.google.com/sql/docs/postgres/audit-logging) for Cloud SQL. There are two relevant categories:

**Admin Activity** (always on, cannot be disabled):

- Creation, modification, and deletion of instances, databases, and users
- IAM policy changes
- Backup and restore

**Data Access** (can be enabled separately):

- Connections to the instance
- Metadata reads

Admin Activity covers most control requirements. None of these logs show what happens *inside* the database (queries, data changes) — that requires pgAudit.

### pgAudit (opt-in)

To log what happens *inside* the database, use [pgAudit](../how-to/enable-auditing.md). pgAudit is **not enabled by default** — you must enable it yourself.

To enable pgAudit:

1. Set the flags `cloudsql.enable_pgaudit`, `pgaudit.log`, and `pgaudit.log_parameter` in your nais manifest
2. Run `nais postgres enable-audit` to install the pgAudit extension and configure logging

The default configuration logs `write`, `ddl`, and `role` for personal users — that is, write operations, schema changes, and role changes. Read operations (`read`) are not logged unless you configure it explicitly. The application user is excluded (`pgaudit.log = 'none'`) to avoid noise from normal application traffic.

Source code: [`nais/cli` — audit.go](https://github.com/nais/cli/blob/main/internal/postgres/audit.go)

### Audit log storage

Nais sends audit logs to dedicated Cloud Logging buckets per instance. For systems with strict retention requirements:

- **Searchable short-term storage**: Up to two years in a Cloud Logging bucket. Logs are searchable via the Cloud Logging UI.
- **Long-term archive**: Up to 11 years in a separate Cloud Storage bucket with a retention lock. These logs are not directly searchable but can be retrieved on demand (e.g., for audits).
- Both buckets are locked — teams cannot modify or delete logs.

## References

- [Google: Cloud SQL PostgreSQL Users](https://cloud.google.com/sql/docs/postgres/users) — official documentation of system and default users
- [Google: Cloud SQL Audit Logging](https://cloud.google.com/sql/docs/postgres/audit-logging) — Cloud Audit Logs for Cloud SQL
- [Personal database access](../how-to/personal-access.md) — guide for personal access
- [Enable audit logging](../how-to/enable-auditing.md) — guide for pgAudit
- [Cloud SQL credentials](cloud-sql-credentials.md) — credential handling explained
- [`nais/naiserator`](https://github.com/nais/naiserator) — creates SQLInstance, SQLDatabase, SQLUser, and secrets
- [`nais/sqeletor`](https://github.com/nais/sqeletor) — handles secrets and network policy for private IP
- [`nais/cli`](https://github.com/nais/cli) — CLI for personal access and audit setup
