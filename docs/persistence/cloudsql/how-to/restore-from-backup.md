---
title: Restore a database from a daily backup
tags: [postgres, backup, restore, how-to]
---

This page describes how to restore a Cloud SQL Postgres database from one of the
[automated daily backups](../reference/README.md#automated-backup) that Nais takes of your instance.

Cloud SQL keeps the last seven daily backups by default. You can restore a backup either
_in-place_ (overwriting the current instance) or into a _separate instance_ (to inspect the data
without touching production).

!!! warning "Restoring in-place overwrites all current data"

    Restoring a backup to the same instance returns the database to the state it had when the backup
    was taken. All data written after that point is lost, including any
    [point-in-time recovery](../reference/README.md#point-in-time-recovery) logs.
    The instance is unavailable while the restore runs, so your application will have downtime.

!!! info

    This guide covers the daily backups stored in GCP. The separate
    [on-prem disaster backup](../reference/README.md#disaster-backup) is only used in case of a
    catastrophic failure in GCP. Contact the Nais team on Slack if you need data restored from it.

## Before you begin

- Install and authenticate the [`gcloud` CLI](https://cloud.google.com/sdk/docs/install), or use the
  [Google Cloud Console](https://console.cloud.google.com/sql/instances).
- [naisdevice](../../../operate/cli/README.md) connected.
- You need access to the GCP project where the instance runs. Your team has full access to view and
  restore backups for its own instances.

The instance name defaults to your application name. If you are unsure of the instance name or
project, find them in the [Cloud SQL dashboard](https://console.cloud.google.com/sql/instances) or in
your `nais.yaml`.

When using `gcloud`, set the project you are working in:

```bash
gcloud config set project <project-id>
```

## Find the backup to restore

=== "gcloud"

    List the available backups and note the `ID` of the one you want:

    ```bash
    gcloud sql backups list --instance <instance-name>
    ```

    Example output:

    ```
    ID                 WINDOW_START_TIME              TYPE       STATUS
    1700000000000      2026-08-30T02:00:00.000+00:00  AUTOMATED  SUCCESSFUL
    1699913600000      2026-08-29T02:00:00.000+00:00  AUTOMATED  SUCCESSFUL
    ```

=== "Console"

    Go to the instance's backups page and note the backup you want to restore:

    ```
    https://console.cloud.google.com/sql/instances/<instance-name>/backups
    ```

## Restore in-place (same instance)

Use this when you want to roll the production database back to an earlier state.

!!! warning

    This overwrites all current data on the instance and causes downtime.
    Consider stopping the application first so it does not write to the database during the restore:

    ```bash
    nais app stop <app-name>
    ```

=== "gcloud"

    ```bash
    gcloud sql backups restore <backup-id> \
      --restore-instance=<instance-name>
    ```

    Confirm the prompt to start the restore. The command returns once the operation is queued; you
    can follow its progress with:

    ```bash
    gcloud sql operations list --instance <instance-name> --limit 5
    ```

=== "Console"

    1. Go to `https://console.cloud.google.com/sql/instances/<instance-name>/backups`.
    2. Find the backup you want and click **Restore**.
    3. In **Choose restore destination**, select **Overwrite the source instance**.
    4. Enter the instance name to confirm, then click **Restore**.

Start the application again once the restore completes:

```bash
nais app start <app-name>
```

Verify that the application is running and that the data is as expected.

## Restore into a separate instance

Use this when you want to inspect or extract data from a backup without affecting the running
database — for example to recover a few accidentally deleted rows.

!!! info

    The target instance must already exist and have the same Postgres major version and equal or
    greater storage than the source. Restoring does **not** create a new instance.
    If you only need a copy to look at the data, [cloning the instance](connect-to-cloned.md) is
    usually simpler, since cloning creates a new instance for you.

=== "gcloud"

    Restore a backup taken from the source instance into an existing target instance:

    ```bash
    gcloud sql backups restore <backup-id> \
      --backup-instance=<source-instance-name> \
      --restore-instance=<target-instance-name>
    ```

=== "Console"

    1. Go to `https://console.cloud.google.com/sql/instances/<source-instance-name>/backups`.
    2. Find the backup you want and click **Restore**.
    3. In **Choose restore destination**, select the existing target instance.
    4. Confirm to start the restore.

!!! warning

    The target instance is a plain Cloud SQL instance, not managed by Nais. It will not have the
    users, secrets and certificates that Naiserator generates. To connect to it, follow
    [Connect to a cloned database](connect-to-cloned.md).

## Troubleshooting

If a restore fails, the current data on the instance is left unchanged. Check the failed operation
for the reason:

```bash
gcloud sql operations list --instance <instance-name> --limit 5
gcloud sql operations describe <operation-uuid>
```

Common causes are a target instance with a smaller disk or a different Postgres major version than
the backup.

## Further reading

- [Automated backups reference](../reference/README.md#automated-backup)
- [Google Cloud SQL: Restore an instance using a backup](https://docs.cloud.google.com/sql/docs/postgres/backup-recovery/restoring)
- [Google Cloud SQL: Restore overview](https://docs.cloud.google.com/sql/docs/postgres/backup-recovery/restore)
</content>
</invoke>
