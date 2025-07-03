---
title: Upgrade major version
tags: [postgres, upgrade, how-to]
---

!!! warning "Experimental feature"
    This feature is an alpha feature, and is subject to API change, instability or removal.
    See the [main Postgres page](../README.md) for more information.

This page describes how to upgrade the major version of your PostgreSQL database.

## Preparations

Before doing a major version upgrade, consult the [PostgreSQL Release Notes](https://www.postgresql.org/docs/release/) for any preparation that needs to be done.

## Choose a new major version

Select a new major version of PostgreSQL that you want to upgrade to.
For safe upgrades, it is recommended to only do one major version at a time.

The full list of supported versions can be found in the [application spec reference](../../../workloads/application/reference/application-spec.md#postgresclustermajorversion).

## Change the major version

To change the major version, modify the `majorVersion` field in your application manifest:

```yaml title="app.yaml" hl_lines="4"
spec:
  postgres:
    cluster:
      majorVersion: "17"
```

Commit and push the changes to your application repository.

The upgrade will start the next time you [deploy your application](../../../build/how-to/build-and-deploy.md).
