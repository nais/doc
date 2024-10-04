---
title: Change the tier of your database instance
tags: [postgres, tier, how-to]
---

## Select tier

Choosing an appropriate tier depends on your application's requirements such as:

- the amount of data you expect to store and query
- the number of concurrent connections you expect to handle

The tier you choose will affect the performance and cost of your database.

See [the reference page for a list of available tiers](../reference/README.md#instance-tiers).

## Change tier

To change the tier, modify the `tier` field in your application manifest:

```yaml title="app.yaml" hl_lines="5"
spec:
  gcp:
    sqlInstances:
      - type: POSTGRES_16
        tier: db-custom-1-3840
        databases:
          - name: mydb
```

Commit and push the changes to your application repository.

The tier will be updated the next time you [deploy your application](../../../build/how-to/build-and-deploy.md).

Updating the tier results in your database being restarted, which means it will be unavailable for up to a few minutes.
