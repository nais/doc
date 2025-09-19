---
tags: [how-to, valkey, redis]
---

# Delete Valkey

This page guides you through the steps required to delete a Valkey instance.

## Prerequisites

- [You are a member of a Nais team](../../../explanations/team.md)
- Your Valkey instance is managed by Nais Console.
    - If you either created your Valkey [via an application](create-application.md) or [explicitly](create-explicit.md), see [Migrate Valkey management to Console](migrate-to-console.md). 

## Steps

### 1. Remove references from workload manifests

Ensure that all references to the Valkey instance are removed from your workload manifests:

```diff title="app.yaml"
spec:
-  valkey:
-    - instance: <VALKEY-INSTANCE-NAME>
-      access: <ACCESS-LEVEL>
```

<!-- TODO: Unhide when Nais TOML is ready
### 2. Remove TOML from Git repository

If you're [managing the Valkey through Nais TOML](manage-via-toml.md), remove the corresponding TOML configuration from your repository.

### 3. Delete the Valkey instance
-->
### 2. Delete the Valkey instance

1. Open [Nais Console](https://console.<<tenant()>>.cloud.nais.io) in your browser and select your team
2. Select the **Valkey** tab
3. Select the Valkey instance you want to delete
4. Click the **Delete Valkey** button
5. Confirm the deletion by typing the name of the Valkey instance and clicking the **Delete Valkey** button
