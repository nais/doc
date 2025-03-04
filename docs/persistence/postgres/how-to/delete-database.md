---
title: Deleting the database
tags: [postgres, delete, database, how-to]
---

The database is not automatically removed when deleting your Nais application. Remove unused databases to avoid incurring unnecessary costs. This is done by setting [cascadingDelete](../../../workloads/application/reference/application-spec.md#gcpsqlinstancescascadingdelete) in your `nais.yaml`-specification.

!!! danger
    When you delete an Cloud SQL instance, you cannot reuse the name of the deleted instance until one week from the deletion date.

To remove a database completely without deleting the application:

1. First, set [cascadingDelete](../../../workloads/application/reference/application-spec.md#gcpsqlinstancescascadingdelete) to `true` in the application spec and deploy it
2. Remove `sqlInstances` from the application spec and deploy again

The database and the instance it runs on should now be completely removed after a short while.
