---
tags: [opensearch, how-to]
---

# Get temporary OpenSearch credentials

Use the [nais-cli](../../../operate/cli/README.md) to get temporary credentials for an OpenSearch instance.
This is useful for debugging, accessing the [dashboard](dashboard.md), or connecting from outside Nais.

```shell
nais opensearch credentials <instance> \
    --team <team> \
    --environment <environment> \
    --permission <access-level> \
    --ttl <duration>
```

where

- `<instance>` is the name of the OpenSearch instance. A list of your team's instances can be found in [Nais Console](<<tenant_url("console")>>).
- `<team>` is the name of the team that owns the instance.
- `<environment>` is the environment where the instance runs (e.g. `dev`, `prod`).
- `<access-level>` is one of the available [access levels](../reference/README.md#access-levels) (`read`, `write`, `readwrite`, `admin`).
- `<duration>` is how long the credentials should be valid (e.g. `1d`, `7d`, max `30d`).

The credentials are returned directly to stdout as environment variables. They expire automatically when the TTL runs out.
