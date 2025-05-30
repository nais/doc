---
tags: [how-to, openSearch]
---

# Delete OpenSearch

This page guides you through the steps required to delete an OpenSearch instance.

## Prerequisites

- [You are a member of a Nais team](../../../explanations/team.md)
- [You have set up command-line access](../../../operate/how-to/command-line-access.md)

## Steps

### List OpenSearch instances

To list all OpenSearch instances belonging to your team:

#### Through the Nais Console

1. Open [Nais Console](https://console.<<tenant()>>.cloud.nais.io) in your browser and select your team.
2. Select the `OpenSearch` tab
3. Find the name of the OpenSearch instance you want to delete

#### Using Kubectl

```shell
kubectl get opensearches
```

### Disable termination protection

Before your can delete a specific OpenSearch instance, you must first disable termination protection.

To disable termination protection, run the following command:

```shell
kubectl patch openSearch <OPENSEARCH-NAME> \
  --type json \
  -p='[{"op": "replace", "path": "/spec/terminationProtection", "value": false}]'
```

### Remove references from application manifests

Ensure that all references to the OpenSearch instance are removed from your application manifests:

```diff title="app.yaml"
spec:
-  openSearch:
-    - instance: <OPENSEARCH-INSTANCE-NAME>
-      access: <ACCESS-LEVEL>
```

### Delete OpenSearch instance

To delete the OpenSearch instance, run the following command:

```shell
kubectl delete openSearch <OPENSEARCH-NAME>
```
