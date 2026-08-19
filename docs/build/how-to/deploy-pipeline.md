---
tags: [build, deploy, how-to]
---

# Set up a complete deploy pipeline

This guide shows the recommended setup for deploying an application to several
environments with the [Nais CLI](../../operate/cli.md). It builds on
[Build and deploy with GitHub Actions](build-and-deploy.md), adding environment
mixins for per-environment configuration and a split between code and manifest
deploys.

For how Nais resolves the image, see
[Applying a manifest](../explanations/applying-a-manifest.md). For how mixins
merge, see [Environment mixins](../explanations/environment-mixins.md). For flags
and file conventions, see the [deploy reference](../reference/deploy.md).

## Recommended repository structure

Nais recommends keeping your manifests in a `.nais/` directory: a base manifest
plus one mixin per environment.

```
.nais/
├── app.yaml              # base manifest
├── app.dev-gcp.yaml      # dev-gcp overrides
└── app.prod-gcp.yaml     # prod-gcp overrides
```

The rest of this guide builds up each of these files.

## Prerequisites

- You have [authorized your repository](build-and-deploy.md#authorize-your-github-repository-for-deployment) for deployment.
- Your repository contains a valid [workload manifest](../../workloads/README.md).

## Split configuration into a base manifest and mixins

Keep shared and development configuration in a base manifest, and put each
environment's overrides in a mixin file named `.nais/app.<environment>.yaml`.
When you deploy with `--environment <environment>`, the CLI merges the matching
mixin over the base.

```yaml title=".nais/app.yaml"
apiVersion: nais.io/v1alpha1
kind: Application
metadata:
  name: my-app
  namespace: my-team
spec:
  env:
    - name: COMMON
      value: value
```

```yaml title=".nais/app.dev-gcp.yaml"
spec:
  ingresses:
    - https://my-app.dev.ingress
  replicas:
    min: 1
    max: 1
  resources:
    requests:
      cpu: 20m
      memory: 32Mi
```

```yaml title=".nais/app.prod-gcp.yaml"
spec:
  ingresses:
    - https://my-app.production.ingress
  replicas:
    min: 2
    max: 4
  resources:
    requests:
      cpu: 40m
      memory: 64Mi
```

Deploying with `--environment prod-gcp` merges `app.prod-gcp.yaml` over `app.yaml`,
resulting in 2-4 replicas with higher resource requests.

!!! tip "Put per-environment values in map fields"
    Mixins override maps and scalars but concatenate lists. Keep per-environment
    values in map fields like `resources` and `replicas`. See
    [merge rules](../explanations/environment-mixins.md#merge-rules) for details.

## Build once, deploy to every environment

Build the image once, then deploy it to each environment with a mixin. The build
job exposes the image as an output that every deploy step reuses.

```yaml title=".github/workflows/main.yml"
name: Build and deploy
on:
  push:
    branches:
      - main
jobs:
  build:
    name: Build and push image
    runs-on: ubuntu-latest
    permissions:
      contents: read
      id-token: write
    outputs:
      image: ${{ steps.docker-build-push.outputs.image }}
    steps:
      - uses: actions/checkout@v6
      - name: Build and push image and SBOM to OCI registry
        uses: nais/docker-build-push@v0
        id: docker-build-push
        with:
          team: <MY-TEAM> # Replace
{%- if tenant() == "test-nais" %}
          project_id: nais-management-ddba
          identity_provider: projects/636929582051/locations/global/workloadIdentityPools/test-nais-identity-pool/providers/github-oidc-provider
{%- endif %}

  deploy:
    name: Deploy
    needs: build
    runs-on: ubuntu-latest
    permissions:
      contents: read
      id-token: write
    steps:
      - uses: actions/checkout@v6
      - uses: nais/setup@v1
        with:
          team: <MY-TEAM> # Replace
      - name: Deploy to dev-gcp
        run: nais apply .nais/app.yaml --environment dev-gcp --set spec.image="${{ needs.build.outputs.image }}" --wait
      - name: Deploy to prod-gcp
        run: nais apply .nais/app.yaml --environment prod-gcp --set spec.image="${{ needs.build.outputs.image }}" --wait
```

## Deploy manifest changes without rebuilding

When you deploy without `--set spec.image`, the CLI keeps whichever image is
currently running. Use this to deploy configuration changes without waiting for a
build. Split the work into two workflows that trigger on different paths:

- **Code changes** trigger a build and deploy.
- **Manifest changes** trigger a deploy that reuses the running image.

```yaml title=".github/workflows/deploy-nais-resources.yml"
name: Deploy Nais resources
on:
  push:
    branches: [main]
    paths:
      - ".nais/**"
jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      id-token: write
    steps:
      - uses: actions/checkout@v6
      - uses: nais/setup@v1
        with:
          team: <MY-TEAM> # Replace
      - name: Apply to dev-gcp
        run: nais apply .nais/app.yaml --environment dev-gcp --wait
      - name: Apply to prod-gcp
        run: nais apply .nais/app.yaml --environment prod-gcp --wait
```

To also stop the build-and-deploy workflow from running on manifest-only changes,
add a matching `paths-ignore` to its `on.push` trigger.
