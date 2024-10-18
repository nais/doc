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

`ingress`

:   **Required**. The ingress address to reach your SPA (comma separated list supported).

`ingressClass`

:   **Optional**. The `ingressClass` for your custom domain.

`cluster`

:   **Optional**. The cluster to deploy your SPA in.

`project_id`

:   **Required**. Set this to `${{ vars.NAIS_MANAGEMENT_PROJECT_ID }}`.

`identity_provider`

:   **Required**. Set this to `${{ secrets.NAIS_WORKLOAD_IDENTITY_PROVIDER }}`.

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
