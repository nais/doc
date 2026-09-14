---
tags: [build, explanation]
---

# Applying a manifest

`nais apply` sends a workload manifest to the Nais API. The platform reconciles
the desired state — whether you're shipping new code, changing configuration, or
updating resources, it's the same operation.

## How Nais resolves the image

A running workload needs a container image. Nais resolves it from one of three
places, in order of precedence:

1. **`--set spec.image` at apply time.** The value you pass overrides the
   `spec.image` field in the manifest. This is how a build-and-deploy workflow
   hands the freshly built image to the apply step.
2. **The `spec.image` field in the manifest.** If the manifest sets an image and
   you don't override it, that image is used.
3. **The image already running.** If neither the flag nor the manifest provides
   an image, the CLI queries the Nais API and keeps the image currently running.

The third case decouples configuration changes from code changes: you can update
`.nais` manifests and apply without rebuilding or pushing an image.
