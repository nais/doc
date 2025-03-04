---
tags: [build, deploy, tracing, how-to]
---

# Set up tracing for your pipeline

To further support [DORA metrics](https://dora.dev/guides/dora-metrics-four-keys/) we use [tracing](../../observability/tracing/README.md) directly in the build pipeline.
This will allow you to measure the time it takes for your team to deliver new code to production.

!!! note "Lead time"

    > The amount of _time_ it takes a _commit_ to get into _production_

With these metrics you can also get a better view if changes to your pipeline affect the lead time for change.

Nais automatically collects telemetry data from your pipeline when you use the
`docker-build-push` action to build your Docker image.

The following manual step is required on your part to visualize that data in Grafana;
you must export the `TELEMETRY` environment variable when you deploy.

!!! note ".github/workflows/main.yml"

    ```yaml hl_lines="7 11"
    jobs:
      build_and_deploy:
        steps:
          - uses: actions/checkout@v4
          - name: Build and push Docker image
            uses: nais/docker-build-push@v0
            id: docker-build-push  # make sure this ID matches the step id below
          - name: Deploy to Nais
            uses: nais/deploy/actions/deploy@v2
            env:
              TELEMETRY: ${{ steps.docker-build-push.outputs.telemetry }}
    ```
