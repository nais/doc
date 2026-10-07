---
title: Migrate to new instance
tags: [postgres, migrate, how-to]
---

# Migrate to a new Cloud SQL instance

Nais no longer provides database migration tooling. For data migration, follow [Google's PostgreSQL Database Migration Service guidance :octicons-link-external-16:](https://docs.cloud.google.com/database-migration/docs/postgres/create-migration-job). Google's guide does not cover switching your Nais Application to the destination instance.

!!! warning
    Instance settings are managed from your Application manifest. Changing `spec.gcp.sqlInstances[].name` is not a data migration and may create new resources.

If your goal is to [shrink disk size](shrink-disk.md) or [upgrade PostgreSQL](upgrade-postgres.md), use those guides instead.
