---
tags: [how-to, opensearch]
---

# Migrate OpenSearch management to Nais Console

This guide will help you migrate an existing OpenSearch instance to instead be managed via [Nais Console](../../../operate/console.md).

## Prerequisites

Before we begin, ensure that:

- You're part of a [Nais team](../../../explanations/team.md)
- You have set up [command-line access](../../../operate/how-to/command-line-access.md)
- You have an existing OpenSearch instance

## Steps

### 1. Verify that your existing OpenSearch settings are compatible with Console

Before migrating, ensure that your existing OpenSearch instance is compatible with Nais Console.

Console currently supports the following fields:

- `.spec.plan` - plan is now split into _size_ and _tier_
    - `size` denotes the memory size of the instance
    - `tier` denotes the availability tier of the instance
        - `SINGLE_NODE` (equivalent to `startup-*`, or `hobbyist` for the smallest `size`)
        - `HIGH_AVAILABILITY` (equivalent to `business-*`)
    - For example, if your existing plan is `startup-4`, you would set:
        - `size = "RAM_4GB"`
        - `tier = "SINGLE_NODE"`
    - If your existing plan is `business-16`, you would set:
        - `size = "RAM_16GB"`
        - `tier = "HIGH_AVAILABILITY"`
    - If your existing plan is `hobbyist`, you would set:
        - `size = "RAM_2GB"`
        - `tier = "SINGLE_NODE"`
- `.spec.userConfig.opensearch_version`
- `.spec.project` (automatically set)
- `.spec.terminationProtection` (automatically enabled)

If you need other fields not supported by Console, reach out to the Nais team.

### 2. Delete OpenSearch manifest from your Git repository

Your Git repository might have a manifest file that was used to create the OpenSearch instance.
It should look something like this:

```diff title="opensearch.yaml"
-apiVersion: aiven.io/v1alpha1
-kind: OpenSearch
-metadata:
-  labels:
-    app: opensearch-tester
-    team: myteam
-  name: opensearch-myteam-tester
-  namespace: myteam
-spec:
-  plan: startup-4
-  project: nav-dev
```

Delete the file from your repository.

### 3. Remove references from GitHub Actions workflows

If you have any GitHub Actions workflows that references the OpenSearch manifest file you just deleted, you should remove those references:

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
-          RESOURCE: .nais/app.yaml,.nais/opensearch.yaml
+          RESOURCE: .nais/app.yaml
            ...
``
```

### 4. Apply annotation to OpenSearch resource in Kubernetes

To allow Console to take over management of the OpenSearch instance, you need to add an annotation to the existing OpenSearch resource in your Kubernetes cluster.

To do so, run the following command:

```shell
kubectl annotate opensearch $NAME nais.io/managed-by=console \
  --namespace $TEAM \
  --context $ENVIRONMENT
```

### 5. Finishing up

1. Visit [Nais Console](https://console.<<tenant()>>.cloud.nais.io).
2. Navigate to your team.
3. Navigate to the **OpenSearch** overview in the sidebar.
4. Verify that you can see the OpenSearch instance without the prefix `opensearch-<TEAM>-` in its name.
5. Click the OpenSearch instance to view its details.
6. Verify that you can **Edit** or **Delete** the OpenSearch instance.

Congratulations! You've now successfully migrated your OpenSearch instance to be managed via Nais Console.

<!-- TODO: Unhide when Nais TOML is live
## Next steps

:dart: Learn how to [manage OpenSearches via Nais TOML](manage-via-toml.md)
-->
