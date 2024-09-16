---
tags: [build, deploy, explanation, services]
---

# Build and deploy

To make your application available to others, you need to build and deploy it.

NAIS attempts to make this as simple as possible by providing a set of composable [GitHub Actions](https://docs.github.com/en/actions).

Use these actions to compose your own build and deploy pipeline through [Github Actions workflows](https://docs.github.com/en/actions/using-workflows). 

## Lead Time for Changes

> The amount of _time_ it takes a _commit_ to get into _production_

To further support [DORA metrics](https://dora.dev/guides/dora-metrics-four-keys/) we use [tracing](../observability/tracing/) directly in the build pipeline.
This will allow you to measure the time it takes for your team to deliver new code to production.

With these metrics you can also get a better view if changes to your pipeline affect the lead time for change.

## GitHub Actions

:books: [nais/docker-build-push](https://github.com/nais/docker-build-push)

:books: [nais/deploy](https://github.com/nais/deploy/tree/master/actions/deploy)

See the respective GitHub Action links for detailed configuration options.

## What's next

:dart: [Build and deploy with Github Actions](how-to/build-and-deploy.md)

:dart: [Set up auto-merge with Dependabot](how-to/dependabot-auto-merge.md)
