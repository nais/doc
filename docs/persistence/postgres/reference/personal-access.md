---
tags: [postgres, reference]
---

# Postgres personal access

The `nais alpha postgres psql` and `nais alpha postgres proxy` commands grant your personal user temporary access to a Postgres database. For usage, see [Connect to Postgres as a personal user](../how-to/personal-access.md).

## Audit logging

Audit logging is enabled automatically for personal database users. It is disabled for workload users.

The platform configures these pgAudit parameters:

| Parameter | Value | Effect |
| --- | --- | --- |
| `pgaudit.log` | `read, write, ddl, role` | Log reads, writes, schema changes and role changes |
| `pgaudit.log_relation` | `on` | Log each relation referenced by a read or write statement separately |
| `pgaudit.log_parameter` | `on` | Include SQL parameter values |

## Access levels

| Level | Allows |
| --- | --- |
| `read` | Read data (default) |
| `write` | Change data |
| `admin` | Change database objects |

`--access-level <LEVEL>` selects the access level.

## Access flags

| Flag | Description |
| --- | --- |
| `--reason` | Required. Reason for the access, minimum 10 characters |
| `--ttl` | How long the access lasts. Default 30 minutes, maximum 1 hour |
| `--branch` | Branch to connect to. Defaults to the active branch |
