---
title: Deleting the database
tags: [postgres, delete, database, how-to]
---

!!! warning "Experimental feature"
    This feature is an alpha feature, and is subject to API change, instability or removal.
    See the [main Postgres page](../README.md) for more information.
    
The database is not automatically removed when deleting your Nais application or the Postgres resource. 
Remove unused databases to avoid incurring unnecessary costs.
This is done by setting [allowDeletion](../../../persistence/postgresql/reference/postgres-spec.md#clusterallowdeletion) in your `postgres.yaml`-specification.

To remove a database completely without deleting the application:

1. First, set [allowDeletion](../../../persistence/postgresql/reference/postgres-spec.md#clusterallowdeletion) to `true` in the Postgres spec and deploy it
2. Remove `postgres` from the application spec and deploy again
3. Delete the Postgres resource from your namespace

The database and the instance it runs on should now be completely removed after a short while.
