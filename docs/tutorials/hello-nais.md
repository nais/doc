---
tags: [tutorial]
---
# :wave: Hello Nais

This tutorial will take you through the process of getting a simple application up and running on Nais.

## Prerequisites

- You have a GitHub account connected to your GitHub organization (e.g. `navikt`)
- [Member of a Nais team](../explanations/team.md)
- [GitHub CLI installed](https://cli.github.com/)

???+ note "Conventions"

    Throughout this guide, we will use the following conventions:

    - `<MY-APP>` - The name of your Nais application (e.g. `joannas-first`)
    - `<MY-TEAM>` - The name of your Nais team (e.g. `onboarding`)
    - `<GITHUB-ORG>` - Your GitHub organization (e.g. `navikt`)
    - `<MY-ENV>` - The name of the environment you want to deploy to (e.g. `dev-gcp`)

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

### Authorize the repository for deployment

This is required for the GitHub Actions workflow to be able to deploy your application.

Visit [Nais Console](https://console.<<tenant()>>.cloud.nais.io). Select your team, and visit the `Repositories` tab.

Here you can add your repository to the list of authorized repositories. This authorizes the GitHub repository to perform deployments on behalf of your team.

### Dockerfile

This describes the system your application will be running on.
It includes the base image, and the commands needed to build your application.
This is the payload you are requesting Nais to run.
We have created this file for you, as there are no changes needed for this tutorial. Check it out.

### Application manifest

This file describes your application to the Nais platform so that it can run it correctly and provision the resources it needs.

Create a file called `app.yaml` in a `.nais`-folder.

```bash
mkdir .nais
touch .nais/app.yaml
```

Add the following content to the file, and insert the appropriate values in the placeholders on the highlighted lines:

???+ note ".nais/app.yaml"

    ```yaml hl_lines="4-5 8"
    apiVersion: nais.io/v1alpha1
    kind: Application
    metadata:
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

    Note the `ttl: 3h`. It sets the ["time to live"](../workloads/application/reference/application-spec.md/#ttl) for your app to 3 hours, in case you start on this tutorial and forget to clean up after. 

### GitHub Actions workflow

GitHub Actions uses the `Dockerfile` from step 1 and the `app.yaml` from step 2. to build and deploy your application to Nais.

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
            with:
              fetch-depth: 0 # Fetch all history for what-changed action
          - name: Determine what to do
            id: changed-files
            uses: "nais/what-changed@main"
            with:
              files: .nais/app.yaml # This points to the file we created in the previous step
          - name: Build and push image and SBOM to OCI registry
            if: steps.changed-files.outputs.changed != 'only-inputs'  # This skips the build if only the app.yaml has changed
            uses: nais/docker-build-push@v0
            id: docker-build-push
            with:
              team: <MY-TEAM> # Replace
          - name: Deploy to Nais
            uses: nais/deploy/actions/deploy@v2
            env:
              CLUSTER: <MY_ENV> # Replace (1)
              RESOURCE: .nais/app.yaml # same list as in changed-files step above
              WORKLOAD_IMAGE: ${{ steps.docker-build-push.outputs.image }}
              TELEMETRY: ${{ steps.docker-build-push.outputs.telemetry }}
    ```

    1.  Cluster in this context is the same as the environment name. You can find the value in [workloads/environments](../workloads/reference/environments.md).

Excellent! We're now ready to deploy :rocket:

## :ship: Ship it

Previously we've made our application and created the required files for deployment.
In this part of the tutorial we will deploy our application to Nais.


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

If you get a `403 PERMISSION_DENIED` error in the `Build and push image` step, you might not have added your repo to the Nais team as described above, or it might not have synchronized yet.

### Visit your application
On successful completion, we can view our application at `https://<MY-APP>.<MY-ENV>.<<tenant()>>.cloud.nais.io`

Congratulations! You have now successfully deployed your first application to Nais!
The next and most important step is to clean up after ourselves.

## :broom: Clean up

During this tutorial we have

- created a github repository
- added the required files for deployment
- deployed our application to Nais

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
