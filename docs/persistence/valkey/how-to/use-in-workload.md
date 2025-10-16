---
tags: [how-to, valkey, redis]
---

# Use Valkey in your workload

This guide will show you how to connect your workload to a previously created Valkey instance.

## Prerequisites

- You're part of a [Nais team](../../../explanations/team.md)
- You have previously created a Valkey for your team, either:
    - [via Console](create.md), or
    - [explicitly](create-explicit.md)

## Steps

### 1. Add reference to Valkey instance in workload manifest

In your workload manifest, add the following lines to reference the Valkey instance:

```yaml title="nais.yaml" hl_lines="2-4"
spec:
  valkey:
    - instance: $NAME
      access: read # read | readwrite | write | admin
```

Replace `$NAME` with the name of your Valkey instance.
If you created your Valkey explicitly, exclude the `valkey-<TEAM>-` prefix.

The `access` field defines the access level your workload will have to the Valkey instance.
Choose the access level that fits your use case.

See the available access levels in the [Valkey reference](../reference/README.md#access-levels).

### 2. Find Valkey environment variables

When the workload is deployed, the Nais platform will inject the necessary environment variables to connect to the Valkey instance.

See the available environment variables in the [Valkey reference](../reference/README.md#environment-variables).

### 3. Use a Valkey client library

Use a Valkey client library to connect to the Valkey instance using the injected environment variables.
Many Redis client libraries will also be compatible with Valkey.

You can find a non-exhaustive list of Valkey clients over at the official Valkey page: <https://valkey.io/clients/>.
