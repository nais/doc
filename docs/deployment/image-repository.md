# Image repository

All NAIS teams has their own repository where they store their images, as NAIS will only run images from known locations.

When using the [NAIS Github Action](https://github.com/nais/docker-build-push), the process of tagging and pushing the image to the registry is handled automatically.
Combining this with the [NAIS deploy action](https://doc.nais.io/deployment/) you can also get the newly produced image tag set automatically during deployment.

For NAV the address is https://console.cloud.google.com/artifacts/docker/nais-management-233d/europe-north1/.

## DIY

If you want to handle the image process yourself, you can find the URL to your teams repository on your teams page in NAIS Teams (https://teams.$tenant.cloud.nais.io).

## Images from unlisted registry

Re-tag the image and upload it to your teams repository.

```bash
docker pull unlisted/image:tag
docker tag unlisted/image:tag <team-repository>/imagename:tag
docker push <team-repository>/imagename:tag
```
