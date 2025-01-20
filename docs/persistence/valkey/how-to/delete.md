---
tags: [how-to, valkey, redis]
---

# Delete Valkey

This page guides you through the steps required to delete a Valkey instance.

## Prerequisites

- [You are a member of a NAIS team](../../../explanations/team.md)
- [You have set up command-line access](../../../operate/how-to/command-line-access.md)

## Steps

Before you delete a Valkey instance, ensure that no applications are using it.
If you delete a Valkey instance in use, the applications will lose access to the data stored in the instance.

### List Valkey instances

To list all Valkey instances belonging to your team:

1. Open [NAIS Console](https://console.<<tenant()>>.cloud.nais.io) in your browser and select your team.
2. Select the `Valkey` tab
3. Find the name of the Valkey instance you want to delete

### Disable termination protection

Before your can delete a specific Valkey instance, you must first disable termination protection.

To disable termination protection, run the following command:

```shell
kubectl patch valkey <VALKEY-NAME> \
  --type json \
  -p='[{"op": "replace", "path": "/spec/terminationProtection", "value": false}]'
```

### Delete Valkey instance

To delete the Valkey instance, run the following command:

```shell
kubectl delete valkey <VALKEY-NAME>
```

### Remove references from application manifests

Ensure that all references to the Valkey instance are removed from your application manifests:

```diff title="app.yaml"
spec:
-  valkey:
-    - instance: <VALKEY-INSTANCE-NAME>
-      access: <ACCESS-LEVEL>
```
