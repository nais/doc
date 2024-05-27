---
tags: [build, deploy, how-to]
---

# How to migrate from GitHub Container Registry (GHCR) to Google Artifact Registry (GAR)

## Migrate

You can switch from GHCR to GAR by following these steps
to update your current GitHub workflow. Let's simplify this by taking an
example of a workflow using GHCR and show how you can to change it to GAR.

The [docker-build-action](https://github.com/nais/docker-build-push) is employed for building and publishing the
Docker image to GAR.
Subsequently, the [deploy-action](https://github.com/nais/deploy/tree/master/actions/deploy) facilitates the
deployment of the application to a cluster.

### Example workflow

```yaml
name: Build, push, and deploy

on: [ push ]

env:
  IMAGE: ghcr.io/navikt/my-team/my-app:${{ github.sha }}

jobs:
  build:
    runs-on: ubuntu-latest
    permissions: write-all
    steps:
      - uses: actions/checkout@v4
      - name: Build and test my-app
        run: some build steps..
      - name: Build and publish Docker image
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          echo ${GITHUB_TOKEN} | docker login docker.pkg.github.com -u ${GITHUB_REPOSITORY} --password-stdin
          echo ${GITHUB_TOKEN} | docker login ghcr.io -u ${{github.actor}} --password-stdin
          docker build -t ${IMAGE} .
          docker push ${IMAGE}

  deploy:
    name: Deploy to NAIS
    runs-on: ubuntu-latest
    needs: [ build ]
    steps:
      - uses: actions/checkout@v4
      - uses: nais/deploy/actions/deploy@v1
        env:
          CLUSTER: target-cluster
          RESOURCE: nais.yaml
          VAR: image=${{ env.IMAGE }}
```

### Modify workflow

Initially, eliminate the environment variable: `IMAGE: ghcr.io/navikt/my-team/my-app:${{ github.sha }}`, as
the `nais/docker-build-action`, automatically generates this value and outputs it as the `image` variable.

```yaml
europe-north1-docker.pkg.dev/nais-management-233d/my-team/my-app
```

The resulting image reference is composed of the following:

* Registry: `europe-north1-docker.pkg.dev`
* Google Cloud Project: `nais-management-233d`
* Team: `my-team`
* Application: `my-app`

#### Build and publish Docker image

The tag is automatically generated by the `nais/docker-build-action` or can be specified as input to
the [action](https://github.com/nais/docker-build-push).

```yaml
  - name: Build and publish Docker image
    env:
      GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
    run: |
      echo ${GITHUB_TOKEN} | docker login docker.pkg.github.com -u ${GITHUB_REPOSITORY} --password-stdin
      echo ${GITHUB_TOKEN} | docker login ghcr.io -u ${{github.actor}} --password-stdin
      docker build -t ${IMAGE} .
      docker push ${IMAGE}
```

```yaml
  - name: Push docker image to GAR and sign image
    uses: nais/docker-build-push@v0
    id: docker-build-push
    with:
      team: my-team
      identity_provider: ${{ secrets.NAIS_WORKLOAD_IDENTITY_PROVIDER }} # Provided as Organization Secret
      project_id: ${{ vars.NAIS_MANAGEMENT_PROJECT_ID }} # Provided as Organization Variable
```

* The id `docker-build-push` is a named id of the job step.

* `identity_provider` and `project_id` are provided as Organization Secrets and Variables, respectively. Please refer
  to [GitHub Secrets](https://docs.github.com/en/actions/reference/encrypted-secrets) for more information.

* `team` is the name of your team, and must be provided as input to the action.

#### Image reference

The `build` job outputs the image reference as `image`, and the `deploy` job can reference this output
as `needs.build.outputs.image`

```yaml
    env:
      CLUSTER: target-cluster # Replace
      RESOURCE: nais.yaml
      VAR: image=${{ env.IMAGE }}
```

```yaml
    env:
      CLUSTER: target-cluster # Replace 
      RESOURCE: nais.yaml
      VAR: image=${{ needs.build.outputs.image }}
```

#### NAIS Salsa (SLSA - Supply Chain Levels for Software Artifacts)

[SLSA](https://slsa.dev/) is short for Supply chain Levels for Software Artifacts pronounced salsa.
It is a security framework, essentially a checklist comprising standards and controls aimed at preventing tampering,
enhancing integrity, and securing both packages and infrastructure within our projects.

The `nais/docker-build-push` action automatically signs your image with [cosign](https://github.com/sigstore/cosign),
and uploads the attestation, the result can be reviewed in your team tab
in [NAIS Console](https://console.<<tenant()>>.cloud.nais.io).
For more information about Salsa, please refer to [NAIS Salsa](../../services/salsa.md).

#### Workflow permissions

Permissions for the workflow should be scoped to ensure that the workflow you are constructing has sufficient access
to perform its tasks, please modify the following:

```yaml
  permissions: write-all
```

```yaml
  permissions:
    contents: read
    id-token: write
```

The reason why you only should set explicit permissions for a workflow `job`, is because it
brings us into a more 'fine-grained' access model, and makes us a bit less vulnerable to attacks through things like
malicious actions and NPM packages or other elements that can execute code in the workflows.

The `nais/docker-build-push` action requires the `id-token:write` permission to be able to
authenticate with the Google Cloud Platform. The `contents:read` permission is required to be able to clone and build.

For more information about permissions, please refer
to [The GitHub Blog Post](https://github.blog/changelog/2021-04-20-github-actions-control-permissions-for-github_token/)

#### Authorize your workflow

The use of `secrets.NAIS_DEPLOY_APIKEY` is deprecated, and will be removed in the future.

For more information on how to authorize your workflow, please refer
to [Authorize your workflow](build-and-deploy.md#1-authorize-your-github-repository-for-deployment)

### Finalized workflow

```yaml
name: Build, push, and deploy

on: [ push ]

jobs:
  build:
    name: Build and push Docker container
    runs-on: ubuntu-latest
    permissions:
      contents: read
      id-token: write
    outputs:
      image: ${{ steps.docker-build-push.outputs.image }}
    steps:
      - uses: actions/checkout@v4
      - name: Build and test my-app
        run: some build steps..
      - uses: actions/checkout@v4
      - name: Push docker image to GAR
        uses: nais/docker-build-push@v0
        id: docker-build-push
        with:
          team: myteam # Replace
          identity_provider: ${{ secrets.NAIS_WORKLOAD_IDENTITY_PROVIDER }} # Provided as Organization Secret
          project_id: ${{ vars.NAIS_MANAGEMENT_PROJECT_ID }} # Provided as Organization Variable

  deploy:
    name: Deploy to NAIS
    needs: build
    runs-on: ubuntu-latest
    permissions:
      contents: read
      id-token: write
    steps:
      - uses: actions/checkout@v4
      - uses: nais/deploy/actions/deploy@v1
        env:
          CLUSTER: target-cluster # Replace
          RESOURCE: nais.yaml
          VAR: image=${{ needs.build.outputs.image }}
```

The id `docker-build-push` is the id of the previous job step, there is where your new image will be outputted. In this
example we divided our workflow into two jobs, `build` and `deploy`. The `deploy` job depends on the `build` job, and
will not run unless the `build` job is successful. That is why we can reference the output of the `build` job as
`needs.build.outputs.image`.

## Related documentation

- :dart: [Build and deploy with Github Actions](build-and-deploy.md)