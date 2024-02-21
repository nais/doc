---
tags:
- CDN
---

# CDN

This how-to guide shows you how to upload files to the [CDN](../explanation/workloads/cdn.md).

## 0. Prerequisites

- A [NAIS team](team.md).
- A GitHub repository that the team has access to.
- The repository must be [authorized for deployment](github-action.md) from GitHub Actions.
- The repository needs to have a [GitHub workflow](github-action.md#2-create-a-github-workflow) that builds the assets you want to upload.

## 1. Use the CDN action

In your Github Workflow, add the following step to upload your assets to the CDN:

```yaml
- name: Upload static files to NAV CDN
  uses: navikt/frontend/actions/cdn-upload/v2
  with:
    team-name: <Your team name>
    source: <The path to your build folder or assets>
    destination: <A destination you pick, like /my-app/dist>
```

For more information on the inputs and outputs of the action, see the [CDN Reference](../reference/cdn.md).

## 2. Use the uploaded assets

The assets from the CDN will be available at 

```
https://cdn.nav.no/<your team name>/<your destination>
```

CORS is automatically configured to accept `GET` from any
origin (*).
