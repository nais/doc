---
title: Shrink Cloud SQL disk size
tags: [postgres, disk, storage, how-to]
---

# Shrink Cloud SQL disk size

Follow [Google's storage shrink procedure :octicons-link-external-16:](https://docs.cloud.google.com/sql/docs/postgres/shrink-instance-storage-capacity) for requirements, backups, downtime and the shrink operation.

!!! warning "Account for your Application manifest"
    Nais declares `spec.gcp.sqlInstances[].diskSize` to Cloud SQL. Account for this value when planning the shrink: a larger declared size can request a storage increase again. Changing `diskSize` in the manifest alone does not shrink storage.
