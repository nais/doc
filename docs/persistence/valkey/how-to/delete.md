---
tags: [how-to, valkey, redis]
---

# Delete Valkey

This page guides you through the steps required to delete a Valkey instance.

## Prerequisites

- [You are a member of a Nais team](../../../explanations/team.md)
- [You have set up command-line access](../../../operate/how-to/command-line-access.md)

## Steps

### List Valkey instances

To list all Valkey instances belonging to your team:

#### Through the Nais Console

1. Open [Nais Console](https://console.<<tenant()>>.cloud.nais.io) in your browser and select your team.
2. Select the `Valkey` tab
3. Find the name of the Valkey instance you want to delete

#### Using Kubectl

```shell
kubectl get valkeys
```

### Disable termination protection

Before your can delete a specific Valkey instance, you must first disable termination protection.

To disable termination protection, run the following command:

```shell
kubectl patch valkey <VALKEY-NAME> \
  --type json \
  -p='[{"op": "replace", "path": "/spec/terminationProtection", "value": false}]'
```

### Remove references from application manifests

If the instance was created implicitly by adding it to your application manifest, removing it from the manifest will trigger deletion of the instance.
If you have explicitly created the instance, you must also [explicitly delete it](#delete-valkey-instance) after removing it from the application manifest.

Ensure that all references to the Valkey instance are removed from your application manifests:

```diff title="app.yaml"
spec:
-  valkey:
-    - instance: <VALKEY-INSTANCE-NAME>
-      access: <ACCESS-LEVEL>
```

### Delete Valkey instance

To delete the Valkey instance, run the following command:

```shell
kubectl delete valkey <VALKEY-NAME>
```

