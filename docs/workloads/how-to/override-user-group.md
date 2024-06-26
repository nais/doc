---
tags: [workloads, how-to]
---

# Overriding user and group that runs container process

This how-to shows you how to override the default user and group (`1069`) that will run your container process.

## Add annotation to workload

```yaml title="nais.yaml"
...
metadata:
  annotations:
    nais.io/run-as-user: "1001"
    nais.io/run-as-group: "1002" # defaults to same as run-as-user
```

Re-deploy your workload to apply the changes.

## Related pages

:books: [Container security](../reference/container-security.md)
