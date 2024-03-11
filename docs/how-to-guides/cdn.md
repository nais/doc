---
tags:
- CDN
---

# Upload assets to the CDN

This how-to guide shows you how to upload assets to the [CDN](../explanation/cdn.md).

## 0. Prerequisites

- A [NAIS team](team.md).
- A GitHub repository that the team has access to.
- The repository needs to have a [GitHub workflow](github-action.md#2-create-a-github-workflow) that builds the assets you want to upload.

## 1. Authorize repository for upload

1. Open [NAIS console](https://console.<<tenant()>>.cloud.nais.io) in your browser and select your team.
2. Select the `Repositories` tab
3. Find the repository you want to deploy from, and click `Authorize`

## 2. Upload assets with the CDN action

In your Github Workflow, add the following step to upload your assets to the CDN:

```yaml
- name: Upload static files to NAV CDN
  uses: nais/deploy/actions/cdn-upload/v2@master
  with:
    team: <team slug> # Required, e.g. "team-name"
    tenant: <<tenant()>> # Optional, defaults to "nav"
    source: <The path to your build folder or assets>
    destination: <A destination you pick, like /my-app/dist>
    project_id: ${{ vars.NAIS_MANAGEMENT_PROJECT_ID }} # Provided as Organization Secret
    identity_provider: ${{ secrets.NAIS_WORKLOAD_IDENTITY_PROVIDER }} # Provided as Organization Variable
```

For more information on the inputs and outputs of the action, see the [CDN Reference](../reference/cdn.md).

## 3. Use the uploaded assets

The assets from the CDN will be available at 

{% if tenant() == "nav" %}
```
https://cdn.nav.no/<team>/<destination>
```

and

```
https://cdn.<<tenant()>>.cloud.nais.io/<team>/<destination>
```
{% else %}
```
https://cdn.<<tenant()>>.cloud.nais.io/<team>/<destination>
```
{% endif %}

CORS is automatically configured to accept `GET` from any
origin (*).
