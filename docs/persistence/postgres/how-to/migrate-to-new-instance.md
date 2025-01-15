---
title: Migrate to new instance
tags: [postgres, migrate, how-to]
---

# Migrating to a new SQLInstance

!!! info "Status: Beta"

    We believe that migration works as intended, but it needs a broader audience to be battle-tested properly.
    Please report any issues to the #nais channel on Slack.

This guide describes how to migrate your PostgreSQL database to a new [SQLInstance](../explanations/cloud-sql-instance.md).

The process can be summarized as follows:

1. [Set up the new SQLInstance](#setting-up-the-migration), and configure replication etc.
2. [Promote the new SQLInstance](#promoting-the-new-sqlinstance) to be the primary.
3. [Finalize the migration](#finalizing-the-migration) by deleting the old SQLInstance and doing various cleanup.

At any point during the process, you can [roll back](#rolling-back-the-migration) to how things looked before you started.

We have written a more detailed explanation of the process in the [explanation section](../explanations/migrate-to-new-instance.md).

## Preparations

!!! danger
    
    During migration, you can't make structural database ([DDL](https://en.wikipedia.org/wiki/Data_definition_language)) changes (changing structure of tables, adding or removing tables, etc.) to your database. 
    Check with your team to avoid any problems during the migration.

* Make sure to have the latest version of the [nais CLI](../../../operate/cli/README.md) installed.
* Decide on a new name for the new SQLInstance. It must be different from the current SQLInstance name.
* naisdevice connected.
* Access to the nais cluster where the application is running.

## Setting up the migration

1. Select the correct kubernetes context and namespace

   ```shell
   kubectl config use-context <cluster>
   kubectl config set-context --current --namespace=<namespace>
   ```

2. Run the [setup](../../../operate/cli/reference/postgres.md#migrate-setup) command and follow the prompts
    
    ```shell
    nais migrate postgres setup <appname> <new-sql-instance-name>
    ```

3. Check that the replication is up to date by checking the URL you got from the setup command.
   This may take some time, depending on how much data needs to be transferred. 

## Promoting the new SQLInstance

!!! warning

    Promoting the new SQLInstance will cause downtime for your application.
    Before proceeding, decide on a time when your application can have downtime to perform the promotion.

1. Run the [promote](../../../operate/cli/reference/postgres.md#migrate-promote) command and follow the instructions

    ```shell
    nais migrate postgres promote <appname> <new-sql-instance-name>
    ```

2. Check that the application is running as expected, and that all data is available in the new SQLInstance.
3. If everything is working as expected, you can proceed to the next step.
   If something is not working, and you need to roll back, go to the [rollback section](#rolling-back-the-migration).

## Finalizing the migration

!!! warning

    This will delete the old SQLInstance and all data in it. 
    Make sure you have verified that all data is available in the new SQLInstance before proceeding.

    There is no rollback option after this point.

1. Run the [finalize](../../../operate/cli/reference/postgres.md#migrate-finalize) command

    ```shell
    nais migrate postgres finalize <appname> <new-sql-instance-name>
    ```

## Rolling back the migration

If you decide to not go through with the migration, you can roll back to the old SQLInstance at any point (unless you have run finalize).

1. Run the [rollback](../../../operate/cli/reference/postgres.md#migrate-rollback) command

    ```shell
    nais migrate postgres rollback <appname> <new-sql-instance-name>
    ```
