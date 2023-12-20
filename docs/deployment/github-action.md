# Build and deploy with Github Actions

This how-to guide describes how to build and deploy your application using [Github Actions](https://help.github.com/en/actions/automating-your-workflow-with-github-actions) and the NAIS deploy action. 

## Prerequisites
- You're part of a NAIS team
- A Github repository where the NAIS team has access
- The repository contains a valid [nais.yaml](/docs/manifest.md)

### 1. Authorize your Github repository for deployment

1. Open [NAIS console](https://console.nav.cloud.nais.io) in your browser and select your team.
2. Select the `Repositories` tab
3. Find the repository you want to deploy from, and click `Authorize`

### 2. Create a Github workflow
Create a new file in your repository under `.github/workflows/` called `main.yml` with the following content:

```yaml
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
    - name: Push docker image to GAR
      uses: nais/docker-build-push@v0
      id: docker-build-push
      with:
        team: myteam # Replace
        identity_provider: ${{ secrets.NAIS_WORKLOAD_IDENTITY_PROVIDER }} # Provided as Organization Secret
        project_id: ${{ vars.NAIS_MANAGEMENT_PROJECT_ID }} # Provided as Organization Variable
    - name: Deploy to NAIS
      uses: nais/deploy/actions/deploy@v2
      env:
        CLUSTER: target-cluster # Replace
        RESOURCE: nais.yaml
        VAR: image=${{ steps.docker-build-push.outputs.image }}

```

This example workflow is a minimal example that builds, signs, and pushes your container image to the image registry.
It then deploys the `nais.yaml`, injecting the image tag from the previous step.

If you already have a workflow and/or require more advanced configuration - just copy the relevant parts from the example above.

When this file is pushed to the `main` branch, the workflow will be triggered and you are all set. 
