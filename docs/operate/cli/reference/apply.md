---
tags: [command-line, reference]
---

# apply

Apply idempotently applies the desired configuration to Nais.
It accepts a [Nais TOML](todo-some-document-explaining-what-nais-toml-is.md) file as input, and will create or update resources to match the desired state.

## Arguments

| Argument    | Required | Description                                        |
|-------------|----------|----------------------------------------------------|
| environment | Yes      | Name of the environment to apply the resources to. |
| file        | Yes      | Path to the Nais TOML file.                        |

## Flags

| Flag    | Required | Short | Description                                                                                                                                      |
|---------|----------|-------|--------------------------------------------------------------------------------------------------------------------------------------------------|
| mixin   |          | -m    | Path to the Nais TOML file containing mixins. Mixins will override the base file provided in the argument. Arrays are appended to, not replaced. |
| team    | Yes      | -t    | TEAM that owns the resources.                                                                                                                    |

## Examples

Apply resources defined in `.nais/nais.toml` to the `dev-gcp` environment for team `myteam`:

```shell
nais alpha apply dev-gcp .nais/nais.toml --team myteam
```

Apply resources defined in `.nais/nais.toml` to the `dev-gcp` environment for team `myteam`, using mixins from `.nais/override.toml`:

```shell
nais alpha apply dev-gcp .nais/nais.toml --team myteam --mixin .nais/override.toml
```

Mixins are automatically inferred from the given environment.
If you have a mixin named after the environment, it will be applied automatically.
You can still provide additional mixins using the `--mixin` flag.

```shell
# This will automatically look for and use the mixin `.nais/nais.dev-gcp.toml` if it exists.
nais alpha apply dev-gcp .nais/nais.toml --team myteam

# This will automatically look for and use the mixin `.nais/nais.prod-gcp.toml` if it exists.
nais alpha apply prod-gcp .nais/nais.toml --team myteam
```
