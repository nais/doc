---
tags: [command-line, how-to, operate]
---

# Apply Nais TOML

This guide will show you how to apply [Nais TOML](todo-some-document-explaining-what-nais-toml-is.md) configuration files using the Nais CLI.

We recommend that you primarily [apply changes to Nais TOML via GitHub Actions](../../build/how-to/apply.md).

Sometimes however, you may need to apply changes from your own machine, for example during a GitHub outage or when an urgent change is required.

## Prerequisites

- You have [set up command line access](command-line-access.md)

## Create Nais TOML

Currently supported resources:

- [Valkey](../../persistence/valkey/how-to/manage-via-toml.md)
- [OpenSearch](../../persistence/opensearch/how-to/manage-via-toml.md)

See the linked guides for details on each resource.

## Apply Nais TOML

To apply Nais TOML from your own machine, run the following command:

```bash
nais apply -f <ENVIRONMENT> <path/to/nais.toml> --team <TEAM>
```

## Related pages

:books: [`apply` command reference](../cli/reference/apply.md)
