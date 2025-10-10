---
title: Upgrade major version
tags: [postgres, upgrade, how-to]
---

This page describes how to upgrade the major version of your PostgreSQL database.

## Preparations

Before doing a major version upgrade, consult the [Google Cloud SQL documentation](https://cloud.google.com/sql/docs/postgres/upgrade-major-db-version) for any preparation that needs to be done.

!!! warning

    Upgrading requires the instance to become unavailable for a period of time, depending on the size of your database.
    Expect a downtime of **10 minutes or more**.

    We recommend that you schedule your upgrade to a time when your application can be offline.

## Choose a new major version

Select a new major version of PostgreSQL that you want to upgrade to.
For safe upgrades, it is recommended to only do one major version at a time.

The full list of supported versions can be found in the [application spec reference](../../../workloads/application/reference/application-spec.md#gcpsqlinstancestype).

## Change the major version

To change the major version, modify the `type` field in your application manifest:

```yaml title="app.yaml" hl_lines="4"
spec:
  gcp:
    sqlInstances:
      - type: POSTGRES_17
```

Commit and push the changes to your application repository.

The upgrade will start the next time you [deploy your application](../../../build/how-to/build-and-deploy.md).
