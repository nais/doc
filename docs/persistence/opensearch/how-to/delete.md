---
tags: [how-to, opensearch, redis]
---

# Delete OpenSearch

This page guides you through the steps required to delete an OpenSearch instance.

## Prerequisites

- [You are a member of a Nais team](../../../explanations/team.md)
- [You have set up command-line access](../../../operate/how-to/command-line-access.md)
- Your OpenSearch instance is managed by Nais Console.
    - If you created your OpenSearch [via the legacy](create-legacy.md), see [Migrate opensearch management to Console](migrate-to-console.md).

## Steps

### 1. Remove references from workload manifests

Ensure that all references to the opensearch instance are removed from your workload manifests:

```diff title="app.yaml"
spec:
-  openSearch:
-    instance: <OPENSEARCH-NAME>
-    access: <ACCESS-LEVEL>
```

<!-- TODO: Unhide when Nais TOML is ready
### 2. Remove TOML from Git repository

If you're [managing the OpenSearch through Nais TOML](manage-via-toml.md), remove the corresponding TOML configuration from your repository.

### 3. Delete the OpenSearch instance
-->
### 2. Delete the OpenSearch instance

1. Open [Nais Console](https://console.<<tenant()>>.cloud.nais.io) in your browser and select your team
2. Select the **OpenSearch** tab
3. Select the OpenSearch instance you want to delete
4. Click the **Delete OpenSearch** button
5. Confirm the deletion by typing the name of the OpenSearch instance and clicking the **Delete OpenSearch** button
