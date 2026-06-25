---
tags: [reference, build, deploy]
---

# Deploy with the Nais CLI

Deploying to Nais is done using the Nais CLI's `nais apply` command. In GitHub Actions, use the [nais/setup](https://github.com/nais/setup) action to install the CLI.

## Setup action inputs

| Name          | Description                                         | Required | Default  |
|:--------------|:----------------------------------------------------|:---------|:---------|
| `version`     | Version to install (`v3.8.3` or `latest`)           | No       | `latest` |
| `team`        | Default team written to the nais config file        | No       | —        |
| `environment` | Default environment written to the nais config file | No       | —        |

## `nais apply`

The `nais apply` command deploys a manifest to Nais.

```bash
nais apply <manifest> [flags]
```

### Flags

| Flag              | Description                                                                                              |
|:------------------|:---------------------------------------------------------------------------------------------------------|
| `--environment`   | The Nais environment to deploy to (e.g. `dev-gcp`, `prod-gcp`)                                          |
| `--set`           | Override a value in the manifest (e.g. `--set spec.image=<image>`)                                       |
| `--wait`          | Block until the deployment has completed                                                                 |
| `--team`          | The team to deploy as (overrides config)                                                                 |

### Examples

Deploy to a single environment:

```bash
nais apply .nais/app.yaml --environment dev-gcp --set spec.image="europe-north1-docker.pkg.dev/..." --wait
```

Deploy to multiple environments (using environment mixins):

```bash
nais apply .nais/app.yaml --environment dev-gcp --set spec.image="$IMAGE" --wait
nais apply .nais/app.yaml --environment prod-gcp --set spec.image="$IMAGE" --wait
```

Deploy manifest-only changes (no image rebuild):

```bash
nais apply .nais/app.yaml --environment dev-gcp --wait
```

When no image is provided via `--set spec.image`, the CLI will keep whichever image is currently running.

## GitHub Actions workflow example

```yaml
steps:
  - uses: actions/checkout@v6
  - uses: nais/setup@v1
    with:
      team: my-team
  - name: Deploy to dev-gcp
    run: nais apply .nais/app.yaml --environment dev-gcp --set spec.image="${{ needs.build.outputs.image }}" --wait
```

!!! note "Permissions"
    The deploy job needs `id-token: write` permission to authenticate with the Nais platform.

For more details, see [Build and deploy with GitHub Actions](../how-to/build-and-deploy.md).
