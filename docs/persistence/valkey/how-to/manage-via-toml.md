---
tags: [how-to, valkey, redis]
---

# Manage Valkeys via Nais TOML (preview)

This guide will show you how to manage Valkey instances using Nais TOML configuration files, as an alternative to [Nais Console](create-console.md).

!!! example "Preview"

    This feature is under active development. Breaking changes might occur, but we will strive to avoid them.

    We would love for you to try it out to hear your feedback! This will help us shape and improve the future of Nais.

## Prerequisites

- You're part of a [Nais team](../../../explanations/team.md)

## Configure Valkey in Nais TOML

In your Nais TOML file, add a `[valkey.<instance-name>]` section to define your Valkey instance

```toml title="nais.toml"
naisVersion = "v3"

[valkey.my-first-instance]
size = "RAM_4GB"
tier = "SINGLE_NODE"
```

You can add additional Valkey instances by adding more sections with different names, like `[valkey.my-second-instance]`:

```toml title="nais.toml"
naisVersion = "v3"

[valkey.my-first-instance]
size = "RAM_4GB"
tier = "SINGLE_NODE"

[valkey.my-second-instance]
size = "RAM_1GB"
tier = "HIGH_AVAILABILITY"
maxMemoryPolicy = "ALLKEYS_LRU"
```

## Next steps

<!-- TODO -->

:dart: Learn how to [apply Nais TOML from GitHub Actions](../../../operate/cli/apply-nais-toml-github-actions.md)

:dart: Learn how to [apply Nais TOML from your own machine](../../../operate/cli/apply-nais-toml.md)
