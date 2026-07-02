---
title: Shrink Cloud SQL disk size
tags: [postgres, disk, storage, how-to]
---

This page describes how to shrink the disk size of a Cloud SQL instance.

## Before you begin

1. Read the [Google Cloud SQL documentation on shrinking storage capacity](https://docs.cloud.google.com/sql/docs/postgres/shrink-instance-storage-capacity).

2. The documentation refers to checking `max_wal_size` — at the time of writing, it must be below 5 128 MB for the operation to proceed:

    ```sql
    SHOW max_wal_size;
    ```

3. The documentation refers to checking installed extensions - you can use this command:

    ```sql
    SELECT * FROM pg_extension;
    ```

4. Find the minimum target size and estimated duration:

    ```bash
    gcloud sql instances get-storage-shrink-config <instance-name>
    ```

    Example output:
    ```
    The estimated operation time is 124 minutes.
    minimalTargetSizeGb: '722'
    ```

    Choose a target size slightly above the minimum (e.g. 750 GB if the minimum is 722 GB).

## Procedure

!!! warning

    Shrinking disk requires taking the application offline.
    Schedule this operation during a maintenance window or outside office hours.
    **Expect a downtime of 2 hours or more** depending on instance size.

1. **Stop the application:**

    ```bash
    nais app stop <app-name>
    ```

2. **Create a manual backup** in the Cloud SQL Console (`https://console.cloud.google.com/sql/instances/<instance-name>/backups`) before proceeding.

3. **Start the shrink operation:**

    ```bash
    gcloud sql instances perform-storage-shrink <instance-name> \
      --storage-size=<target-size-gb> \
      --no-async
    ```

    `--no-async` keeps the command running and shows a spinner for the duration of the operation. Completely optional.

4. **Optional monitoring of progress** (in a separate terminal):

    There is (currently) no way to monitor the progress of the operation. You can, however, check if the operation is ongoing:

    List recent operations and find the one without an end time:

    ```bash
    gcloud sql operations list --instance <instance-name> --limit 10
    ```

    Inspect the running operation, using the UUID from the previous command:

    ```bash
    gcloud sql operations describe <operation-uuid>
    ```

    Optionally, watch for the application to scale back up (it should not during the operation):

    ```bash
    watch -n5 nais app status <app-name>
    ```

5. **Start the application** once the operation completes:

   Either:
    ```bash
    nais app start <app-name>
    ```
   
    or:
    ```bash
    nais app set replicas <app-name> --min 4 --max 4
    ```

6. **Verify** that the application is running and that disk usage is as expected.

7. **Optionally delete the manual backup** after the application has been verified stable — typically the next business day.

## Rollback

If something goes wrong, restore from the manual backup you created in step 2. See the [Google Cloud Console](https://console.cloud.google.com/sql/instances/<instance-name>/backups) for restore options.
