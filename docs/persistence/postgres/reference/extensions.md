---
tags: [postgres, reference]
---

# Postgres extensions

Postgres supports extensions bundled with PostgreSQL and extensions mounted from platform image catalogs. Available extensions are not necessarily enabled in your database. `plpgsql` is installed by default; the platform manages `pgaudit` and `pg_stat_statements`.

## Additional extensions

| Extension name | Purpose |
| --- | --- |
| `pgaudit` | SQL audit logging, configured by the platform |
| `pg_stat_statements` | Query statistics, configured by the platform |
| `postgis` | Spatial data and queries, mounted from the image catalog |
| `timescaledb` | Time-series data, mounted from the image catalog and preloaded by the platform |
| `vector` | Vector storage and similarity search (pgvector) |

The extension names are `vector` for pgvector and `timescaledb` for TimescaleDB, not `pgvector` or `timescaledb-oss`. The platform-managed extensions `pgaudit` and `pg_stat_statements` cannot be requested in `spec.extensions`.

## Supported bundled extensions

| Area | Extension names |
| --- | --- |
| Indexes and search | `bloom`, `btree_gin`, `btree_gist`, `pg_trgm` |
| Data types and text | `citext`, `cube`, `earthdistance`, `fuzzystrmatch`, `hstore`, `intarray`, `isn`, `ltree`, `seg`, `unaccent` |
| Functions and utilities | `lo`, `pgcrypto`, `tablefunc`, `tcn` |
| Inspection and maintenance | `amcheck`, `pageinspect`, `pg_buffercache`, `pg_freespacemap`, `pg_logicalinspect`, `pg_prewarm`, `pg_visibility`, `pg_walinspect`, `pgrowlocks`, `pgstattuple`, `sslinfo` |
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

Console exposes extension selection when creating or editing a database. When cloning, source extensions are kept and additional available extensions can be selected. The CLI create, update and clone commands do not expose extension selection; clone inherits the source's extensions. Declarative configuration uses the Postgres manifest.

The [manifest reference](spec.md#extensionsname) lists the accepted extension names. Console lists the extensions available in the selected environment.

PostgreSQL exposes the extensions available in the running image through `pg_available_extensions`:

```sql
SELECT name, default_version, installed_version
FROM pg_available_extensions
ORDER BY name;
```
