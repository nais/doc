---
title: Change your Cloud SQL instance
tags: [postgres, migrate, how-to]
---

# Change your Cloud SQL instance

Nais no longer provides database migration tooling. Choose the procedure for the change you need.

!!! note "Looking for the old migration commands?"
    The [deprecated migration workflow](migrate-to-new-instance-legacy.md) is preserved on a single legacy page. It requires a CLI version that still includes `nais cloudsql migrate` and is not recommended for new migrations.

## Upgrade the PostgreSQL major version

[Upgrade PostgreSQL](upgrade-postgres.md) on your existing instance. You do not need to migrate to a new instance. Plan for application downtime while the upgrade runs.

## Reduce disk size

[Shrink disk size](shrink-disk.md) on your existing instance using `gcloud`. You do not need to migrate to a new instance.

## Move to private IP

For a legacy public-IP instance, use a new instance with private IP and move the data with [export/import :octicons-link-external-16:](https://docs.cloud.google.com/sql/docs/postgres/import-export/import-export-sql).

Plan for downtime. Stop writes to the source before the final export and keep them stopped until the application uses the destination. Check that your export method includes the database objects you need, and verify data and application-user permissions on the destination before switching.

!!! warning "Export/import does not switch your Application"
    Export/import moves data, but does not configure your Application's access or connection to the new instance. Instance settings are managed from your Application manifest. Changing `spec.gcp.sqlInstances[].name` is not a data migration and may create new resources.
