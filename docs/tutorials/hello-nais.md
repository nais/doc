---
tags: [tutorial]
---
# :wave: Hello NAIS

This tutorial will take you through the process of getting a simple application up and running on NAIS.

## Prerequisites

- You have a GitHub account connected to your GitHub organization (e.g. `navikt`)
- [naisdevice installed](../operate/naisdevice/how-to/install.md)
- [Member of a NAIS team](../explanations/team.md)
- [GitHub CLI installed](https://cli.github.com/)

???+ note "Conventions"

    Throughout this guide, we will use the following conventions:

    - `<MY-APP>` - The name of your NAIS application (e.g. `joannas-first`)
    - `<MY-TEAM>` - The name of your NAIS team (e.g. `onboarding`)
    - `<GITHUB-ORG>` - Your GitHub organization (e.g. `navikt`)
    - `<MY-ENV>` - The name of the environment you want to deploy to (e.g. `dev`)

    **NB!** Choose names with *lowercase* letters, numbers and dashes only.

## :gear: Setup

### Create your own GitHub repository

Create your own repo using the [nais/hello-nais](https://github.com/nais/hello-nais/) as a template.

You create a new repository through either the [GitHub UI](https://github.com/new?template_name=hello-nais&template_owner=nais) or through the GitHub CLI:

```bash
gh repo create <GITHUB-ORG>/<MY-APP> --template nais/hello-nais --private --clone
```

```bash
cd <MY-APP>
```

### Grant your team access to your repository

Open your repository:

```bash
gh repo view --web
```

Click on `Settings` -> `Collaborators and teams` -> `Add teams`.

Select your team, and grant them the `Admin` role.

You have now successfully created your own application repository and granted your team access to it.
In the next steps we will have a closer look at the files needed to make this application NAIS!

For this to happen, we need three files.

### Dockerfile

This describes the system your application will be running on.
It includes the base image, and the commands needed to build your application.
This is the payload you are requesting NAIS to run.
We have created this file for you, as there are no changes needed for this tutorial. Check it out.

### Application manifest

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

### GitHub Actions workflow

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
            CLUSTER: <MY_CLUSTER> # Replace (1)
            RESOURCE: .nais/app.yaml # This points to the file we created in the previous step
            VAR: image=${{ steps.docker-build-push.outputs.image }}
    ```

    1.  Cluster in this context is the same as the environment name. You can find the value in [workloads/environments](../workloads/reference/environments).

Excellent! We're now ready to deploy :rocket:

## :ship: Ship it

Previously we've made our application and created the required files for deployment.
In this part of the tutorial we will deploy our application to NAIS.

### Authorize the repository for deployment

This is required for the GitHub Actions workflow to be able to deploy your application.

Visit [Console](https://console.<<tenant()>>.cloud.nais.io). Select your team, and visit the `Repositories` tab.
Find your repository and click `Authorize`.

!!! note "Repository not visible?"

    Normally these permissions are automatically synchronized every 15 minutes, but if you don't see the repository here, force synchronization by clicking the `Synchronize team` button under the `Settings` panel.

### Commit and push your changes

Now that we have added the required files, it's time to commit and push them to GitHub.


```bash
git add .
git commit -m "FEAT: Add nais app manifest and github workflow"
git push origin main
```

### Observe the GitHub Actions workflow

When pushed, the GitHub Actions workflow will automatically start. You can observe the workflow by running the following command:

=== "CLI"

    ```bash
    gh run watch
    ```

=== "GitHub Web"

    - Visit your repository on [GitHub](https://github.com).
    - Navigate to `Actions`.
    - Select the latest workflow run.

### Visit your application
On successful completion, we can view our application at `https://<MY-APP>.<MY-ENV>.<<tenant()>>.cloud.nais.io`

Congratulations! You have now successfully deployed your first application to NAIS!
The next and most important step is to clean up after ourselves.

## :broom: Clean up

During this tutorial we have

- created a github repository
- added the required files for deployment
- deployed our application to NAIS

Now it's time to clean up after ourselves.

### Delete your repository

When you are finished with this guide you can delete your repository:

=== "CLI"

    ```bash
    gh repo delete <GITHUB-ORG>/<MY-APP>
    ```

=== "GitHub Web"

    - Visit your repository on [GitHub](https://github.com).
    - Navigate to `Settings`.
    - At the bottom of the page, click on `Delete this repository`
    - Confirm the deletion
