---
title: Deleting the database
tags: [postgres, delete, database, how-to]
---

The database is not automatically removed when deleting your Nais application. 
Remove unused databases to avoid incurring unnecessary costs.
This is done by setting [allowDeletion](../../../workloads/application/reference/application-spec.md#postgresclusterallowdeletion) in your `nais.yaml`-specification.

To remove a database completely without deleting the application:

1. First, set [allowDeletion](../../../workloads/application/reference/application-spec.md#postgresclusterallowdeletion) to `true` in the application spec and deploy it
2. Remove `postgres` from the application spec and deploy again

The database and the instance it runs on should now be completely removed after a short while.
