---
tags: [postgres, reference]
---

# Postgres personal access

The `nais postgres psql` and `nais postgres proxy` commands grant your personal user temporary access to a Postgres database. For usage, see [Connect to Postgres as a personal user](../how-to/personal-access.md).

## Audit logging

Audit logging is enabled automatically for personal database users. It is disabled for workload users.

The platform configures these pgAudit parameters:

```ini
pgaudit.log = 'read,write,ddl,role'
pgaudit.log_relation = on
pgaudit.log_parameter = on
```

These settings log:

- Reads, writes, schema changes and role changes
- Each relation referenced by a read or write statement separately
- SQL parameter values

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
