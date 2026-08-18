---
tags: [build, deploy, explanation]
---

# Deploys and the workload image

Nais deploys are done with the [Nais CLI](../../operate/cli.md). In a GitHub
Actions workflow, the [nais/setup](https://github.com/nais/setup) action installs
the CLI, and `nais apply` sends your [workload manifest](../../workloads/README.md)
to Nais.

This page explains how a deploy decides which image to run. For running the same
manifests across several environments, see [Environment mixins](environment-mixins.md).
For the steps, see [Build and deploy with GitHub Actions](../how-to/build-and-deploy.md);
for flags and file conventions, see the [deploy reference](../reference/deploy.md).

## How Nais knows which image to run

A running workload needs a container image. Nais gets the image from one of three
places, in order of precedence:

1. **`--set spec.image` at deploy time.** `nais apply` overrides the `spec.image`
   field in the manifest with the value you pass. This is how the build-and-deploy
   workflow hands the freshly built image to the deploy step.
2. **The `spec.image` field in the manifest.** If the manifest sets an image and
   you don't override it, that image is used.
3. **The image already running.** If the manifest has no image field and you
   deploy without `--set spec.image`, the CLI queries the Nais API and keeps
   whichever image is currently running.

The third case is what makes manifest-only deploys possible: you can change
`.nais` configuration and redeploy without rebuilding the image. This is faster,
because you skip the build and push, and it keeps configuration changes decoupled
from code changes.

## See also

- [Environment mixins](environment-mixins.md) — run one set of manifests across several environments.
