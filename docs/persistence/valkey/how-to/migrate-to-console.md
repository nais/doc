---
tags: [how-to, valkey, redis]
---

# Migrate Valkey management to Nais Console

This guide will help you migrate an existing Valkey instance to instead be managed via [Nais Console](../../../operate/console.md).

## Prerequisites

Before we begin, ensure that:

- You're part of a [Nais team](../../../explanations/team.md)
- You have set up [command-line access](../../../operate/how-to/command-line-access.md)
- You have an existing Valkey instance

If you [created your Valkey via an application](create-application.md),
skip to [step 4](#4-apply-annotation-to-valkey-resource-in-kubernetes).

If you [created your Valkey explicitly](create-explicit.md), follow all the steps below.

## Steps

### 1. Verify that your existing Valkey settings are compatible with Console

Before migrating, ensure that your existing Valkey instance is compatible with Nais Console.

Console currently supports the following fields:

- `.spec.plan` - plan is now split into _size_ and _tier_
    - `size` denotes the memory size of the instance
    - `tier` denotes the availability tier of the instance
        - `SINGLE_NODE` (equivalent to `startup-*`, or `hobbyist` for the smallest `size`)
        - `HIGH_AVAILABILITY` (equivalent to `business-*`)
    - For example, if your existing plan is `startup-4`, you would set:
        - `size = "RAM_4GB"`
        - `tier = "SINGLE_NODE"`
    - If your existing plan is `business-14`, you would set:
        - `size = "RAM_14GB"`
        - `tier = "HIGH_AVAILABILITY"`
    - If your existing plan is `hobbyist`, you would set:
        - `size = "RAM_1GB"`
        - `tier = "SINGLE_NODE"`
- `.spec.userConfig.valkey_maxmemory_policy`
- `.spec.project` (automatically set)
- `.spec.terminationProtection` (automatically enabled)

If you need other fields not supported by Console, reach out to the Nais team.

### 2. Delete Valkey manifest from your Git repository

Your Git repository might have a manifest file that was used to create the Valkey instance.
It should look something like this:

```diff title="valkey.yaml"
-apiVersion: aiven.io/v1alpha1
-kind: Valkey
-metadata:
-  labels:
-    app: valkey-tester
-    team: myteam
-  name: valkey-myteam-sessions
-  namespace: myteam
-spec:
-  plan: startup-4
-  project: nav-dev
```

Delete the file from your repository.

### 3. Remove references from GitHub Actions workflows

If you have any GitHub Actions workflows that references the Valkey manifest file you just deleted, you should remove those references:

```diff title=".github/workflows/deploy.yaml"
name: Build and deploy
on: [...]
jobs:
  build-and-deploy:
    ...
    steps:
      ...
      - uses: nais/deploy/actions/deploy@v2
        env:
-          RESOURCE: .nais/app.yaml,.nais/valkey.yaml
+          RESOURCE: .nais/app.yaml
            ...
``
```

### 4. Patch resource in Kubernetes

To allow Console to take over management of the Valkey instance, you need to add a label to the existing Valkey resource in your Kubernetes cluster.

To do so, run the following command:

```shell
kubectl label valkey $VALKEY_NAME nais.io/managed-by=console \
  --namespace $TEAM \
  --context $ENVIRONMENT
```

where

- `$VALKEY_NAME` is the fully qualified name of your Valkey instance, e.g. `valkey-<TEAM>-<INSTANCE>`.
- `$TEAM` is your team.
- `$ENVIRONMENT` is the [name of the environment](../../../workloads/reference/environments.md) you're targeting.

### 4a. Remove owner references (if applicable)

If you [created your Valkey instance via an application](create-application.md), you must also remove the existing owner references from the resource:

```shell
kubectl patch valkey $NAME \
    --namespace $TEAM \
    --context $ENVIRONMENT \
    --type='json' \
    -p='[{"op": "remove", "path": "/metadata/ownerReferences"}]'
```

### 5. Finishing up

1. Visit [Nais Console](https://console.<<tenant()>>.cloud.nais.io).
2. Navigate to your team.
3. Navigate to the **Valkey** overview in the sidebar.
4. Verify that you can see the Valkey instance without the prefix `valkey-<TEAM>-` in its name.
5. Click the Valkey instance to view its details.
6. Verify that you can **Edit** or **Delete** the Valkey instance.

Congratulations! You've now successfully migrated your Valkey instance to be managed via Nais Console.
