---
title: Connect from laptop
tags: [postgres, developer, laptop, how-to]
---

!!! warning "Experimental feature"
    This feature is an alpha feature, and is subject to API change, instability or removal.
    See the [main Postgres page](../README.md) for more information.


In the event of problems that can not be resolved via the application, a developer might need to access the database directly.

In order to do this, some things needs to be in place:

- The developer needs to be a member of the team that owns the database
- The developer needs to have been a team member for more than ~30 minutes
- naisdevice must be connected and green


## Connecting to the database

For compatability with related CloudSQL commands, the nais cli uses an application to find the Postgres cluster.
For Postgres clusters, the commands can also use the name of the cluster directly.

1. Acquire a nais token: `nais auth login --nais`
2. Connect to the database using either 
   1. a psql connection: `nais postgres psql --reason "debugging issue" <app-or-cluster-name>`, or
   2. a proxy for connection using any postgres client: `nais postgres proxy --reason "debugging issue" <app-or-cluster-name>`
3. Follow the instructions

## Useful things to know

When connecting to the database, you are logged in with your email address.

The user has the same access as the `app_writer` role, which has read and write access to everything created by the `app_owner` user the application runs with.
The `app_writer` role has `SELECT`, `INSERT`, `UPDATE`, `DELETE` on tables, `USAGE` and `UPDATE` on sequences, `USAGE` on types and `EXECUTE` on functions.

When the user connects, it will start in a read-only transaction, unless previously disabled.
In order to do writes, the user must either start a read write transaction and perform writes inside the transaction: `begin transaction read write;`, 
or disable the default transaction mode for the user: `set default_transaction_read_only = off;`.
