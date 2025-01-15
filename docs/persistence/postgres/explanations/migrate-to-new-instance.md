---
title: Migrate to new instance
tags: [postgres, migrate, explanation]
---

# Migrating to a new SQLInstance

!!! info "Status: Beta"

    We believe that migration works as intended, but it needs a broader audience to be battle-tested properly.
    Please report any issues to the #nais channel on Slack.

This article desribes what actually happens when you use the nais tools to [migrate for a new SQL Instance](../how-to/migrate-to-new-instance.md).

When migrating, there are two tools involved, that work in concert.
The primary tool the user interfaces with is the [nais CLI](../../../operate/cli/README.md).
The nais CLI gathers information from the user, saves this information to the cluster and launches several Kubernetes Jobs to run [cloudsql-migrator](https://github.com/nais/cloudsql-migrator).

The migration is divided into phases, and each phase is a Kubernetes Job that runs the cloudsql-migrator tool.

## Detailed description of the phases

### Phase 1: Setup

We start by taking a backup before we get started, just to ensure we have somewhere to roll back to should everything go wrong.

Then we create a new SQLInstance that is the way we want it to be.
This involves setting version, tier and other settings that are important for the new instance.
To do this, a dummy application is launched, to create everything needed for the new instance.

The source instance is then configured for migration by setting needed flags and installing the pglogical extension.

When source and target instances are ready we create the migration job in Google Cloud, and start the initial load replication.

### Phase 2: Promotion

Phase 2 is ready to start when the replica is up-to-date.

This is where downtime for the application starts.

The first step is to scale the app down to 0 replicas, and wait for the replication lag to reach 0.
When the lag is 0, we start promoting the replica to be the new master.
Once the promotion is complete, we fix ownership in the database and change the application in the cluster to match the new instance, still with 0 replicas.
After a bit more bookkeeping we scale up the app to the desired number of replicas.

At this point we take another backup.

At this point it would be tempting to believe you are done, but there are some final steps to be taken.


### Phase 3: Finalize

Once the migration is verified and everything is working as it should we can finalize the migration.

This involves cleaning up the old instance, and all the resources that were created during the migration.


### Phase 0: Rollback

If anything goes wrong during the migration, we have a rollback phase that can be started.

The rollback phase will attempt to restore everything to how it was before setup was called.
This can be called at any time during the migration, up until the finalize phase is started.

Some of the steps in the rollback phase:

* Delete the new instance
* Clean up migration job and related configuration
* Update the application to use the old instance if it had been promoted
