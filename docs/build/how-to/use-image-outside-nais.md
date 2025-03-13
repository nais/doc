---
tags: [how-to, build, image]
---

# Using the image outside of Nais

When using the [nais/docker-build-push](https://github.com/nais/docker-build-push) action, the image is pushed to a registry that is meant for use within the Nais platform.
If you need to use the image outside of Nais, e.g. locally in a development environment, you should push the image to another registry.

## Push to Github Container Registry

After the image is built by `nais/docker-build-push`, you can push it to the Github Container Registry (GHCR) by adding the following step to your workflow:

- `packages: write` permission is required to push images to the GHCR.
- Step to retag the image after it has been built.

```yaml hl_lines="13 21-26"
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
      packages: write
    steps:
      - uses: actions/checkout@v4
      - name: Build and push image and SBOM to OCI registry
        uses: nais/docker-build-push@v0
        id: docker-build-push
        with:
          team: <MY-TEAM> # Replace
      - name: Push image to ghcr.io
        run: |
          # Log in to the Github Container Registry
          echo "${{ secrets.GITHUB_TOKEN }}" | docker login ghcr.io -u ${{ github.actor }} --password-stdin
          # Tag the image, e.g. ghcr.io/owner/repo:latest
          docker buildx imagetools create -t ghcr.io/${{ github.repository }}:latest ${{ steps.docker-build-push.outputs.image }}
      - name: Deploy to Nais
        uses: nais/deploy/actions/deploy@v2
        env:
          CLUSTER: <MY-CLUSTER> # Replace (1)
          RESOURCE: .nais/app.yaml #, topic.yaml, statefulset.yaml, etc.
          VAR: image=${{ steps.docker-build-push.outputs.image }}
          TELEMETRY: ${{ steps.docker-build-push.outputs.telemetry }}
```

## Even more control

If you need more control of how the image is built, e.g. supporting more platforms etc, you can use the [nais/login action](https://github.com/nais/login) to log in to the registry
provided by Nais, and build the image using e.g. [docker/build-push-action](https://github.com/docker/build-push-action).
You can also use the [nais/attest-sign](https://github.com/nais/attest-sign) action to sign the image before pushing it to the registry.

See the [nais/docker-build-push action file](https://github.com/nais/docker-build-push/blob/main/action.yml) for a complete example.
