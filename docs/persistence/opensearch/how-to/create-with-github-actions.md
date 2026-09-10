---
tags: [how-to, opensearch, github-actions]
---

# Create OpenSearch with GitHub Actions

<<gcp_only("OpenSearch")>>

## Prerequisites

- You're part of a [Nais team](../../../explanations/team.md)
- Your repository is [authorized for your Nais team in Console](../../../build/how-to/build-and-deploy.md#authorize-your-github-repository-for-deployment)

## Create the manifest

Create `.nais/opensearch.yaml`:

```yaml title=".nais/opensearch.yaml"
version: v1
type: OpenSearch
name: myopensearch
spec:
  http:
    maxContentLength: 100Mi
  indices:
    queryBoolMaxClauseCount: 1024
  memory: 4GB
  shardIndexingPressure:
    enabled: true
  storageGB: 80
  tier: SingleNode
  version: "3.3"
```

Change the name and configuration for your needs. See the [complete generated example](../reference/opensearch-example.md) and [OpenSearch manifest reference](../reference/opensearch-spec.md).

Set `spec.version` to a supported version listed in the manifest reference. To upgrade, check the [OpenSearch breaking changes](https://docs.opensearch.org/latest/breaking-changes/), update `spec.version`, and apply the manifest again. Downgrades are not supported.

## Create the workflow

Create `.github/workflows/deploy-opensearch.yaml`:

```yaml title=".github/workflows/deploy-opensearch.yaml"
name: Deploy OpenSearch

on:
  push:
    branches:
      - main
    paths:
      - .nais/opensearch.yaml
  workflow_dispatch:

permissions:
  contents: read
  id-token: write

jobs:
  deploy:
    runs-on: ubuntu-latest
{% if tenant() == "test-nais" %}
    env:
      NAIS_API_TENANT: test-nais
{% endif %}
    steps:
      - uses: actions/checkout@v6
      - name: Set up the Nais CLI
        uses: nais/setup@v1
      - name: Apply OpenSearch manifest
        run: nais apply .nais/opensearch.yaml --team <MY-TEAM> --environment <MY-ENV>
```

Replace `<MY-TEAM>` with your Nais team and `<MY-ENV>` with a [GCP environment available to your tenant](../../../workloads/reference/environments.md), such as `dev-gcp` or `prod-gcp` for NAV.

The example uses major action tags for readability. Pin actions to full commit SHAs in production, and use [Dependabot](../../../build/how-to/dependabot-auto-merge.md) to keep them updated. See GitHub's [secure use reference :octicons-link-external-16:](https://docs.github.com/en/actions/reference/security/secure-use#using-third-party-actions).

Commit and push both files to `main`. The push trigger runs when the manifest changes. If you only change the workflow, run it manually from the **Actions** tab in GitHub.

A manual run applies the manifest from the selected Git ref, regardless of the `paths` filter.

## Next steps

:dart: [Use OpenSearch in your workload](use-in-workload.md)
