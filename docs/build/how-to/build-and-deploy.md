---
tags: [build, deploy, how-to]
---

# Build and deploy with Github Actions

This how-to guide shows you how to build and deploy your application using [Github Actions](https://help.github.com/en/actions/automating-your-workflow-with-github-actions) and the NAIS deploy action.

## Prerequisites

- You're part of a [NAIS team](../../operate/how-to/create-team.md)
- A Github repository where the NAIS team has access
- The repository contains a valid [workload manifest](../../workloads/README.md)

## Authorize your Github repository for deployment

1. Open [NAIS Console](https://console.<<tenant()>>.cloud.nais.io) in your browser and select your team.
2. Select the `Repositories` tab
3. Input your repository (`organization/repository`) and press `Add`.

## Create a Github workflow

!!! note
    If you require a more advanced workflow, or already have one: copy the relevant parts from the example below.

!!! note ".github/workflows/main.yml"

    ```yaml hl_lines="19 25-26"
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
        steps:
          - uses: actions/checkout@v4
          - name: Build and push image and SBOM to OCI registry
            uses: nais/docker-build-push@v0
            id: docker-build-push
            with:
              team: <MY-TEAM> # Replace
              identity_provider: ${{ secrets.NAIS_WORKLOAD_IDENTITY_PROVIDER }} # Provided as Organization Secret
              project_id: ${{ vars.NAIS_MANAGEMENT_PROJECT_ID }} # Provided as Organization Variable
          - name: Deploy to NAIS
            uses: nais/deploy/actions/deploy@v2
            env:
              CLUSTER: <MY-CLUSTER> # Replace (1)
              RESOURCE: .nais/app.yaml #, topic.yaml, statefulset.yaml, etc.
              VAR: image=${{ steps.docker-build-push.outputs.image }}
              TELEMETRY: ${{ steps.docker-build-push.outputs.telemetry }}
              {%- if tenant() != "nav" %}
              DEPLOY_SERVER: deploy.<<tenant()>>.cloud.nais.io:443
              {%- endif %}
    ```

    1.  Cluster in this context is the same as the environment name. You can find the value in [workloads/environments](../workloads/reference/environments.md).

This example workflow is a minimal example that builds, signs, and pushes your container image to the image registry.
It then deploys the [app.yaml](../../workloads/application/reference/application-spec.md), injecting the image tag from the previous step.

When this file is pushed to the `main` branch, the workflow will be triggered and you are all set.

!!! info "Google Artifact Registry (GAR)"

    The [nais/docker-build-push GitHub action](https://github.com/nais/docker-build-push) builds and pushes images to the _Google Artifact Registry_ (GAR).

    This is a registry managed by NAIS and is the recommended way to store your container images for use in workloads on NAIS.

    We keep images that are deployed, as well as the last 10 versions for each image regardless of age. Versions older than 90 days are automatically deleted.
