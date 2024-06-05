---
title: Deleting the database
tags: [postgres, delete, database, how-to]
---

The database is not automatically removed when deleting your NAIS application. Remove unused databases to avoid incurring unnecessary costs. This is done by setting [cascadingDelete](../../../workloads/application/reference/application-spec.md#gcpsqlinstancescascadingdelete) in your `nais.yaml`-specification.

!!! danger
    When you delete an Cloud SQL instance, you cannot reuse the name of the deleted instance until one week from the deletion date.
