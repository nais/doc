---
tags: [cdn, how-to]
---

# Upload assets to the CDN

This how-to guide shows you how to upload assets to the [CDN](../README.md).

## Prerequisites

- A [Nais team](../../../explanations/team.md).
- A GitHub repository that the team has access to.
- The repository needs to have a [GitHub workflow](../../../build/README.md) that builds the assets you want to upload.

## Authorize repository for upload

1. Open [Nais console](https://console.<<tenant()>>.cloud.nais.io) in your browser and select your team.
2. Select the `Repositories` tab
3. Input your repository (`organization/repository`) and press `Add`.

## Upload assets with the CDN action

In your Github Workflow, add the following step to upload your assets to the CDN.


```yaml
name: Push to CDN

on:
  push:
    branches:
      - 'main'

jobs:
  upload:
    runs-on: ubuntu-latest

    permissions:
      contents: 'read'
      id-token: 'write'

    steps:
      - uses: 'actions/checkout@v4'

      - name: Upload static files to CDN
        uses: nais/deploy/actions/cdn-upload/v2@master
        with:
          team: <team slug> # Required, e.g. "team-name"
{%- if tenant() != "nav" %}
          tenant: <<tenant()>> # Required, e.g. "nav"
{%- endif %}
          source: <The path to your build folder or assets>
          destination: <A destination you pick, like /my-app/dist>
  
      - run: echo uploaded file ${{ steps.upload.outputs.uploaded }}
```

For more information on the inputs and outputs of the action, see the [CDN Upload action reference](../reference/upload-assets.md).

## Use the uploaded assets

The assets from the CDN will be available at:

{% if tenant() == "nav" %}
```
https://cdn.nav.no/<team>/<destination>
```

and
{% endif %}

```
https://cdn.<<tenant()>>.cloud.nais.io/<team>/<destination>
```

CORS is automatically configured to accept `GET` from any origin (*).

## Related pages

:dart: Learn how to [manage CDN assets](manage-assets.md)
