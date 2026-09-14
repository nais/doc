---
tags: [reference, build, deploy]
---

# Deploy with the Nais CLI

Deploys to Nais are done with the Nais CLI's `nais apply` command. In GitHub
Actions, use the [nais/setup](https://github.com/nais/setup) action to install the
CLI.

## `nais/setup` action inputs

| Name          | Description                                         | Required | Default  |
|:--------------|:----------------------------------------------------|:---------|:---------|
| `version`     | Version to install (`v3.8.3` or `latest`)           | No       | `latest` |
| `team`        | Default team written to the nais config file        | No       | —        |
| `environment` | Default environment written to the nais config file | No       | —        |

## `nais apply`

```bash
nais apply <manifest> [flags]
```

| Flag            | Description                                                     |
|:----------------|:---------------------------------------------------------------|
| `--environment` | The Nais environment to deploy to (e.g. `dev-gcp`, `prod-gcp`) |
| `--set`         | Override a value in the manifest (e.g. `--set spec.image=<image>`) |
| `--wait`        | Block until the deployment has completed                        |
| `--team`        | The team to deploy as (overrides config)                        |

When no image is provided via `--set spec.image` and the manifest has no
`spec.image` field, the CLI keeps whichever image is currently running.

## Environment mixins

See [Environment mixins](../explanations/environment-mixins.md) for the concept. Conventions:

| Item | Value |
|:-----|:------|
| Base manifest | `.nais/app.yaml` |
| Per-environment mixin | `.nais/app.<environment>.yaml` |
| Selected by | `--environment <environment>` |

Merge rules when a mixin is applied over the base:

| Field type | Behavior |
|:-----------|:---------|
| Map | Overridden by the mixin |
| Scalar | Overridden by the mixin |
| List | Concatenated (mixin items appended to the base) |

For a complete base-plus-mixin example, see [Set up a complete deploy pipeline](../how-to/deploy-pipeline.md).

## Examples

Deploy to a single environment:

```bash
nais apply .nais/app.yaml --environment dev-gcp --set spec.image="europe-north1-docker.pkg.dev/..." --wait
```

Deploy the same image to multiple environments:

```bash
nais apply .nais/app.yaml --environment dev-gcp --set spec.image="$IMAGE" --wait
nais apply .nais/app.yaml --environment prod-gcp --set spec.image="$IMAGE" --wait
```

Deploy manifest-only changes, reusing the running image:

```bash
nais apply .nais/app.yaml --environment dev-gcp --wait
```
