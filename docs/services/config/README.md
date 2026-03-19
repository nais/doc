---
tags: [config, explanation, services]
---

# Config

A config is a set of non-sensitive configuration values that can be used in a [workload](../../workloads/README.md).
This can be feature flags, connection strings, or any other configuration that does not need to be kept secret.

Configs allows you to change configuration without redeploying your workload.

Unlike [secrets](../secrets/README.md), config values are not sensitive and do not require any special access controls to view or edit.

## Related pages

:dart: Learn how to [create and manage a config in Nais Console](how-to/console.md)

:dart: Learn how to [use a config in your workload](how-to/workload.md)
