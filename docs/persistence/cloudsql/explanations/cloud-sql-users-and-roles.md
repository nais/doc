---
title: Cloud SQL System Users and Roles
tags: [postgres, system users, explanation]
---

## Users and roles in Cloud SQL PostgreSQL

Every Cloud SQL PostgreSQL instance comes with a fixed set of system users and roles managed by Google. On top of these, Nais creates application-specific users via ConfigConnector. 
Understanding the distinction helps when troubleshooting permissions or auditing database access.

For the full upstream reference, see [Cloud SQL PostgreSQL users and roles](https://cloud.google.com/sql/docs/postgres/users).

### Summary

| Name                             | Type | Can log in | Always present                                        |
|----------------------------------|------|------------|-------------------------------------------------------|
| `cloudsqladmin`                  | User | No         | Yes                                                   |
| `cloudsqlagent`                  | User | No         | When monitoring is configured                         |
| `cloudsqlconnpooladmin`          | User | No         | When Managed Connection Pooling is enabled            |
| `cloudsqlimportexport`           | User | No         | Yes                                                   |
| `cloudsqllogical`                | User | No         | When logical replication is configured                |
| `cloudsqlreplica`                | User | No         | When replication is configured                        |
| `cloudsqlobservability`          | User | No         | When database observability is enabled                |
| `postgres`                       | User | Yes        | Yes                                                   |
| Team IAM database user           | User | Yes        | When IAM database auth is enabled                     |
| Team IAM service account user    | User | Yes        | When IAM database auth is enabled                     |
| Application user                 | User | Yes        | When nais user has requested instance via `nais.yaml` |
| `cloudsqliamgroup`               | Role | No         | When IAM group auth is enabled                        |
| `cloudsqlinactiveuser`           | Role | No         | When IAM group auth is enabled                        |
| `cloudsqliamgroupserviceaccount` | Role | No         | When IAM group auth is enabled                        |
| `cloudsqliamgroupuser`           | Role | No         | When IAM group auth is enabled                        |
| `cloudsqliamserviceaccount`      | Role | No         | Yes                                                   |
| `cloudsqliamuser`                | Role | No         | Yes                                                   |
| `cloudsqlsuperuser`              | Role | No         | Yes                                                   |

### System users

These users are created and managed by Google. You cannot drop or modify them.

**`cloudsqladmin`**

Used by Google internally for instance maintenance. Not accessible to customers and cannot be dropped or modified.

**`cloudsqlimportexport`**

A system user created with the minimal set of privileges needed for CSV import and export operations. If you do not create your own user for import/export, Cloud SQL uses this user automatically. You cannot use or modify it directly.

**`cloudsqlagent`**

Used for monitoring databases. Created by Cloud SQL when database monitoring features are enabled. Not accessible to customers.

**`cloudsqlconnpooladmin`**

Used for Managed Connection Pooling. Created when the Managed Connection Pooling feature is enabled on the instance. Not accessible to customers.

**`cloudsqllogical`**

Used for building logical replication. Created when logical replication and decoding is configured on the instance. Not accessible to customers.

**`cloudsqlobservability`**

Used for database observability features such as the index advisor and active query monitoring. Created when observability features are enabled. Not accessible to customers.

**`cloudsqlreplica`**

Used for replication. Created when the instance is configured with read replicas. Not accessible to customers.

**`postgres`**

The default administrative login user, present on every instance from provisioning. It holds the `cloudsqlsuperuser` role and is the typical starting point for initial setup tasks such as creating schemas or granting privileges.
`postgres` is _not_ a full PostgreSQL superuser. Cloud SQL restricts certain superuser operations — for example, reading `pg_shadow` or loading arbitrary extensions is not permitted.

### System roles

These are PostgreSQL roles (not login users). They are always present on the instance as role definitions and are assigned to users as needed.

**`cloudsqlsuperuser`**

Automatically granted to every user created through the Cloud SQL API or Console. It provides elevated privileges within the Cloud SQL managed environment — including `CREATEROLE` and `CREATEDB` — but does not map to a full native PostgreSQL superuser. Privileged operations such as accessing `pg_shadow` or loading extensions without restriction remain blocked.

**`cloudsqliamgroup`**

Designates a non-login IAM group authentication account. Assigned to accounts used for IAM group authentication (where a Google group is mapped to database access), rather than individual IAM users.

**`cloudsqliamgroupuser`**

Designates an IAM user who authenticates using IAM group authentication. Assigned in addition to `cloudsqliamuser` when the user authenticates via an IAM group mapping.

**`cloudsqliamgroupserviceaccount`**

Designates an IAM service account that authenticates using IAM group authentication. The service account equivalent of `cloudsqliamgroupuser`.

**`cloudsqlinactiveuser`**

Designates an IAM group authentication account as inactive. Used internally to track and manage deprovisioned or suspended group members.

**`cloudsqliamuser`**

Granted to PostgreSQL users that authenticate via Cloud IAM (human user identities). The role is always present as a definition on the instance but is only assigned when IAM database authentication is in use.

**`cloudsqliamserviceaccount`**

Like `cloudsqliamuser`, but for service account identities authenticating via IAM. Always present as a role definition; only assigned when IAM service account authentication is configured.

### NAIS created users

**IAM database users**

Created when [Cloud IAM database authentication :octicons-link-external-16:](https://cloud.google.com/sql/docs/postgres/iam-authentication) is enabled and team has created [personal user accounts](https://doc.nais.io/persistence/cloudsql/how-to/personal-access/). The username is the IAM user's email address, truncated to fit PostgreSQL identifier limits. These users are granted the `cloudsqliamuser` role.

**IAM service account users**

Created when IAM authentication is used for service accounts. The username is the service account email address (truncated). These users are granted the `cloudsqliamserviceaccount` role.

**Application users**

When your application requests a Cloud SQL instance in `nais.yaml`, Nais uses ConfigConnector to automatically create a dedicated PostgreSQL login user for that application. The credentials are injected into the application pod as environment variables.

These users are regular PostgreSQL login users. They receive `cloudsqlsuperuser`-derived privileges scoped to the application's own database and are the credentials your application code should use at runtime.