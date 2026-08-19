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

The freshly built image is passed to the deploy step with `--set spec.image=<image>`, which overrides the `spec.image` field in the manifest.
For how Nais resolves the image, see [Applying a manifest](../explanations/applying-a-manifest.md).

When this file is pushed to the `main` branch, the workflow will be triggered, and you are all set.

!!! info "Registry used by Nais"

    The [nais/docker-build-push GitHub action](https://github.com/nais/docker-build-push) as well as the
    [nais/login GitHub action](https://github.com/nais/login) work with a registry that is only meant for use within the Nais platform.

    Usage of this registry for other purposes is not supported.
    If you need to use the image outside of Nais, e.g. locally in a development environment, you should [push the image to another registry](./use-image-outside-nais.md).

## What's next

This guide deploys to a single environment. To deploy to several environments and
split manifest changes from code changes, see
[Set up a complete deploy pipeline](deploy-pipeline.md).
