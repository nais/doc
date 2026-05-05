---
tags: [postgres, delete, database, how-to]
---

!!! warning "Experimental feature"
    This feature is an alpha feature, and is subject to API change, instability or removal.
    See the [main Postgres page](../README.md) for more information.

# Deleting the database

This page guides you through the steps required to delete a Postgres cluster.

## Prerequisites

- [You are a member of a Nais team](../../../explanations/team.md)
- [You have set up command-line access](../../../operate/how-to/command-line-access.md)

## Steps

### 1. Remove references from workload manifests

Ensure that all references to the Postgres instance are removed from your workload manifests:

```diff title="app.yaml"
spec:
-  postgres:
-    clusterName: <POSTGRES-NAME>
```

### 2. Delete the Postgres instance

1. Open [Nais Console](https://console.<<tenant()>>.cloud.nais.io) in your browser and select your team
2. Select the **Postgres** tab
3. Select the Postgres cluster you want to delete
4. Click the **Delete** button
5. Confirm the deletion by typing the name of the Postgres cluster and clicking the **Delete Postgres** button
