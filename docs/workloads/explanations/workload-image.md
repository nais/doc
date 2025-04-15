---
tags: [build, deploy, explanation, workload-image, image]
---

# The workload image

You application is built into a container image, which we sometimes will call the workload image.

For nais to know which image to use for your workload, part of the deploy process includes telling the platform about the image.

This can be done in two ways, depending on how you set up your workflow.

## Directly in the manifest

The most direct way, is how it is done in the [hello nais](../../tutorials/hello-nais.md) tutorial.
Here we set the `image` field in the manifest to a template variable, which is then set to the image name when calling nais deploy.
Since this is just plain [templating](../../build/how-to/templating.md), you can set the image however you like with the variables you pass in to nais deploy.
The downside of this is that issues with templating is quite common, and the errors you get can be misleading because the templating is "invisible" to the platform.

## Using the `WORKLOAD_IMAGE` environment variable

The more advanced way is to use `nais/what-changed` to determine if you need to build a new image, and then use the environment variable `WORKLOAD_IMAGE` to set the image name when calling nais deploy.
This is the method used in our [build and deploy](../../build/how-to/build-and-deploy.md) guide.
In this case, you should not set `image` in the manifest, as the platform will use a different mechanism to find the image to use.

Instead, the `WORKLOAD_IMAGE` environment variable is used to set the image name.
This is the recommended way to set the image name, as it is more explicit and easier to debug.

The added advantage of this method is that if you deploy a manifest with no image, and you don't set `WORKLOAD_IMAGE`, the platform will look for the image used last time, and just use that.
This allows for deploying changes to the manifest without having to build an application image if there are no changes to the application code.
This can significantly speed up the deploy process for manifest changes, as you don't have to wait for the image to be built and pushed to the registry.
