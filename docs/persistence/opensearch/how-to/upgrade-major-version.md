---
tags: [how-to, openSearch]
---

# Upgrade major version

When the OpenSearch instance was created, it was set up with the major version that was current at the time.
You can upgrade the OpenSearch instance to a newer major version via Nais Console.

Downgrading to an older major version is not supported.

## Prerequisites

- You've previously created an OpenSearch instance using [Nais Console](create.md)
    - If you created your OpenSearch instance using the [legacy method](create-legacy.md), see [Migrate opensearch management to Console](migrate-to-console.md).

## Steps

### 1. Prepare for the upgrade

Consult the [OpenSearch release notes](https://docs.opensearch.org/latest/breaking-changes/) to understand the changes in the new major version.

Ensure that your workload is compatible with the new major version of OpenSearch.

### 2. Upgrade the OpenSearch instance

1. Open [Nais Console :octicons-link-external-16:](https://console.<<tenant()>>.cloud.nais.io) in your browser
2. Select your team
3. Select **OpenSearch** in the sidebar menu
4. Select the OpenSearch instance you want to upgrade
5. Click the **Edit OpenSearch** button
6. In the form, select the desired major version of OpenSearch
7. Confirm by clicking the **Save changes** button

The upgrade process will take a few minutes. The **Status** column will show you the current state.

When the status changes to `Running`, the upgrade is complete.

### 3. Verify that the upgrade was successful

Verify that your workload is functioning as expected after the upgrade.
