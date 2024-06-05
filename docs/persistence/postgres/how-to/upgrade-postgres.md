---
title: Upgrade major version
tags: [postgres, upgrade, how-to]
---

Before doing a major version upgrade, you should check the Cloud SQL docs on [upgrading PostgreSQL for an instance](https://cloud.google.com/sql/docs/postgres/upgrade-major-db-version) for any preparation that needs to be done.

When you are ready, you can change `type` in your `nais.yaml` to a new major version of PostgreSQL, and redeploy, and the upgrade will start.
For safe upgrades, it is recommended to only do one major version at a time.

!!! warning
    Upgrading requires the instance to become unavailable for a period of time depending on the size of your database (expect 10 minutes or more of downtime).
    Be sure to schedule your upgrade when your application can be offline.
