---
tags: [postgres, reference]
---

# Postgres extensions

The PostgreSQL 18 image used by Postgres includes the extensions below. Available extensions are not necessarily enabled in your database. `plpgsql` is installed by default; the platform also configures `pgaudit` and `pg_stat_statements`.

## Additional extensions

| Extension name | Purpose |
| --- | --- |
| `pgaudit` | SQL audit logging, configured by the platform |
| `vector` | Vector storage and similarity search (pgvector) |

PostGIS is not included in the current image. The extension name for pgvector is `vector`, not `pgvector`.

## PostgreSQL bundled extensions

| Area | Extension names |
| --- | --- |
| Indexes and search | `bloom`, `btree_gin`, `btree_gist`, `pg_trgm` |
| Data types and text | `citext`, `cube`, `dict_int`, `dict_xsyn`, `earthdistance`, `fuzzystrmatch`, `hstore`, `intarray`, `isn`, `ltree`, `seg`, `unaccent` |
| Functions and utilities | `autoinc`, `insert_username`, `intagg`, `lo`, `moddatetime`, `pgcrypto`, `refint`, `tablefunc`, `tcn`, `uuid-ossp`, `xml2` |
| External data | `dblink`, `file_fdw`, `postgres_fdw` |
| Inspection and maintenance | `amcheck`, `pageinspect`, `pg_buffercache`, `pg_freespacemap`, `pg_logicalinspect`, `pg_prewarm`, `pg_stat_statements`, `pg_surgery`, `pg_visibility`, `pg_walinspect`, `pgrowlocks`, `pgstattuple`, `sslinfo` |
| Sampling | `tsm_system_rows`, `tsm_system_time` |
| Procedural language | `plpgsql` |

Inclusion in the image does not grant superuser privileges or access to server files and external hosts. Extension-specific privileges and network restrictions still apply.

## Configuration and inspection

[`spec.extensions`](spec.md#extensions) lists extensions to enable in the application database. For example:

```yaml
spec:
  extensions:
    - name: vector
```

The CLI create/update commands and the Console configuration form do not expose extension settings. Use the Postgres manifest for declarative configuration.

PostgreSQL exposes the extensions available in the running image through `pg_available_extensions`:

```sql
SELECT name, default_version, installed_version
FROM pg_available_extensions
ORDER BY name;
```
