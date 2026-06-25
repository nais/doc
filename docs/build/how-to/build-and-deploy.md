---
tags: [build, deploy, how-to]
---

# Build and deploy with GitHub Actions

This how-to guide shows you how to build and deploy your application using [GitHub Actions](https://help.github.com/en/actions/automating-your-workflow-with-github-actions) and the [Nais CLI](../../operate/cli.md).

## Prerequisites

- You're part of a [Nais team](../../operate/how-to/create-team.md)
- A Github repository where the Nais team has access
- The repository contains a valid [workload manifest](../../workloads/README.md)

## Authorize your Github repository for deployment

1. Open [Nais Console](https://console.<<tenant()>>.cloud.nais.io) in your browser and select your team.
2. Select the `Repositories` tab
3. Input your repository (`organization/repository`) and press `Add`.

## Create a Github workflow

!!! note
    If you require a more advanced workflow, or already have one: copy the relevant parts from the example below.

!!! note ".github/workflows/main.yml"

    ```yaml hl_lines="21 {%- if tenant() == "test-nais" %} 36 38{% else %} 34 36{% endif %}"
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
          - name: Deploy to Nais
            run: nais apply .nais/app.yaml --environment <MY-ENV> --set spec.image="${{ needs.build.outputs.image }}" --wait # (1)
    ```

    1.  Environment is the Nais environment to deploy to. You can find available values in [workloads/environments](../../workloads/reference/environments.md).

This example workflow is a minimal example that builds, signs, and pushes your container image to the image registry.
It then deploys the [app.yaml](../../workloads/application/reference/application-spec.md) using the Nais CLI.

The image is passed to the manifest using `--set spec.image=<image>`, which overrides the `spec.image` field in the manifest at deploy time.

When the app manifest carries no image field, and you deploy without `--set spec.image`, the CLI will keep whichever image is currently running (it queries the Nais API).
This allows you to deploy manifest changes without rebuilding the image.

When this file is pushed to the `main` branch, the workflow will be triggered, and you are all set.

## Deploying to multiple environments

If you want to deploy to multiple environments (e.g. `dev` and `prod`), you can use environment mixins.
Create a base manifest (e.g. `.nais/app.yaml`) with dev config, and a per-environment mixin named `.nais/app.<environment>.yaml` with production overrides.
The CLI automatically deep-merges the mixin over the base when you specify `--environment`.

Mixin values override maps and scalars, but concatenate lists. This means per-environment values belong in map fields (like `resources`), not in list fields (like `spec.env`).

??? example "Example: base manifest and mixin files"

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

    ```yaml title=".nais/app.dev.yaml"
    spec:
      env:
        - name: NODE_ENV
          value: dev
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
    ```yaml title=".nais/app.prod.yaml"
    spec:
      env:
        - name: NODE_ENV
          value: prod
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

    When deploying with `--environment prod-gcp`, the CLI merges `app.prod-gcp.yaml` over `app.yaml`, resulting in 2-4 replicas with higher resource requests.

Add multiple deploy steps to your workflow:

```yaml
- name: Deploy to dev-gcp
  run: nais apply .nais/app.yaml --environment dev-gcp --set spec.image="${{ needs.build.outputs.image }}" --wait
- name: Deploy to prod-gcp
  run: nais apply .nais/app.yaml --environment prod-gcp --set spec.image="${{ needs.build.outputs.image }}" --wait
```

## Deploying manifest changes without rebuilding

When you deploy without `--set spec.image`, the CLI keeps whichever image is currently running. This means you can split your deployment into two workflows:

1. **Source code changes** (triggers on `cmd/**`, `go.*`, `Dockerfile`, etc.) -- builds a new image and deploys it.
2. **Manifest changes** (triggers on `.nais/**`) -- deploys without building, reusing the current image.

This speeds up manifest-only changes significantly.

??? example "Example: separate workflow for manifest-only deploys"

    ```yaml title=".github/workflows/deploy-nais-resources.yaml"
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

!!! info "Registry used by Nais"

    The [nais/docker-build-push GitHub action](https://github.com/nais/docker-build-push) as well as the
    [nais/login GitHub action](https://github.com/nais/login) work with a registry that is only meant for use within the Nais platform.

    Usage of this registry for other purposes is not supported.
    If you need to use the image outside of Nais, e.g. locally in a development environment, you should [push the image to another registry](./use-image-outside-nais.md).
