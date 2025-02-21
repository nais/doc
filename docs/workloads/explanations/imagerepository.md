# Image repository

Every team gets it's own image repository where they push the images they run on Nais.

When using the [nais/docker-build-push](https://github.com/nais/docker-build-push)-action in your workflow, this repository is used automatically.
 
## Image Restriction

Nais restricts the use of images from other image registries for two main reasons. 

1. We verify that the image has been uploaded either by a authorized Nais user or Github repository. 
2. The provided repository uses [Image Streaming](https://cloud.google.com/kubernetes-engine/docs/how-to/image-streaming), ensuring consistently fast start-up times when auto-scaling or during platform maintenance.

## Using third-party images

To use a third-party Docker image, you must upload it to your team’s repository. See the [Upload Third-Party Image](../how-to/upload-image.md) guide for instructions.
