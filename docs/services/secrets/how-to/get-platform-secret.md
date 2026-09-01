---
tags: [secrets, how-to, cli]
---

# Get a platform-managed secret value using the CLI

This guide shows you how to look up and retrieve the value of a platform-managed secret for one of your workloads using the [Nais CLI](https://cli.nais.io).

Platform-managed secrets are provisioned by Nais on behalf of your workload, but may be needed for local development or debugging. They can also be seen in [Nais Console](https://console.nais.io) in the "Instance Groups" page for your workload.

## Prerequisites

- [Nais CLI](https://cli.nais.io) installed and authenticated
- [`jq`](https://jqlang.org) (or similar JSON tool) installed
- Member of the [Nais team](../../../explanations/team.md) that owns the workload

## Steps

### 1. Find the secret name

List the environment variables for your workload and find the one you want, noting the secret it comes from:

```shell
nais app env <MY-APP> --environment <MY-ENV> --output json \
  | jq '.[] | select(.name == "<MY-ENV-VAR>") | .source.name'
```

!!! tip
    If you're unsure which environment variable name to use, run the command without the `jq` filter to see all available variables:

    ```shell
    nais app env <MY-APP> --environment <MY-ENV>
    ```

The output is the name of the secret that contains the variable, for example:

```
"azure-my-app-b2493dfe-2026-32"
```

### 2. Retrieve the secret value

Fetch the full contents of that secret, providing a reason for audit purposes:

```shell
nais secret get <SECRET-NAME> --environment <MY-ENV> --with-values --reason "<MY-REASON>" --output json
```

Replace `<MY-REASON>` with a short description of why you need access, such as a ticket reference or a brief explanation.

## Combined

You can look up the secret name and retrieve its values in a single pipeline:

```shell
nais secret get \
  "$(nais app env <MY-APP> --environment <MY-ENV> --output json \
    | jq -r '.[] | select(.name == "<MY-ENV-VAR>") | .source.name')" \
  --environment <MY-ENV> --with-values --reason "<MY-REASON>" --output json
```

## Related pages

:books: [About secrets](../README.md)
