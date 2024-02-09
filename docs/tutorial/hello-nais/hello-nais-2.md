---
tags: [tutorial]
---
# Part 2 - Make it NAIS

In the previous step, we created a repository for our application.
This part of the tutorial will show how to make your application NAIS.

For this to happen, we need three files.

### 1. Dockerfile

This describes the system your application will be running on.
It includes the base image, and the commands needed to build your application.
This is the payload you are requesting NAIS to run.
We have created this file for you, as there are no changes needed for this tutorial.

### 2. Application manifest

This file describes your application to the NAIS platform so that it can run it correctly and provision the resources it needs.

Create a file called `app.yaml` in a `.nais`-folder.

```bash
mkdir .nais
touch .nais/app.yaml
```

Add the following content to the file, and insert the appropriate values in the placeholders on the highlighted lines:

???+ note ".nais/app.yaml"

    ```yaml hl_lines="6-8 11"
    apiVersion: nais.io/v1alpha1
    kind: Application

    metadata:
      labels:
        team: <MY-TEAM>
      name: <MY-APP>
      namespace: <MY-TEAM>
    spec:
      ingresses:
        - https://<MY-APP>.<MY-ENV>.<<tenant()>>.cloud.nais.io
      image: {{image}}
      image: {{image}}
      port: 8080
      ttl: 3h
      replicas:
        max: 1
        min: 1
      resources:
        requests:
          cpu: 50m
          memory: 32Mi
    ```

### 3. GitHub Actions workflow

GitHub Actions uses the `Dockerfile` from step 1 and the `app.yaml` from step 2. to build and deploy your application to NAIS.

Create a file called `main.yaml` in a `.github/workflows`-folder.

```bash
mkdir -p .github/workflows
touch .github/workflows/main.yaml
```

Add the following content to the file, and insert the appropriate values in the placeholders on the highlighted lines:
???+ note ".github/workflows/main.yaml"

    ```yaml hl_lines="19 25"
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
            team: <MY-TEAM> # Replace
            identity_provider: ${{ secrets.NAIS_WORKLOAD_IDENTITY_PROVIDER }} # Provided as Organization Secret
            project_id: ${{ vars.NAIS_MANAGEMENT_PROJECT_ID }} # Provided as Organization Variable
        - name: Deploy to NAIS
          uses: nais/deploy/actions/deploy@v2
          env:
            CLUSTER: <MY_CLUSTER> # Replace
            RESOURCE: .nais/app.yaml # This points to the file we created in the previous step
            VAR: image=${{ steps.docker-build-push.outputs.image }}
    ```

Excellent! We're now ready to deploy. :octicons-rocket-24:
