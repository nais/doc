---
tags: [how-to, valkey, redis, github-actions]
---

# Create Valkey with GitHub Actions

<<gcp_only("Valkey")>>

## Prerequisites

- You're part of a [Nais team](../../../explanations/team.md)
- Your repository is [authorized for your Nais team in Console](../../../build/how-to/build-and-deploy.md#authorize-your-github-repository-for-deployment)

## Create the manifest

Create `.nais/valkey.yaml`:

```yaml title=".nais/valkey.yaml"
version: v1
type: Valkey
name: myvalkey
spec:
  memory: 1GB
  tier: HighAvailability
```

Change the name and configuration for your needs. See the [complete generated example](../reference/valkey-example.md) and [Valkey manifest reference](../reference/valkey-spec.md).

## Create the workflow

Create `.github/workflows/deploy-valkey.yaml`:

```yaml title=".github/workflows/deploy-valkey.yaml"
name: Deploy Valkey

on:
  push:
    branches:
      - main
    paths:
      - .nais/valkey.yaml
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
      - name: Apply Valkey manifest
        run: nais apply .nais/valkey.yaml --team <MY-TEAM> --environment <MY-ENV>
```

Replace `<MY-TEAM>` with your Nais team and `<MY-ENV>` with a [GCP environment available to your tenant](../../../workloads/reference/environments.md), such as `dev-gcp` or `prod-gcp` for NAV.

The example uses major action tags for readability. Pin actions to full commit SHAs in production, and use [Dependabot](../../../build/how-to/dependabot-auto-merge.md) to keep them updated. See GitHub's [secure use reference :octicons-link-external-16:](https://docs.github.com/en/actions/reference/security/secure-use#using-third-party-actions).

Commit and push both files to `main`. The push trigger runs when the manifest changes. If you only change the workflow, run it manually from the **Actions** tab in GitHub.

A manual run applies the manifest from the selected Git ref, regardless of the `paths` filter.

## Next steps

:dart: [Use Valkey in your workload](use-in-workload.md)
