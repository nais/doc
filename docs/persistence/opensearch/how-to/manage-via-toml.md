---
tags: [how-to, opensearch, redis]
---

# Manage OpenSearch via Nais TOML (preview)

This guide will show you how to manage OpenSearch instances using Nais TOML configuration files, as an alternative to [Nais Console](create.md).

!!! example "Preview"

    This feature is under active development. Breaking changes might occur, but we will strive to avoid them.

    We would love for you to try it out to hear your feedback! This will help us shape and improve the future of Nais.

## Prerequisites

- You're part of a [Nais team](../../../explanations/team.md)

## Configure opensearch in Nais TOML

In your Nais TOML file, add a `[openSearch.<instance-name>]` section to define your opensearch instance

```toml title="nais.toml"
naisVersion = "v3"

[openSearch.my-first-instance]
size = "RAM_4GB"
tier = "SINGLE_NODE"
```

You can add additional opensearch instances by adding more sections with different names, like `[openSearch.my-second-instance]`:

```toml title="nais.toml"
naisVersion = "v3"

[openSearch.my-first-instance]
size = "RAM_4GB"
tier = "SINGLE_NODE"

[openSearch.my-second-instance]
size = "RAM_16GB"
tier = "HIGH_AVAILABILITY"
```

## Next steps

<!-- TODO -->

:dart: Learn how to [apply Nais TOML from GitHub Actions](../../../operate/cli/apply-nais-toml-github-actions.md)

:dart: Learn how to [apply Nais TOML from your own machine](../../../operate/cli/apply-nais-toml.md)
