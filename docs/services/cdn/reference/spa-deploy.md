---
tags: [cdn, spa, deploy, reference]
title: SPA Deploy Action
---

This is the reference documentation for the [SPA Deploy GitHub action](../how-to/spa-deploy.md).

## Inputs

The action accepts the following inputs:

`app`

:   **Required**. Application name.

`team`

:   **Required**. Team name.

`source`

:   **Required**. Source directory.

`environment`

:   **Required**. Environment, for separating different versions of the app (free text field).
For custom domains the `environment` must be the cluster you want to deploy to.

`ingress`

:   **Required**. The ingress address to reach your SPA (comma separated list supported).

`ingressClass`

:   **Optional**. The `ingressClass` for your custom domain.

## Outputs

`url`

:   The URL for the Single Page Application.

    Available as `${{ steps.<job-id>.outputs.url }}`
    For example:

    ```yaml
    - id: spa-deploy
      name: Deploy SPA
      uses: nais/deploy/actions/spa-deploy/v2@master
      ...
    ```

    will be available in future steps as `${{ steps.spa-deploy.outputs.url }}`.
