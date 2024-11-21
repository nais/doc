---
tags: [redis, how-to]
---

# Delete Redis

This page guides you through the steps required to delete a Redis instance.

## Prerequisites

- [You are a member of a NAIS team](../../../explanations/team.md)
- [You have set up command-line access](../../../operate/how-to/command-line-access.md)

## Steps

Before you delete a Redis instance, ensure that no applications are using it.
If you delete a Redis instance in use, the applications will lose access to the data stored in the instance.

### List Redis instances

To list all Redis instances belonging to your team:

1. Open [NAIS Console](https://console.<<tenant()>>.cloud.nais.io) in your browser and select your team.
2. Select the `Redis` tab
3. Find the name of the Redis instance you want to delete

### Disable termination protection

Before your can delete a specific Redis instance, you must first disable termination protection.

To disable termination protection, run the following command:

```shell
kubectl patch redis <REDIS-NAME> \
  --type json \
  -p='[{"op": "replace", "path": "/spec/terminationProtection", "value": false}]'
```

### Delete Redis instance

To delete the Redis instance, run the following command:

```shell
kubectl delete redis <REDIS-NAME>
```

### Remove references from application manifests

Ensure that all references to the Redis instance are removed from your application manifests:

```diff title="app.yaml"
spec:
-  redis:
-    - instance: <REDIS-INSTANCE-NAME>
-      access: <ACCESS-LEVEL>
```
