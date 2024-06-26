---
tags: [workloads, reference]
---

# Container security

The following settings are applied to all containers running in NAIS: 

- Read only root filesystem. Only `/tmp` is writable.
- Runs as non-root, with user and group id `1069`

To override these settings, see the following how-to guides:

:dart: [Disable read-only file system](../how-to/disable-readonly.md)

:dart: [Overriding runAsUser / runAsGroup](../how-to/override-user-group.md)
