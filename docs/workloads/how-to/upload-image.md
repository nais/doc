# Upload third-party image to image repository

This how-to guide will show you how to upload a Docker image to your team's image repository.

## Prerequisites

- [Nais CLI](../../operate/cli/how-to/install.md) installed.
- A Docker runtime installed and running on your machine

## Log into Nais

```bash
nais login
```

## Register the Docker registry

```bash
gcloud auth configure-docker europe-north1-docker.pkg.dev
```

## Ensure you have the image locally

Ensure the desired image is available on your machine by pulling it from its source or building it locally. For example:

```bash
docker pull repository/my-image:tag --platform linux/amd64
```

!!! note "Specify the platform"
    Note that we are adding the `--platform linux/amd64` flag to ensure that the image we are pulling is compatible with the Nais platform.
    By default the architecture of the image will be the same as the host machine, which might not work.

## Locate the image repository URL

Find the image repository URL on the settings page in the Nais console

`https://console.<<tenant()>>.cloud.nais.io/team/<MY-TEAM>/settings`

The URL will be on this format:

`europe-north1-docker.pkg.dev/nais-management-<ID>/<MY-TEAM>`

## Tag the image

```bash
docker tag repository/my-image:tag europe-north1-docker.pkg.dev/nais-management-<ID>/<MY-TEAM>/my-image:tag
```

## Push the image

```bash
docker push europe-north1-docker.pkg.dev/nais-management-<ID>/<MY-TEAM>/my-image:tag
```

