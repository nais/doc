---
tags: [build, deploy, how-to]
---

# Build and deploy with GitHub Actions

This how-to guide shows you how to build and deploy your application using [GitHub Actions](https://help.github.com/en/actions/automating-your-workflow-with-github-actions) and the Nais deploy action.

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

    ```yaml hl_lines="27 31-32"
    name: Build and deploy
    on:
      push:
        branches:
          - main
    jobs:
      build_and_deploy:
        name: Build, push and deploy
        runs-on: ubuntu-latest
        permissions:
          contents: read
          id-token: write
          actions: read
        steps:
          - uses: actions/checkout@v4
            with:
              fetch-depth: 0 # Fetch all history for what-changed action
          - name: Determine what to do
            id: changed-files
            uses: "nais/what-changed@main"
            with:
              files: .nais/app.yaml #, topic.yaml, statefulset.yaml, etc.
          - name: Build and push image and SBOM to OCI registry
            if: steps.changed-files.outputs.changed != 'only-inputs'
            uses: nais/docker-build-push@v0
            id: docker-build-push
            with:
              team: <MY-TEAM> # Replace
          - name: Deploy to Nais
            uses: nais/deploy/actions/deploy@v2
            env:
              CLUSTER: <MY-CLUSTER> # Replace (1)
              RESOURCE: .nais/app.yaml # same list as in changed-files step above
              WORKLOAD_IMAGE: ${{ steps.docker-build-push.outputs.image }}
              TELEMETRY: ${{ steps.docker-build-push.outputs.telemetry }}
    ```

    1.  Cluster in this context is the same as the environment name. You can find the value in [workloads/environments](../../workloads/reference/environments.md).

This example workflow is a minimal example that builds, signs, and pushes your container image to the image registry.
It then deploys the [app.yaml](../../workloads/application/reference/application-spec.md).
In this example, the workload image is specified separately, and you don't need to have the `image` field in your workload manifest.

When this file is pushed to the `main` branch, the workflow will be triggered, and you are all set.

!!! info "Registry used by Nais"

    The [nais/docker-build-push GitHub action](https://github.com/nais/docker-build-push) as well as the
    [nais/login GitHub action](https://github.com/nais/login) work with a registry that is only meant for use within the Nais platform.

    Usage of this registry for other purposes is not supported.
    If you need to use the image outside of Nais, e.g. locally in a development environment, you should [push the image to another registry](./use-image-outside-nais.md).
