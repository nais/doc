---
title: Legacy Cloud SQL migration (deprecated)
tags: [postgres, migrate, how-to, legacy, deprecated]
---

# Legacy Cloud SQL migration (deprecated)

!!! warning "Deprecated workflow"
    This page preserves the old `nais cloudsql migrate` workflow for teams that still need it. It is not recommended for new migrations. See [Change your Cloud SQL instance](migrate-to-new-instance.md) for the alternatives.

    You need an older Nais CLI version that still includes `nais cloudsql migrate`, such as [v5.58.1 :octicons-link-external-16:](https://github.com/nais/cli/releases/tag/v5.58.1). This guide does not apply to CLI versions where these commands have been removed.

The CLI saves migration configuration in the cluster and launches Naisjobs running [cloudsql-migrator :octicons-link-external-16:](https://github.com/nais/cloudsql-migrator). Each phase runs as a separate job. The migrator uses Google Database Migration Service to replicate data and handles the Nais resources and application switch.

The workflow has three phases:

1. [Set up](#setting-up-the-migration) the new SQLInstance and replication.
2. [Promote](#promoting-the-new-sqlinstance) the new SQLInstance and switch the application.
3. [Finalize](#finalizing-the-migration) by deleting the old SQLInstance and cleaning up migration resources.

[Rollback](#rolling-back-the-migration) is available before finalization, but does not copy data written to the destination back to the source.

## Preparations

!!! danger "Avoid schema changes and deployments"
    Do not make structural database (DDL) changes during migration, such as adding or removing tables or changing their structure. Avoid deploying your application unless instructed by the tool. Coordinate this with your team before starting.

- Use a [Nais CLI](../../../operate/cli/README.md) version that includes the migration commands. Check with `nais cloudsql migrate --help`.
- Choose a new SQLInstance name, different from the current instance name.
- Connect naisdevice.
- Ensure you have access to the cluster where the application runs.
- Check which [database connection environment variables](../reference/README.md#naming-conventions) your application reads. Without `envVarPrefix`, the variable names include the instance name and change at promotion. Prepare your application for the new names before starting. If you choose to set `envVarPrefix`, follow the linked reference's credential-reset requirements first.

!!! warning "Audit logging"
    Migration removes the source's `pgaudit` extension and the destination's pgaudit flags. Rollback does not restore audit logging. Plan for this gap and [re-enable auditing](enable-auditing.md) on the instance you keep after migration or rollback.

!!! warning "Phases are not transactional"
    A failed phase can leave resources behind or leave the application scaled down. Do not assume that a failed command has undone its changes.

## Setting up the migration

1. Run the setup command and follow the prompts:

    ```shell
    nais cloudsql migrate setup --team <team> --environment <environment> <appname> <new-sql-instance-name>
    ```

2. Use the URL returned by the command to check replication progress. Wait until replication is up to date before promoting. The initial data transfer can take time.

Setup takes a backup of the source and creates a temporary Application to provision the destination instance. It configures the source for logical replication, including database flags and the `pglogical` extension, then creates and starts the Google migration job.

!!! warning "Source administrator password"
    Setup changes the source instance's `postgres` password. Rollback does not restore its previous value.

## Promoting the new SQLInstance

!!! warning "Application downtime"
    Promotion stops the application while replication catches up and the destination is promoted. Schedule a time when your application can be offline.

1. Run the promotion command and follow the instructions:

    ```shell
    nais cloudsql migrate promote --team <team> --environment <environment> <appname> <new-sql-instance-name>
    ```

2. Check that the application runs as expected and that all data is available in the destination.
3. Update `spec.gcp.sqlInstances` in your Application manifest to match the live Application before your next deployment, preserving the other instance settings. Promotion changes the live Application, not the manifest in your repository. The migrator also sets `cascadingDelete: false`; decide deliberately whether to retain that protection.
4. Verify database object ownership and application-user permissions before finalizing.

Promotion scales the application to zero replicas and waits for replication lag to reach zero. It promotes the destination, adjusts database ownership, switches the live Application to the new instance and scales it back up. It also takes a backup of the destination.

!!! warning "Object ownership"
    Check for application objects still owned by `cloudsqlsuperuser`. Users with that role can access those objects. If ownership needs correcting, run the following in the application database with sufficient privileges, replacing the role name with the intended application user:

    ```sql
    REASSIGN OWNED BY cloudsqlsuperuser TO "intended-application-user";
    ```

    This changes all objects owned by `cloudsqlsuperuser` in that database and can also change ownership of shared objects such as databases and tablespaces. Verify the affected objects before running it. Do not use this blanket statement if it would transfer objects that should remain owned by `cloudsqlsuperuser`, such as extension objects.

If you need to return to the source, read the [rollback limitations](#rolling-back-the-migration) before proceeding.

## Finalizing the migration

!!! danger "Deletes the old instance"
    Finalization deletes the old SQLInstance and all data in it. Verify the destination's data, permissions and application behavior before proceeding. There is no rollback after finalization.

Run the finalization command:

```shell
nais cloudsql migrate finalize --team <team> --environment <environment> <appname> <new-sql-instance-name>
```

Finalization removes the Google migration job and connection profiles, deletes the old instance and temporary migration resources, and removes the migration configuration from the cluster.

## Rolling back the migration

!!! danger "Rollback after promotion can lose data"
    Rollback deletes the destination and returns the application to the old source. It does not replicate destination writes back to the source. If the application has written to the destination after promotion, those writes are lost when the destination is deleted. Do not run rollback until you have accounted for those writes.

    Rollback after promotion also causes application downtime. Rollback is not available after finalization.

    Rollback does not undo all setup changes to the source. The changed `postgres` password, replication flags and privileges, `pglogical` extension and authorized networks can remain. It does not restore audit logging or the Application's previous `cascadingDelete` setting.

To abandon the migration before finalization, run:

```shell
nais cloudsql migrate rollback --team <team> --environment <environment> <appname> <new-sql-instance-name>
```

Rollback attempts to remove the destination, helper Application, Google migration job and connection profiles, and migration resources. If the application has already switched, it updates the live Application to use the source again. Ensure your repository's Application manifest also points to the source before deploying.
