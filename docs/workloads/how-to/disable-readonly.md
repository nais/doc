---
tags: [workloads, how-to]
---

# Disable read-only file system

This how-to shows how to disable read-only root file system in your workloads.

!!! warning

    This setting helps protect your workloads from unauthorized writes. Only disable it if you are sure that your workload requires write access to the file system outside of `/tmp`.

## Add annotation to workload

```yaml title="nais.yaml"
...
metadata:
  annotations:
    nais.io/read-only-file-system: "false"
```

Re-deploy your workload to apply the changes.

!!! note

    Even with this setting enabled, you must ensure that the default user (`1069` or whatever you override it with) has write permission inside the Docker image.

## Related pages

:books: [Container security](../reference/container-security.md)
